/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { AIService } from "@/services/ai.service";
import { MeterService } from "@/services/meter.service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import mongoose from "mongoose";
import { HouseService } from "@/services/house.service";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs"
);

async function getUserIdFromToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch { return null; }
}

export interface CreateMeterInput {
    name: string;
    type: "villany" | "gaz" | "viz";
    unit: string;
    houseId: mongoose.Types.ObjectId | string;
    initialValue: number;
    isTiered: boolean;
    tierLimit?: number;
    basePrice?: number;
    marketPrice?: number;
    flatPrice?: number;
}

export async function createMeterAction(data: CreateMeterInput) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Bejelentkezés szükséges!" };
        data.houseId = new mongoose.Types.ObjectId(data.houseId);
        const meter = await MeterService.addMeter(data as any);
        revalidatePath("/dashboard");
        return { success: true, meterId: meter._id.toString() };
    } catch (error) { return { success: false, error: "Hiba a mentéskor." }; }
}

export async function getMeterByIdAction(meterId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Bejelentkezés szükséges!" };
        const meter = await MeterService.getMeterById(meterId);
        return { success: true, meter: JSON.parse(JSON.stringify(meter)) };
    } catch (error) { return { success: false, error: "Hiba a lekéréskor." }; }
}

export async function updateMeterAction(meterId: string, data: any) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Bejelentkezés szükséges!" };

        const updateData = {
            name: data.name,
            type: data.type,
            isTiered: data.isTiered,
            tierLimit: data.hasAlert ? Number(data.alertLimit) : Number(data.tierLimit),
            basePrice: data.isTiered ? Number(data.priceTier1) : undefined,
            marketPrice: data.isTiered ? Number(data.priceTier2) : undefined,
            flatPrice: !data.isTiered ? Number(data.priceTier1) : undefined,
        };

        await MeterService.updateMeter(meterId, updateData);
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/meters/${meterId}`);
        return { success: true };
    } catch (error) { return { success: false, error: "Sikertelen frissítés." }; }
}

export async function deleteMeterAction(meterId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Bejelentkezés szükséges!" };
        await MeterService.deleteMeter(meterId);
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) { return { success: false, error: "Hiba a törléskor." }; }
}

// ÚJ: Mérés törlése Action
export async function deleteReadingAction(readingId: string, meterId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Nincs auth!" };

        await MeterService.deleteReading(readingId);

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/meters/${meterId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Nem sikerült a törlés." };
    }
}

export async function recordReadingAction(meterId: string, value: number, photoUrl?: string, readingDate?: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Nincs auth!" };
        const reading = await MeterService.recordReading(meterId, userId, value, photoUrl, readingDate);
        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/meters/${meterId}`);
        return { success: true, readingId: reading._id.toString() };
    } catch (error) { return { success: false, error: "Hiba az rögzítéskor." }; }
}

export async function getMetersForHouseAction(houseId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Nincs auth!" };
        const meters = await MeterService.getDashboardData(houseId);
        const simplified = meters.map(m => ({ id: m._id.toString(), name: m.name, type: m.type, unit: m.unit }));
        return { success: true, meters: simplified };
    } catch (error) { return { success: false, error: "Lekérési hiba." }; }
}

export async function analyzeMeterPhotoAction(base64Image: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Nincs auth!" };
        const result = await AIService.recognizeMeterReading(base64Image);
        if (!result.success) return { success: false, error: result.message };
        return { success: true, value: result.value };
    } catch (error) { return { success: false, error: "AI hiba." }; }
}

export async function getMetersForWidgetAction() {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Nincs auth!" };
        const houseId = await HouseService.getHouseDetailsByUserId(userId);
        const meters = await MeterService.getWidgetsData(houseId.house?._id.toString() || "");
        return { success: true, results: JSON.parse(JSON.stringify(meters)) };
    } catch (error) { return { success: false, error: "Lekérési hiba." }; }
}