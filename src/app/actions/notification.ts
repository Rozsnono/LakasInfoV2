"use server";

import { NotificationService } from "@/services/notification.service";
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

export async function getNotificationsAction() {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false, error: "Auth hiba" };

    const notifications = await NotificationService.getByUser(userId);
    const unreadCount = await NotificationService.getUnreadCount(userId);

    return {
        success: true,
        notifications: JSON.parse(JSON.stringify(notifications)),
        unreadCount
    };
}

export async function markAsReadAction(id: string) {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false };

    await NotificationService.markAsRead(id);
    revalidatePath("/dashboard");
    return { success: true };
}

export async function markAllAsReadAction() {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false };

    await NotificationService.markAllAsRead(userId);
    revalidatePath("/dashboard");
    return { success: true };
}

export async function createSubscriptionEndingNotificationAction() {
    const userId = await getUserIdFromToken();
    if (!userId) return { success: false };
    await NotificationService.makeForSubscriptionEnding(userId);
    revalidatePath("/dashboard");
    return { success: true };
}