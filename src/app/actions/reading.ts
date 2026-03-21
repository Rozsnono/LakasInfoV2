"use server";

import { AIService } from "@/services/ai.service";
import { MeterService } from "@/services/meter.service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { ReadingService, ReadingWithMeterInfo } from "@/services/reading.service";
import { IReading } from "@/models/reading.model";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs"
);

/**
 * Segédfüggvény a biztonságos azonosításhoz
 */
async function getUserIdFromToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch {
        return null;
    }
}

export async function getAllReadingsAction(houseId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return { success: false, error: "Nem vagy bejelentkezve!" };
        }

        const result = await ReadingService.getAllReading(houseId);

        if (!result.success || !result.value) {
            return { success: false, error: result.message || "Nem sikerült lekérni az adatokat." };
        }

        const plainData = JSON.parse(JSON.stringify(result.value));

        const serializedReadings = plainData.map((r: ReadingWithMeterInfo) => ({
            _id: r._id,
            value: r.value,
            meterId: r.meterId,
            userId: r.userId,
            photoUrl: r.photoUrl || null,
            date: new Date(r.date).toLocaleDateString('hu-HU'),
            meterName: r.meterName || "Ismeretlen óra",
            meterUnit: r.meterUnit || "",
            difference: r.difference || 0,
            type: r.meterType || "villany"
        }));

        return { success: true, value: serializedReadings };

    } catch (error) {
        console.error("Reading Action Error:", error);
        return { success: false, error: "Hiba a leolvasások lekérése során." };
    }
}

export async function getAllReadingsPerMonthAction(houseId: string, month: number | { start: number, end: number }, year: number | { start: number, end: number }) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) {
            return { success: false, error: "Nem vagy bejelentkezve!" };
        }

        const result = await ReadingService.getAllReadingByMonth(houseId, month, year);

        if (!result.success || !result.value) {
            return { success: false, error: result.message || "Nem sikerült lekérni az adatokat." };
        }

        const plainData = JSON.parse(JSON.stringify(result.value));

        const serializedReadings = plainData.map((r: ReadingWithMeterInfo) => ({
            _id: r._id,
            value: r.value,
            meterId: r.meterId,
            userId: r.userId,
            photoUrl: r.photoUrl || null,
            date: new Date(r.date).toLocaleDateString('hu-HU'),
            meterName: r.meterName || "Ismeretlen óra",
            meterUnit: r.meterUnit || "",
            difference: r.difference || 0,
            type: r.meterType || "villany"
        }));

        return { success: true, value: serializedReadings };

    } catch (error) {
        console.error("Reading Action Error:", error);
        return { success: false, error: "Hiba a leolvasások lekérése során." };
    }
}

export async function getAvailableReportsAction(houseId: string) {
    try {
        const months = await ReadingService.getAvailableReportMonths(houseId);
        return { success: true, value: months };
    } catch (e) {
        return { success: false, error: "Hiba az évek lekérésekor" };
    }
}