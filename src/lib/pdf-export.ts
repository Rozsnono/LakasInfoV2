import { getAllReadingsPerMonthAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import html2pdf from "html2pdf.js";
import { Capacitor } from "@capacitor/core";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";

export const exportPDF = async (house: HouseData, isPending: boolean, setIsPending: (value: boolean) => void, onReady: () => void, date?: { month: number | { start: number, end: number }; year: number | { start: number, end: number } }) => {
    if (!house) return;
    setIsPending(true);

    try {
        const result = await getAllReadingsPerMonthAction(house._id, date?.month || new Date().getMonth() + 1, date?.year || new Date().getFullYear());
        if (!result.success || !result.value) throw new Error("Hiba az adatok lekérésekor");

        const groupedReadings = result.value.reduce((acc: Record<string, ReadingWithMeterInfo[]>, reading: ReadingWithMeterInfo) => {
            if (!acc[reading.meterName]) {
                acc[reading.meterName] = [];
            }
            acc[reading.meterName].push(reading);
            return acc;
        }, {});

        const element = document.createElement("div");
        element.style.width = "800px";

        element.innerHTML = `
            <style>
                .report-container {
                    padding: 40px;
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    color: #1a1a1a;
                    background: #fff;
                }
                .header {
                    border-bottom: 3px solid #f43f5e;
                    padding-bottom: 20px;
                    margin-bottom: 40px;
                    display: flex;
                    justify-content: space-between;
                    page-break-inside: avoid;
                }
                .header-title h1 {
                    margin: 0;
                    font-size: 24px;
                    text-transform: uppercase;
                    font-style: italic;
                    font-weight: 900;
                    color: #f43f5e;
                }
                .header-info p {
                    margin: 2px 0;
                    color: #666;
                    font-size: 12px;
                }
                .meter-section {
                    margin-bottom: 30px;
                    page-break-inside: avoid;
                }
                .meter-title {
                    background: #f8fafc;
                    padding: 10px 15px;
                    border-radius: 8px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                    border: 1px solid #e2e8f0;
                }
                .meter-title h2 {
                    margin: 0;
                    font-size: 16px;
                    font-weight: 800;
                }
                .total-badge {
                    background: #f43f5e;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 900;
                    display: flex;
                    align-items: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 12px;
                }
                th {
                    text-align: left;
                    padding: 10px;
                    color: #64748b;
                    text-transform: uppercase;
                    font-size: 10px;
                    border-bottom: 1px solid #e2e8f0;
                }
                tr {
                    page-break-inside: avoid;
                }
                td {
                    padding: 10px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .diff-positive { color: #f43f5e; font-weight: bold; }
                .footer {
                    margin-top: 40px;
                    font-size: 9px;
                    color: #94a3b8;
                    text-align: center;
                    border-top: 1px solid #f1f5f9;
                    padding-top: 15px;
                    page-break-inside: avoid;
                }
            </style>

            <div class="report-container">
                <div class="header">
                    <div class="header-title">
                        <h1>Fogyasztási Jelentés</h1>
                        <div class="header-info">
                            <p><strong>Ingatlan:</strong> ${house.name}</p>
                            <p><strong>Cím:</strong> ${house.address || "Nincs megadva"}</p>
                        </div>
                    </div>
                    <div style="text-align: right; font-size: 12px; color: #666;">
                        <p><strong>Dátum:</strong> ${new Date().toLocaleDateString("hu-HU")}</p>
                        <p>LakasInfo App</p>
                    </div>
                </div>

                ${Object.entries(groupedReadings).map(([meterName, readings]) => {
            const rList = readings as ReadingWithMeterInfo[];
            const unit = rList[0].meterUnit;
            const totalDiff = rList.reduce((sum, r) => sum + (r.difference || 0), 0);

            return `
                        <div class="meter-section">
                            <div class="meter-title">
                                <h2>${meterName}</h2>
                                <span class="total-badge">Összesen: ${totalDiff.toLocaleString()} ${unit}</span>
                            </div>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Dátum</th>
                                        <th>Mérőállás</th>
                                        <th>Fogyasztás</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${rList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(r => `
                                        <tr>
                                            <td>${new Date(r.date).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" })}</td>
                                            <td><strong>${r.value.toLocaleString()} ${unit}</strong></td>
                                            <td class="${r.difference! > 0 ? "diff-positive" : ""}">
                                                ${r.difference! > 0 ? "+" : ""}${r.difference?.toLocaleString()} ${unit}
                                            </td>
                                        </tr>
                                    `).join("")}
                                </tbody>
                            </table>
                        </div>
                    `;
        }).join("")}

                <div class="footer">
                    Ezt a jelentést a LakasInfo rendszer generálta. További részletekért látogasson el az applikációba.
                </div>
            </div>
        `;

        const filename = `Fogyasztasi_Jelentes_${new Date().toISOString().split("T")[0]}.pdf`;

        const opt = {
            margin: [0.3, 0, 0.3, 0],
            filename: filename,
            image: { type: "jpeg" as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] }
        };

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