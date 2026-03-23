"use server";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose"; // Hozzáadtuk a SignJWT-t is
import { SubscriptionService } from "@/services/subscription.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

/**
 * Előfizetési adatok frissítése
 */
export async function updateSubscriptionAction(data: { subscriptionPlan: "free" | "pro" | "enterprise", type: 'monthly' | 'yearly' }): Promise<{ success: boolean; message?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return { success: false, message: "Nincs bejelentkezve" };

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        await SubscriptionService.updateSubscription({ userId, plan: data.subscriptionPlan, type: data.type });

        const newToken = await new SignJWT({
            ...payload,
            subscriptionPlan: data.subscriptionPlan
        })
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("7d")
            .sign(JWT_SECRET);

        // 4. Süti frissítése
        cookieStore.set("token", newToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
            sameSite: "lax",
        });

        return { success: true };
    } catch (error) {
        console.error("Update Profile Error:", error);
        return { success: false, message: "Hiba történt a mentés során." };
    }
}