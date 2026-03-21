import dbConnect from "@/lib/dbConnect";
import Reading, { IReading } from "@/models/reading.model";
import Meter from "@/models/meter.model";
import mongoose from "mongoose";

export interface ReadingResponse {
    success: boolean;
    message: string;
    reading?: IReading;
}

export interface IReadingWithInfo {
    name: string;
    type: "villany" | "gaz" | "viz";
    unit: string;
    hasPhoto: boolean;
    _id: string;
    meterId: string;
    value: string;
    dateLabel: string;
    fullDate: string;
    photoUrl: string | null;
    difference: number;
}

export interface ReadingWithMeterInfo extends IReading {
    meterName: string;
    meterType: "villany" | "gaz" | "viz";
    meterUnit: string;
    type: "villany" | "gaz" | "viz";
}

export const ReadingService = {
    async addReading(
        meterId: string,
        userId: string,
        value: number,
        photoUrl?: string
    ): Promise<ReadingResponse> {
        try {
            await dbConnect();

            const meterObjectId = new mongoose.Types.ObjectId(meterId);
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const meter = await Meter.findById(meterObjectId);
            if (!meter) {
                return { success: false, message: "A mérőóra nem található." };
            }

            const lastReading = await Reading.findOne({ meterId: meterObjectId })
                .sort({ date: -1 })
                .exec();

            const previousValue = lastReading ? lastReading.value : (meter.initialValue || 0);

            if (value < previousValue) {
                return {
                    success: false,
                    message: `Az új óraállás (${value}) nem lehet kisebb, mint az előző (${previousValue})!`
                };
            }

            const newReading = await Reading.create({
                value,
                meterId: meterObjectId,
                userId: userObjectId,
                photoUrl: photoUrl ?? undefined,
                date: new Date(),
            });

            return {
                success: true,
                message: "Óraállás sikeresen rögzítve.",
                reading: newReading,
            };
        } catch (error) {
            console.error("ReadingService.addReading Error:", error);
            return { success: false, message: "Hiba történt a mentés során." };
        }
    },

    async getMeterHistory(meterId: string, limit: number = 12): Promise<IReading[]> {
        await dbConnect();
        return await Reading.find({ meterId: new mongoose.Types.ObjectId(meterId) })
            .sort({ date: -1 })
            .limit(limit)
            .lean()
            .exec() as IReading[];
    },

    async getAllReading(houseId: string): Promise<{ success: boolean; message?: string; value?: ReadingWithMeterInfo[] }> {
        try {
            await dbConnect();

            const meters = await Meter.find({ houseId: new mongoose.Types.ObjectId(houseId) }).lean().exec();

            const readings = await Reading.find({ meterId: { $in: meters.map(m => m._id) } }).sort({ date: -1 }).populate('meterId').lean().exec() as IReading[];
            const readingsWithMeterInfo = readings.map(r => ({
                ...r,
                meterName: (r.meterId as unknown as Record<string, unknown>).name as string,
                meterType: (r.meterId as unknown as Record<string, unknown>).type as "villany" | "gaz" | "viz",
                meterUnit: (r.meterId as unknown as Record<string, unknown>).unit as string,
            }));
            return { success: true, value: readingsWithMeterInfo as ReadingWithMeterInfo[] };
        } catch (error) {
            console.error("ReadingService.getAllReading Error:", error);
            return { success: false, message: "Hiba történt a leolvasások lekérése során." };
        }
    },

    async getAllReadingByMonth(houseId: string, month: number | { start: number, end: number }, year: number | { start: number, end: number }): Promise<{ success: boolean; message?: string; value?: ReadingWithMeterInfo[] }> {
        try {
            await dbConnect();

            const meters = await Meter.find({ houseId: new mongoose.Types.ObjectId(houseId) }).lean().exec();
            const startMonth = typeof month === "number" ? month : month.start;
            const endMonth = typeof month === "number" ? month : month.end;
            const startYear = typeof year === "number" ? year : year.start;
            const endYear = typeof year === "number" ? year : year.end;

            const startDate = new Date(startYear, startMonth, 1);
            const endDate = new Date(endYear, endMonth + 1, 1);


            const readings = await Reading.find({ meterId: { $in: meters.map(m => m._id) }, date: { $gte: startDate, $lt: endDate } }).sort({ date: -1 }).populate('meterId').lean().exec() as IReading[];
            const readingsWithMeterInfo = readings.map(r => ({
                ...r,
                meterName: (r.meterId as unknown as Record<string, unknown>).name as string,
                meterType: (r.meterId as unknown as Record<string, unknown>).type as "villany" | "gaz" | "viz",
                meterUnit: (r.meterId as unknown as Record<string, unknown>).unit as string,
            }));


            return { success: true, value: readingsWithMeterInfo as ReadingWithMeterInfo[] };
        } catch (error) {
            console.error("ReadingService.getAllReading Error:", error);
            return { success: false, message: "Hiba történt a leolvasások lekérése során." };
        }
    },

    async getAvailableReportMonths(houseId: string) {
        await dbConnect();

        const meters = await Meter.find({ houseId: new mongoose.Types.ObjectId(houseId) }).lean().exec();

        const readings = await Reading.find({ meterId: { $in: meters.map(m => m._id) } }).sort({ date: -1 }).select('date').lean().exec() as IReading[];

        // Egyedi év-hónap párok kigyűjtése
        const monthsMap = new Map();

        readings.forEach(r => {
            const d = new Date(r.date);
            const year = d.getFullYear();
            const month = d.getMonth(); // 0-11
            const key = `${year}-${month}`;

            if (!monthsMap.has(key)) {
                monthsMap.set(key, {
                    month: d.toLocaleDateString('hu-HU', { month: 'long' }),
                    monthNumeric: month + 1,
                    year: year.toString(),
                    rawDate: d
                });
            }

            if(!monthsMap.has(`${year}-full`) && month === 11) {
                monthsMap.set(`${year}-full`, {
                    month: year,
                    monthNumeric: 0,
                    year: year.toString(),
                    rawDate: new Date(year, 11, 31),
                    isFullYear: true
                });
            }
        });

        // Sorba rendezés (legfrissebb elöl)
        return Array.from(monthsMap.values()).sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
    }
}