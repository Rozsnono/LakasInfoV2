"use server";

import { StartupService } from "@/services/startup.service";

export async function StartupAction() {
    try {
        const data = await StartupService.getDatasForCookies();

        if (!data) {
            return { success: false, message: "Nincs érvényes token vagy adat." };
        }

        await StartupService.settingCookies(data);
    } catch (error) {
        console.error("Startup Action Error:", error);
        return { success: false, message: "Váratlan hiba a startup folyamat során." };
    }
}