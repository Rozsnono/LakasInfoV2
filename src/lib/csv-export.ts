import { getAllReadingsAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

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

        if (date) {
            readings = readings.filter((r: ReadingWithMeterInfo) => {
                const d = new Date(r.date);
                return d.getFullYear() === date.year && d.getMonth() === date.month;
            });
        }

        readings.sort((a: ReadingWithMeterInfo, b: ReadingWithMeterInfo) => {
            if (a.meterName !== b.meterName) return a.meterName.localeCompare(b.meterName);
            return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        const headers = ["Meroora", "Datum", "Allas", "Egyseg", "Fogyasztas"];

        const rows = readings.map((r: ReadingWithMeterInfo) => [
            `"${r.meterName}"`,
            `"${new Date(r.date).toLocaleDateString("hu-HU")}"`,
            r.value,
            `"${r.meterUnit}"`,
            r.difference || 0,
        ]);

        const csvContent = "\uFEFF" + [headers, ...rows].map(e => e.join(";")).join("\n");

        const dateSuffix = date
            ? `${date.year}_${date.month + 1}`
            : new Date().toISOString().split("T")[0];

        const filename = `fogyasztas_jelentes_${dateSuffix}.csv`;

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