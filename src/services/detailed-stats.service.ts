import dbConnect from "@/lib/dbConnect";
import Reading from "@/models/reading.model";
import Meter, { IMeter } from "@/models/meter.model";
import mongoose from "mongoose";
import { ChartPoint, DetailedStatsData, MeterFilter, CategoryKey } from "@/types/stats";

export const DetailedStatsService = {
    async getDetailedStats(
        houseId: string,
        filter: MeterFilter,
        timeRange: string,
        customRange?: { start: string; end: string }
    ): Promise<DetailedStatsData> {
        await dbConnect();

        const now = new Date();
        let startDate: Date;
        let endDateLimit: Date;
        let prevStartDate: Date;
        let prevEndDateLimit: Date;

        if (timeRange === "custom" && customRange) {
            const [sY, sM] = customRange.start.split('.').map(Number);
            const [eY, eM] = customRange.end.split('.').map(Number);
            startDate = new Date(sY, sM - 1, 1);
            endDateLimit = new Date(eY, eM, 0, 23, 59, 59);

            const diffTime = endDateLimit.getTime() - startDate.getTime();
            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(prevEndDateLimit.getTime() - diffTime);
        } else {
            const monthsToView = timeRange === "6m" ? 6 : timeRange === "1y" ? 12 : 3;
            startDate = new Date(now.getFullYear(), now.getMonth() - monthsToView + 1, 1);
            endDateLimit = now;

            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(startDate.getFullYear(), startDate.getMonth() - monthsToView, 1);
        }

        const meterQuery: { houseId: mongoose.Types.ObjectId; type?: string } = {
            houseId: new mongoose.Types.ObjectId(houseId)
        };

        if (filter !== "all") {
            const typeMap: Record<string, string> = { electricity: "villany", gas: "gaz", water: "viz" };
            meterQuery.type = filter;
        }

        const filteredMeters = await Meter.find(meterQuery).lean() as unknown as (IMeter & { _id: mongoose.Types.ObjectId })[];

        const types = await Meter.distinct("type", { houseId: new mongoose.Types.ObjectId(houseId) }) as string[];

        const mIds = filteredMeters.map(m => m._id);

        const baseReadings = await Reading.aggregate([
            { $match: { meterId: { $in: mIds }, date: { $lt: startDate } } },
            { $sort: { date: -1 } },
            { $group: { _id: "$meterId", lastValue: { $first: "$value" } } }
        ]);

        const currentPeriodReadings = await Reading.find({
            meterId: { $in: mIds },
            date: { $gte: startDate, $lte: endDateLimit }
        }).sort({ date: 1 }).lean();

        const prevPeriodReadings = await Reading.find({
            meterId: { $in: mIds },
            date: { $gte: prevStartDate, $lte: prevEndDateLimit }
        }).sort({ date: 1 }).lean();

        let currentDiffSum = 0;
        currentPeriodReadings.forEach(r => { currentDiffSum += r.difference || 0; });

        let prevDiffSum = 0;
        prevPeriodReadings.forEach(r => { prevDiffSum += r.difference || 0; });

        const trendVal = prevDiffSum > 0 ? ((currentDiffSum - prevDiffSum) / prevDiffSum) * 100 : (currentDiffSum > 0 ? 100 : 0);

        const carryTracker: Record<string, number> = {};
        filteredMeters.forEach(m => {
            const base = baseReadings.find(b => b._id.toString() === m._id.toString());
            carryTracker[m._id.toString()] = base ? base.lastValue : (m.initialValue || 0);
        });

        const cleanBreakdown = types.reduce((acc, type) => {
            acc[type] = { cost: 0, consumption: 0, unit: type === "villany" ? "kWh" : "m³" };
            return acc;
        }, {} as Record<string, { cost: number; consumption: number; unit: string }>);

        const monthNames = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];
        const statsByMonth: Record<string, ChartPoint> = {};

        const tempInit = new Date(startDate);
        while (tempInit <= endDateLimit) {
            const key = `${tempInit.getFullYear()}-${tempInit.getMonth()}`;
            statsByMonth[key] = {
                label: monthNames[tempInit.getMonth()],
                unit: "",
                cost: 0,
                consumption: 0,
                sortKey: tempInit.getTime(),
                monthlyDiffSum: 0,
                breakdown: JSON.parse(JSON.stringify(cleanBreakdown))
            };
            tempInit.setMonth(tempInit.getMonth() + 1);
        }

        const monthlyMeterMax: Record<string, Record<string, number>> = {};

        currentPeriodReadings.forEach(r => {
            const key = `${r.date.getFullYear()}-${r.date.getMonth()}`;
            const mId = r.meterId.toString();
            const meter = filteredMeters.find(m => m._id.toString() === mId);

            if (!meter || !statsByMonth[key]) return;

            const typeKey = meter.type;
            const diff = r.difference || 0;
            const cost = diff * (meter.basePrice || 0);

            statsByMonth[key].cost += cost;
            statsByMonth[key].monthlyDiffSum += diff;
            statsByMonth[key].breakdown[typeKey].cost += cost;
            statsByMonth[key].breakdown[typeKey].difference = diff;
            statsByMonth[key].breakdown[typeKey].isOverLimit = meter.isTiered ? meter.tierLimit! < diff : false;

            if (!monthlyMeterMax[key]) monthlyMeterMax[key] = {};
            monthlyMeterMax[key][mId] = Math.max(monthlyMeterMax[key][mId] || 0, r.value);
        });

        const chartDataArray = Object.values(statsByMonth).sort((a, b) => a.sortKey - b.sortKey);

        chartDataArray.forEach(p => {
            const dateKey = new Date(p.sortKey);
            const mKey = `${dateKey.getFullYear()}-${dateKey.getMonth()}`;

            filteredMeters.forEach(m => {
                const mId = m._id.toString();
                const typeKey = m.type;

                if (monthlyMeterMax[mKey] && monthlyMeterMax[mKey][mId] !== undefined) {
                    carryTracker[mId] = monthlyMeterMax[mKey][mId];
                }

                p.breakdown[typeKey].consumption += carryTracker[mId];
            });

            p.consumption = Object.values(p.breakdown).reduce((acc, curr) => acc + curr.consumption, 0);
        });

        let unitLabel = "kWh/m³";
        if (filter === "villany") unitLabel = "kWh";
        else if (filter === "gaz" || filter === "viz") unitLabel = "m³";

        const isOverLimitOverAllPercent = chartDataArray.reduce((acc, curr) => {
            const breakdownValues = Object.values(curr.breakdown);
            const overLimitCount = breakdownValues.filter(b => b.isOverLimit).length;
            const totalCount = breakdownValues.length;
            return acc + (totalCount > 0 ? (overLimitCount / totalCount) : 0);
        }, 0) / chartDataArray.length * 100;

        return {
            chartData: chartDataArray,
            totalCost: `${Math.round(chartDataArray.reduce((acc, curr) => acc + curr.cost, 0)).toLocaleString()} Ft`,
            totalConsumption: `${currentDiffSum.toLocaleString()} ${unitLabel}`,
            trend: `${Math.abs(Math.round(trendVal))}%`,
            isTrendPositive: trendVal > 0,
            isOverLimitOverAllPercent,
            categoryKeys: types as CategoryKey[]
        };
    }
};