// src/lib/pdf-export.ts
import { getAllReadingsPerMonthAction } from "@/app/actions/reading";
import { HouseData } from "@/contexts/house.context";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import html2pdf from 'html2pdf.js';

export const exportPDF = async (house: HouseData, isPending: boolean, setIsPending: (value: boolean) => void, onReady: () => void, date?: { month: number; year: number }) => {
    if (!house) return;
    setIsPending(true);

    try {
        const result = await getAllReadingsPerMonthAction(house._id, date?.month || new Date().getMonth() + 1, date?.year || new Date().getFullYear());
        if (!result.success || !result.value) throw new Error("Hiba az adatok lekérésekor");

        // 1. Csoportosítás mérőórák szerint
        const groupedReadings = result.value.reduce((acc: Record<string, ReadingWithMeterInfo[]>, reading: ReadingWithMeterInfo) => {
            if (!acc[reading.meterName]) {
                acc[reading.meterName] = [];
            }
            acc[reading.meterName].push(reading);
            return acc;
        }, {});

        // 2. Konténer létrehozása a generáláshoz
        const element = document.createElement('div');
        element.style.width = '800px'; // Fix szélesség a PDF konzisztenciájához

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
                        <p><strong>Dátum:</strong> ${new Date().toLocaleDateString('hu-HU')}</p>
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
                                            <td>${new Date(r.date).toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                            <td><strong>${r.value.toLocaleString()} ${unit}</strong></td>
                                            <td class="${r.difference! > 0 ? 'diff-positive' : ''}">
                                                ${r.difference! > 0 ? '+' : ''}${r.difference?.toLocaleString()} ${unit}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    `;
        }).join('')}

                <div class="footer">
                    Ezt a jelentést a LakasInfo rendszer generálta. További részletekért látogasson el az applikációba.
                </div>
            </div>
        `;

        // 3. html2pdf opciók beállítása
        const opt = {
            margin: 0,
            filename: `Fogyasztasi_Jelentes_${house.name.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
        };

        // 4. PDF generálása és letöltése
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await html2pdf().set(opt as any).from(element).save();

        setIsPending(false);
        onReady();
    } catch (e) {
        setIsPending(false);
        console.error("PDF generálási hiba:", e);
    }
};