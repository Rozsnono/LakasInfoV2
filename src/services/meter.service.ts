import dbConnect from "@/lib/dbConnect";
import Meter, { IMeter, IMeterBase } from "@/models/meter.model";
import Reading from "@/models/reading.model";
import mongoose from "mongoose";
import { NotificationService } from "./notification.service";
import { HouseService } from "./house.service";
import { SubscriptionService } from "./subscription.service";
import { calculateCost } from "@/utils/costCalculator";
import { th } from "framer-motion/client";

export interface CalculationResult {
    consumption: number;
    totalCost: number;
    isOverLimit: boolean;
    basePart: number;
    marketPart: number;
}

export interface MeterWithStats extends IMeterBase {
    lastReadingValue: number;
    lastReadingDate?: Date;
    stats: CalculationResult;
}

export const MeterService = {
    async getMeterById(meterId: string): Promise<IMeter | null> {
        await dbConnect();
        return await Meter.findById(meterId).lean<IMeter>().exec();
    },

    async getMetersByHouse(houseId: string): Promise<IMeter[]> {
        await dbConnect();
        const houseObjectId = new mongoose.Types.ObjectId(houseId);
        return await Meter.find({ houseId: houseObjectId, isArchived: { $ne: true } }).lean<IMeter[]>().exec();
    },

    async addMeter(data: Partial<IMeter>): Promise<IMeter> {
        await dbConnect();
        const house = await HouseService.getHouseById(data.houseId!.toString());
        if (!house) throw new Error("A háztartás nem található");
        const isPro = await SubscriptionService.userHasProSubscription(house.ownerId.toString());
        const meterCount = await Meter.countDocuments({ houseId: data.houseId, isArchived: { $ne: true } });
        if (!isPro && meterCount >= 3) {
            throw new Error("A háztartáshoz több mint 3 mérő hozzáadásához Pro előfizetés szükséges.");
        }
        return await Meter.create(data);
    },

    async updateMeter(meterId: string, data: Partial<IMeter>): Promise<IMeter | null> {
        await dbConnect();
        const updatedMeter = await Meter.findByIdAndUpdate(
            meterId,
            { $set: data },
            { new: true }
        ).exec();

        await this.calculateCostForAllReadings(meterId);
        return updatedMeter;
    },


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async deleteMeter(meterId: string): Promise<any> {
        await dbConnect();
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            await Reading.deleteMany({ meterId: new mongoose.Types.ObjectId(meterId) }).session(session);
            const deleted = await Meter.findByIdAndDelete(meterId).session(session);
            await session.commitTransaction();
            return deleted;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }
    },

    // ÚJ: Leolvasás törlése és láncolt frissítés
    async deleteReading(readingId: string) {
        await dbConnect();

        const readingToDelete = await Reading.findById(readingId);
        if (!readingToDelete) throw new Error("A mérés nem található");

        const { meterId, date } = readingToDelete;

        // 1. Törlés
        await Reading.findByIdAndDelete(readingId);

        // 2. A törölt utáni legelső mérés keresése
        const nextReading = await Reading.findOne({
            meterId,
            date: { $gt: date }
        }).sort({ date: 1 });

        if (nextReading) {
            // Megkeressük az új előző mérést (ami a törölt előtt volt)
            const prevReading = await Reading.findOne({
                meterId,
                date: { $lt: date }
            }).sort({ date: -1 });

            let previousValue = 0;
            if (prevReading) {
                previousValue = prevReading.value;
            } else {
                const meter = await Meter.findById(meterId);
                previousValue = meter?.initialValue || 0;
            }

            // Frissítjük a következő mérés különbségét (fogyasztását)
            nextReading.difference = nextReading.value - previousValue;
            await nextReading.save();
        }

        return { success: true };
    },

    async getDashboardData(houseId: string): Promise<MeterWithStats[]> {
        await dbConnect();
        const houseObjectId = new mongoose.Types.ObjectId(houseId);
        const meters = await Meter.find({ houseId: houseObjectId }).lean<IMeterBase[]>().exec();

        const results = await Promise.all(meters.map(async (meter) => {
            const readings = await Reading.find({ meterId: meter._id })
                .sort({ date: -1 })
                .limit(2)
                .exec();

            const currentReadingValue = readings[0]?.value ?? meter.initialValue ?? 0;
            const previousReadingValue = readings[1]?.value ?? meter.initialValue ?? 0;

            const stats = this.calculateConsumptionStats(meter, currentReadingValue, previousReadingValue);

            return {
                ...meter,
                lastReadingValue: currentReadingValue,
                lastReadingDate: readings[0]?.date,
                stats
            } as MeterWithStats;
        }));

        return results;
    },

    async getWidgetsData(houseId: string) {
        await dbConnect();
        const houseObjectId = new mongoose.Types.ObjectId(houseId);
        const house = await HouseService.getHouseById(houseId);
        const meters = await Meter.find({ houseId: houseObjectId }).lean<IMeterBase[]>().exec();
        const results = await Promise.all(meters.map(async (meter) => {
            const readings = await Reading.find({ meterId: meter._id })
                .sort({ date: -1 })
                .limit(2)
                .exec();

            const currentReadingValue = readings[0]?.value ?? meter.initialValue ?? 0;
            const previousReadingValue = readings[1]?.value ?? meter.initialValue ?? 0;

            const stats = this.calculateConsumptionStats(meter, currentReadingValue, previousReadingValue);

            return {
                ...meter,
                lastReadingValue: currentReadingValue,
                lastReadingDate: readings[0]?.date,
                stats
            } as MeterWithStats;
        }));
        return { house, meters: results };
    },

    calculateConsumptionStats(meter: IMeterBase, current: number, previous: number): CalculationResult {
        const consumption = Math.max(0, current - previous);
        if (!meter.isTiered) {
            const price = meter.flatPrice ?? 0;
            return { consumption, totalCost: consumption * price, isOverLimit: false, basePart: consumption, marketPart: 0 };
        }
        const limit = meter.tierLimit ?? 0;
        const bPrice = meter.basePrice ?? 0;
        const mPrice = meter.marketPrice ?? 0;

        if (consumption <= limit) {
            return { consumption, totalCost: consumption * bPrice, isOverLimit: false, basePart: consumption, marketPart: 0 };
        } else {
            const marketPart = consumption - limit;
            return { consumption, totalCost: (limit * bPrice) + (marketPart * mPrice), isOverLimit: true, basePart: limit, marketPart: marketPart };
        }
    },

    async recordReading(meterId: string, userId: string, value: number, photoUrl?: string, readingDate?: string) {
        await dbConnect();
        const meterObjId = new mongoose.Types.ObjectId(meterId);
        const targetDate = readingDate ? new Date(readingDate) : new Date();

        const previousReading = await Reading.findOne({
            meterId: meterObjId,
            date: { $lt: targetDate }
        }).sort({ date: -1 }).lean();

        let difference = 0;
        if (previousReading) {
            difference = value - previousReading.value;
        } else {
            const meter = await Meter.findById(meterObjId).lean();
            difference = value - (meter?.initialValue || 0);
        }

        const meter = await Meter.findById(meterObjId).lean();

        if (!meter) {
            throw new Error("Meter not found");
        }

        const calcCost = calculateCost(meter.tierLimit!, meter.basePrice!, meter.marketPrice!, difference);

        const newReading = await Reading.create({
            meterId: meterObjId,
            userId: new mongoose.Types.ObjectId(userId),
            value: value,
            photoUrl: photoUrl || undefined,
            difference: difference,
            cost: calcCost,
            date: targetDate
        });

        try {
            const meter = await Meter.findById(meterObjId).lean();

            if (meter) {
                const limit = meter.tierLimit || 0;

                if (limit > 0 && difference > limit) {
                    await NotificationService.create({
                        userId: new mongoose.Types.ObjectId(userId),
                        meterId: meterObjId,
                        title: "Limit túllépés!",
                        message: `A(z) ${meter.name} aktuális fogyasztása (${difference} ${meter.unit}) átlépte a beállított havi keretet (${limit} ${meter.unit}).`,
                        type: "danger"
                    });
                }
            }
        } catch (notifyError) {
            console.error("Hiba az értesítés generálása közben:", notifyError);
        }

        const nextReading = await Reading.findOne({
            meterId: meterObjId,
            date: { $gt: targetDate }
        }).sort({ date: 1 }).exec();

        if (nextReading) {
            nextReading.difference = nextReading.value - value;
            await nextReading.save();
        }

        return newReading;
    },

    async calculateCostForAllReadings(meterId: string) {
        await dbConnect();
        const meter = await Meter.findById(meterId).lean();
        if (!meter) throw new Error("Meter not found");
        const readings = await Reading.find({ meterId: new mongoose.Types.ObjectId(meterId) }).sort({ date: 1 }).exec();
        const updatedReadings = await Promise.all(readings.map(async (reading, index) => {
            const calcCost = meter.isTiered ? calculateCost(
                meter.tierLimit ?? 0,
                meter.basePrice ?? 0,
                meter.marketPrice ?? 0,
                reading.difference ?? 0
            ) : null;
            await Reading.findByIdAndUpdate(reading._id, {
                cost: calcCost
            });
        }));
        console.log(`Updated costs for ${updatedReadings.length} readings of meter ${meterId}`);
        return { success: true };
    },

    async getMeterDetailsWithReadings(meterId: string) {
        await dbConnect();
        const meter = await Meter.findById(meterId).lean();
        if (!meter) return null;
        const readings = await Reading.find({ meterId: new mongoose.Types.ObjectId(meterId) })
            .sort({ date: -1 }).lean();
        return { ...meter, readings };
    },

    async getMeterTypesByHouse(houseId: string): Promise<string[]> {
        await dbConnect();
        const houseObjectId = new mongoose.Types.ObjectId(houseId);
        return await Meter.distinct("type", { houseId: houseObjectId }).exec() as string[];
    }
};