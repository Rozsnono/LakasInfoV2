"use server";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose"; // Hozzáadtuk a SignJWT-t is
import { HouseService } from "@/services/house.service";
import { UserService } from "@/services/profile.service"; // Feltételezve, hogy itt van az update
import { ProfileData } from "@/contexts/user.context";
import { SubscriptionService } from "@/services/subscription.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

/**
 * Aktuális felhasználó lekérése
 */
export async function getCurrentUserAction(): Promise<{ success: boolean; user?: ProfileData; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return { success: false, error: "No token" };

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        const houseRes = await HouseService.getHouseDetailsByUserId(userId);

        const userData: ProfileData = {
            _id: userId,
            name: (payload.name as string) || "Felhasználó",
            email: (payload.email as string) || "",
            colorCode: (payload.colorCode as string) || "#ff3b30",
            houseId: houseRes.house?._id?.toString(),
            subscriptionPlan: (payload.subscriptionPlan as "free" | "pro" | "enterprise") || "free",
            house: houseRes.house ? {
                _id: houseRes.house._id.toString(),
                joinCode: houseRes.house.inviteCode,
                name: houseRes.house.name
            } : undefined,
        };

        return { success: true, user: JSON.parse(JSON.stringify(userData)) };
    } catch {
        return { success: false, error: "Invalid token" };
    }
}

/**
 * Profil adatok frissítése
 */
export async function updateProfileAction(data: { name: string; email: string, colorCode: string }): Promise<{ success: boolean; message?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return { success: false, message: "Nincs bejelentkezve" };

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const userId = payload.userId as string;

        await UserService.updateProfile(userId, data);
        const isExpired = await SubscriptionService.checkAndDowngradeExpiredSubscription(userId);

        const newToken = await new SignJWT({
            ...payload,
            name: data.name,
            email: data.email,
            colorCode: data.colorCode,
            subscriptionPlan: isExpired ? isExpired.plan : (payload.subscriptionPlan as "free" | "pro" | "enterprise"),
            subscriptionExpiresAt: isExpired ? (isExpired.expiresAt ? isExpired.expiresAt.toISOString() : null) : (payload.subscriptionExpiresAt as string | null)
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