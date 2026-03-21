// src/lib/csv-export.ts
import { getAllReadingsAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";

export const exportCsv = async (
    house: HouseData,
    isPending: boolean,
    setIsPending: (value: boolean) => void,
    onReady: () => void,
    date?: { month: number; year: number }
) => {
    if (!house) return;
    setIsPending(true);

    try {
        const result = await getAllReadingsAction(house._id);
        if (!result.success || !result.value) throw new Error("Hiba az adatok lekérésekor");

        let readings = result.value;

        // 1. Szűrés, ha van megadva dátum
        if (date) {
            readings = readings.filter((r: ReadingWithMeterInfo) => {
                const d = new Date(r.date);
                return d.getFullYear() === date.year && d.getMonth() === date.month;
            });
        }

        // 2. Rendezés: Mérőóra név szerint, azon belül dátum szerint csökkenő
        readings.sort((a: ReadingWithMeterInfo, b: ReadingWithMeterInfo) => {
            if (a.meterName !== b.meterName) return a.meterName.localeCompare(b.meterName);
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        // 3. CSV Fejléc és sorok összeállítása
        const headers = ["Meroora", "Datum", "Allas", "Egyseg", "Fogyasztas"];

        const rows = readings.map((r: ReadingWithMeterInfo) => [
            `"${r.meterName}"`,
            `"${new Date(r.date).toLocaleDateString('hu-HU')}"`,
            r.value,
            `"${r.meterUnit}"`,
            r.difference || 0,
        ]);

        // 4. CSV tartalom generálása (vesszővel elválasztva)
        // BOM (\uFEFF) hozzáadása, hogy az Excel felismerje az UTF-8 kódolást és a magyar ékezeteket
        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");

        // 5. Letöltés indítása
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        // Fájlnév generálása: ha van szűrő, benne van a hónap is
        const dateSuffix = date
            ? `${date.year}_${date.month + 1}`
            : new Date().toISOString().split('T')[0];

        link.setAttribute("href", url);
        link.setAttribute("download", `fogyasztas_jelentes_${dateSuffix}.csv`);
        document.body.appendChild(link);

        link.click();

        // Takarítás
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        setIsPending(false);
        onReady();
    } catch (e) {
        console.error("CSV Export hiba:", e);
        setIsPending(false);
        // Itt nem használunk alertet a kérésednek megfelelően, a pending állapot jelzi a hibát vagy a console
    }
};