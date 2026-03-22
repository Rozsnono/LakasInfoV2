"use server";

import { SettingsService } from "@/services/settings.service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs");

async function getUserIdFromToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch { return null; }
}

export async function getSettingsAction() {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false, error: "Auth hiba" };

    const settings = await SettingsService.getSettings(userId);
    if (!settings) return { success: false, error: "Beállítások nem találhatók" };

    return {
        success: true,
        settings: JSON.parse(JSON.stringify(settings))
    };
}

export async function updateSettingsAction(data: { theme: "dark" | "light" | "system"; accent: string; animations: boolean; wallpaper: string, widgets: string[] }) {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false, error: "Auth hiba" };

    const res = await SettingsService.updateSettings(userId, data);
    if (!res.success) return { success: false };
    return { success: true, settings: JSON.parse(JSON.stringify(res.settings)) };
}

