import { getAllReadingsPerMonthAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import html2pdf from "html2pdf.js";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { generateConsumptionReportHTML } from "@/utils/pdfTemplate";

interface ExportPDFOptions {
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

export interface ExportContainsOptions {
    containedMeterTypes?: string[] | null; // null = minden típus
    isContainedMeterValue?: boolean;
    isContainedMeterDifference?: boolean;
    isContainedReadingDate?: boolean;
    isContainedPriceInfo?: boolean;
}

export const exportPDF = async (options: ExportPDFOptions) => {
    const { house, isPending, setIsPending, onReady, date, containsOptions } = options;
    if (!house) return;
    setIsPending(true);

    try {
        const result = await getAllReadingsPerMonthAction(house._id, date?.month || new Date().getMonth() + 1, date?.year || new Date().getFullYear());
        if (!result.success || !result.value) throw new Error("Hiba az adatok lekérésekor");

        // Csoportosítás mérőórák szerint
        const groupedReadings = result.value.reduce((acc: Record<string, ReadingWithMeterInfo[]>, reading: ReadingWithMeterInfo) => {
            if (!acc[reading.meterName]) {
                acc[reading.meterName] = [];
            }
            acc[reading.meterName].push(reading);
            return acc;
        }, {});
        // DOM elem létrehozása és feltöltése az importált template-tel
        const element = document.createElement("div");
        element.style.width = "800px";
        element.innerHTML = generateConsumptionReportHTML(house, groupedReadings, containsOptions!);

        const filename = `Fogyasztasi_Jelentes_${new Date().toISOString().split('T')[0]}.pdf`;

        // PDF Generálási opciók
        const opt = {
            margin: [0.3, 0, 0.3, 0],
            filename: filename,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] }
        };

        // Készülékfüggő mentés / megosztás (Web vs Mobile App)
        if (Capacitor.isNativePlatform()) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const pdfBase64DataUri = await html2pdf().set(opt as any).from(element).outputPdf("datauristring");
            const base64Data = pdfBase64DataUri.split(",")[1];

            const savedFile = await Filesystem.writeFile({
                path: filename,
                data: base64Data,
                directory: Directory.Cache,
            });

            await Share.share({
                title: "Fogyasztási Jelentés",
                url: savedFile.uri,
            });
        } else {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await html2pdf().set(opt as any).from(element).save();
        }

        setIsPending(false);
        onReady();
    } catch (e) {
        setIsPending(false);
        console.error("PDF generálási hiba:", e);
    }
};