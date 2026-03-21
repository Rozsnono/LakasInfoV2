"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { DetailedStatsService } from "@/services/detailed-stats.service";
import { HouseService } from "@/services/house.service";
import { DetailedStatsData, MeterFilter } from "@/types/stats";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

export async function getDetailedStatsAction(filter: MeterFilter, timeRange: string, customRange?: { start: string; end: string }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const houseRes = await HouseService.getHouseDetailsByUserId(payload.userId as string);
        if (!houseRes.success || !houseRes.house) return { success: false, error: "No house" };
        const stats = await DetailedStatsService.getDetailedStats(houseRes.house._id.toString(), filter, timeRange, customRange);
        return { success: true, value: JSON.parse(JSON.stringify(stats)) as DetailedStatsData };
    } catch {
        return { success: false, error: "Hiba" };
    }
}