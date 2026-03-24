import { getAllReadingsPerMonthAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { ExportContainsOptions } from "./pdf-export"; // ExportContainsOptions típus importálása (ha egy fájlban vannak, hagyd ki)

// Használjuk ugyanazt a struktúrát, amit a PDF-nél is!
export interface ExportCSVOptions {
    house: HouseData;
    isPending: boolean;
    setIsPending: (value: boolean) => void;
    onReady: () => void;
    date?: {
        month: number | { start: number, end: number };
        year: number | { start: number, end: number };
    };
    containsOptions?: ExportContainsOptions;
}

export const exportCsv = async (options: ExportCSVOptions) => {
    const { house, isPending, setIsPending, onReady, date, containsOptions } = options;
    if (!house) return;
    setIsPending(true);

    try {
        // Használjuk ugyanazt az akciót, mint a PDF-nél, ami a hónapokat is tudja kezelni!
        const result = await getAllReadingsPerMonthAction(
            house._id,
            date?.month || new Date().getMonth() + 1,
            date?.year || new Date().getFullYear()
        );

        if (!result.success || !result.value) throw new Error("Hiba az adatok lekérésekor");

        let readings = result.value as ReadingWithMeterInfo[];

        // --- SZŰRÉSEK ALKALMAZÁSA (containsOptions) ---
        if (containsOptions) {
            // Ha megadták, hogy csak bizonyos mérőórákat kérnek (név alapján)
            if (containsOptions.containedMeterTypes) {
                const allowedMeters = containsOptions.containedMeterTypes;
                readings = readings.filter(r => allowedMeters.includes(r.meterName));
            }
        }

        // --- RENDEZÉS ---
        readings.sort((a, b) => {
            // Először óra neve alapján abc sorrendbe
            if (a.meterName !== b.meterName) return a.meterName.localeCompare(b.meterName);
            // Utána dátum szerint csökkenőbe
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // --- CSV OSZLOPOK (FEJLÉC ÉS SOROK) ÖSSZEÁLLÍTÁSA ---
        const headers = ["Mérőóra"];

        // Dinamikusan rakjuk össze a fejlécet a containsOptions alapján (ha meg van adva)
        if (!containsOptions || containsOptions.isContainedReadingDate !== false) headers.push("Rögzítés dátuma");
        if (!containsOptions || containsOptions.isContainedMeterValue !== false) headers.push("Rögzített állás");
        headers.push("Egység");
        if (!containsOptions || containsOptions.isContainedMeterDifference !== false) headers.push("Fogyasztás");

        // Ide jöhet még az isContainedPriceInfo logikája is, ha a reading-ben benne van az ár

        const rows = readings.map((r) => {
            const rowData: (string | number)[] = [`"${r.meterName}"`];

            if (!containsOptions || containsOptions.isContainedReadingDate !== false) {
                rowData.push(`"${new Date(r.date).toLocaleDateString("hu-HU")}"`);
            }
            if (!containsOptions || containsOptions.isContainedMeterValue !== false) {
                rowData.push(r.value.toLocaleString("hu-HU"));
            }

            rowData.push(`"${r.meterUnit}"`);

            if (!containsOptions || containsOptions.isContainedMeterDifference !== false) {
                rowData.push((r.difference || 0).toLocaleString("hu-HU"));
            }

            return rowData;
        });

        // CSV String összeállítása (A \uFEFF a BOM, hogy az Excel helyesen kezelje az ékezeteket)
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");

        // Fájlnév generálása
        let dateSuffix = new Date().toISOString().split("T")[0];
        if (date && typeof date.month === "object" && typeof date.year === "object") {
            dateSuffix = `${date.year.start}_${date.month.start}-tol_${date.year.end}_${date.month.end}-ig`;
        }

        const filename = `Fogyasztasi_Jelentes_${dateSuffix}.csv`;

        // --- MENTÉS / LETÖLTÉS ---
        if (Capacitor.isNativePlatform()) {
            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: csvContent,
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });

            await Share.share({
                title: "CSV Export",
                url: savedFile.uri,
            });
        } else {
            // WEB - Letöltés generálása
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        setIsPending(false);
        onReady();
    } catch (e) {
        console.error("CSV Export hiba:", e);
        setIsPending(false);
    }
};