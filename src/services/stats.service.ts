import dbConnect from "@/lib/dbConnect";
import Reading from "@/models/reading.model";
import Meter, { IMeter } from "@/models/meter.model";
import mongoose from "mongoose";

export interface MainStatsData {
    totalCost: string;
    trend: string;
    isTrendPositive: boolean;
    limitPercent: number;
    chartData: { cost: number }[];
    co2Saved: string;
}

export const StatsService = {
    async getStats(
        houseId: string,
        meterIds: string[],
        frequency: string,
        customRange?: { start: string; end: string }
    ): Promise<MainStatsData> {
        await dbConnect();

        const now = new Date();
        let startDate: Date;
        let endDateLimit: Date;
        let prevStartDate: Date;
        let prevEndDateLimit: Date;

        if (frequency === "custom" && customRange) {
            const [sY, sM] = customRange.start.split('.').map(Number);
            const [eY, eM] = customRange.end.split('.').map(Number);
            startDate = new Date(sY, sM - 1, 1);
            endDateLimit = new Date(eY, eM, 0, 23, 59, 59);

            const diffTime = endDateLimit.getTime() - startDate.getTime();
            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(prevEndDateLimit.getTime() - diffTime);
        } else if (frequency === "quarter") {
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
            endDateLimit = new Date(now.getFullYear(), quarterStartMonth + 3, 0, 23, 59, 59);

            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(now.getFullYear(), quarterStartMonth - 3, 1);
        } else if (frequency === "year") {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDateLimit = new Date(now.getFullYear(), 11, 31, 23, 59, 59);

            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        } else {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDateLimit = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

            prevEndDateLimit = new Date(startDate.getTime() - 1);
            prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        }

        const meterQuery: { houseId: mongoose.Types.ObjectId; type?: { $in: string[] } } = {
            houseId: new mongoose.Types.ObjectId(houseId)
        };

        if (!meterIds.includes("all")) {
            const types = meterIds.map(id => id === "electricity" ? "villany" : id === "gas" ? "gaz" : "viz");
            meterQuery.type = { $in: types };
        }

        const meters = await Meter.find(meterQuery).lean() as unknown as (IMeter & { _id: mongoose.Types.ObjectId })[];
        const mIds = meters.map(m => m._id);

        const currentPeriodReadings = await Reading.find({
            meterId: { $in: mIds },
            date: { $gte: startDate, $lte: endDateLimit }
        }).sort({ date: 1 }).lean();

        const prevPeriodReadings = await Reading.find({
            meterId: { $in: mIds },
            date: { $gte: prevStartDate, $lte: prevEndDateLimit }
        }).sort({ date: 1 }).lean();

        let currentCostSum = 0;
        let currentConsumptionSum = 0;
        const chartData: { cost: number }[] = [];

        currentPeriodReadings.forEach(r => {
            const meter = meters.find(m => m._id.toString() === r.meterId.toString());
            const diff = r.difference || 0;
            const cost = diff * (meter?.basePrice || 0);

            currentCostSum += cost;
            currentConsumptionSum += diff;

            chartData.push({ cost: currentCostSum });
        });

        if (chartData.length === 0) {
            chartData.push({ cost: 0 }, { cost: 0 });
        } else if (chartData.length === 1) {
            chartData.unshift({ cost: 0 });
        }

        let prevCostSum = 0;
        prevPeriodReadings.forEach(r => {
            const meter = meters.find(m => m._id.toString() === r.meterId.toString());
            const diff = r.difference || 0;
            prevCostSum += diff * (meter?.basePrice || 0);
        });

        const trendVal = prevCostSum > 0 ? ((currentCostSum - prevCostSum) / prevCostSum) * 100 : (currentCostSum > 0 ? 100 : 0);

        let totalLimit = 0;
        meters.forEach(m => {
            let months = 1;
            if (frequency === "quarter") months = 3;
            if (frequency === "year") months = 12;
            if (frequency === "custom" && customRange) {
                const [sY, sM] = customRange.start.split('.').map(Number);
                const [eY, eM] = customRange.end.split('.').map(Number);
                months = (eY - sY) * 12 + (eM - sM) + 1;
            }
            totalLimit += (m.tierLimit || 0) * months;
        });

        const limitPercent = totalLimit > 0 ? Math.min(Math.round((currentConsumptionSum / totalLimit) * 100), 100) : 0;
        const co2Saved = (currentConsumptionSum * 0.4).toFixed(1);

        return {
            totalCost: `${Math.round(currentCostSum).toLocaleString()} Ft`,
            trend: `${Math.abs(Math.round(trendVal))}%`,
            isTrendPositive: trendVal > 0,
            limitPercent,
            chartData,
            co2Saved: `${co2Saved} kg`
        };
    }
};