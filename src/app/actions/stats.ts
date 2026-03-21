"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { StatsService, MainStatsData } from "@/services/stats.service";
import { HouseService } from "@/services/house.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

export async function getStatsAction(
    meterIds: string[],
    frequency: string,
    customRange?: { start: string; end: string }
): Promise<{ success: boolean; value?: MainStatsData; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const houseRes = await HouseService.getHouseDetailsByUserId(payload.userId as string);

        if (!houseRes.success || !houseRes.house) return { success: false, error: "No house" };

        const stats = await StatsService.getStats(houseRes.house._id.toString(), meterIds, frequency, customRange);
        return { success: true, value: JSON.parse(JSON.stringify(stats)) };
    } catch {
        return { success: false, error: "Hiba" };
    }
}