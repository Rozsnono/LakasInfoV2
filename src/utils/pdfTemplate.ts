// utils/pdfTemplates.ts
import { HouseData } from "@/contexts/house.context";
import { ExportContainsOptions } from "@/lib/pdf-export";
import { ReadingWithMeterInfo } from "@/services/reading.service";
import { calculateCost } from "./costCalculator";

export const generateConsumptionReportHTML = (
    house: HouseData,
    groupedReadings: Record<string, ReadingWithMeterInfo[]>,
    options: ExportContainsOptions
): string => {

    // A dinamikus szakaszok (mérőórák és táblázatok) legenerálása
    const metersHtml = Object.entries(groupedReadings).filter(([meterName, readings]) => {
        const { containedMeterTypes } = options;
        return !containedMeterTypes || containedMeterTypes.includes(meterName);
    }).map(([meterName, readings]) => {
        const rList = readings as ReadingWithMeterInfo[];
        const unit = rList[0].meterUnit;
        const totalDiff = rList.reduce((sum, r) => sum + (r.difference || 0), 0);

        const { isContainedMeterValue, isContainedMeterDifference, isContainedReadingDate, isContainedPriceInfo } = options;



        // A sorok legenerálása (dátum szerint csökkenő sorrendben)
        const rowsHtml = rList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(r => `
                <tr>
                    ${isContainedReadingDate ? `<td>${new Date(r.date).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" })}</td>` : ''}
                    ${isContainedMeterValue ? `<td><strong>${r.value ? r.value.toLocaleString() + " " + unit : "N/A"}</strong></td>` : ''}
                    ${isContainedMeterDifference ? `<td class="${r.difference && r.difference > 0 ? "diff-positive" : ""}">${r.difference ? r.difference.toLocaleString() + " " + unit : "N/A"}</td>` : ''}
                    ${isContainedPriceInfo ? `<td>${calculateCost(r.tierLimit!, r.basePrice!, r.marketPrice!, r.difference!).toLocaleString("hu-HU", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} Ft</td>` : ''}
                </tr>
            `).join("");

        return `
            <div class="meter-section">
                <div class="meter-title">
                    <h2>${meterName}</h2>
                    <span class="total-badge">Összesen: ${totalDiff.toLocaleString()} ${unit}</span>
                </div>
                <table>
                    <thead>
                        <tr>
                            ${isContainedReadingDate ? "<th>Dátum</th>" : ''}
                            ${isContainedMeterValue ? "<th>Óraállás</th>" : ''}
                            ${isContainedMeterDifference ? "<th>Fogyasztás</th>" : ''}
                            ${isContainedPriceInfo ? "<th>Becsült ár</th>" : ''}
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                </table>
            </div>
        `;
    }).join("");

    // A teljes HTML dokumentum (CSS + Header + Meters + Footer)
    return `
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

            ${metersHtml}

            <div class="footer">
                Ezt a jelentést a LakasInfo rendszer generálta. További részletekért látogasson el az applikációba.
            </div>
        </div>
    `;
};