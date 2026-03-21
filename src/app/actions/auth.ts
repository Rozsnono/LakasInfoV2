"use server";

import { AuthService } from "@/services/auth.service";
import { RegisterInput, LoginInput, AuthResponse } from "@/types/auth";
import { cookies } from "next/headers";

/**
 * Regisztrációs folyamat indítása
 */
export async function registerAction(data: RegisterInput): Promise<AuthResponse> {
    try {
        const response = await AuthService.register(data);

        if (response.success && response.token) {
            // Sütiben tároljuk a tokent (biztonságos, httpOnly)
            (await cookies()).set("token", response.token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7, // 1 hétig érvényes
                path: "/",
                sameSite: "lax",
            });
        }

        return response;
    } catch (error) {
        console.error("Register Action Error:", error);
        return { success: false, message: "Váratlan hiba a regisztráció során." };
    }
}

/**
 * Bejelentkezési folyamat indítása
 */
export async function loginAction(data: LoginInput): Promise<AuthResponse> {
    try {
        const response = await AuthService.login(data);

        if (response.success && response.token) {
            // Sütiben tároljuk a tokent
            (await cookies()).set("token", response.token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: "lax",
            });
        }

        return response;
    } catch (error) {
        console.error("Login Action Error:", error);
        return { success: false, message: "Váratlan hiba a bejelentkezés során." };
    }
}

/**
 * Kijelentkezés (Süti törlése)
 */
export async function logoutAction(): Promise<{ success: boolean }> {
    try {
        (await cookies()).delete("token");
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}