import dbConnect from "@/lib/dbConnect";
import Notification, { INotification } from "@/models/notification.model";
import mongoose from "mongoose";
import { SubscriptionService } from "./subscription.service";

export const NotificationService = {
    // Értesítés létrehozása (belső használatra)
    async create(data: Partial<INotification>) {
        await dbConnect();
        return await Notification.create(data);
    },

    // Felhasználó összes értesítése
    async getByUser(userId: string) {
        await dbConnect();
        return await Notification.find({ userId: new mongoose.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();
    },

    // Olvasatlan értesítések száma (a harang ikonra)
    async getUnreadCount(userId: string) {
        await dbConnect();
        return await Notification.countDocuments({
            userId: new mongoose.Types.ObjectId(userId),
            isRead: false
        });
    },

    // Olvasottnak jelölés
    async markAsRead(notificationId: string) {
        await dbConnect();
        return await Notification.findByIdAndUpdate(notificationId, { isRead: true });
    },

    // Összes törlése/olvasottnak jelölése
    async markAllAsRead(userId: string) {
        await dbConnect();
        return await Notification.updateMany(
            { userId: new mongoose.Types.ObjectId(userId), isRead: false },
            { isRead: true }
        );
    },

    async makeForSubscriptionEnding(userId: string) {
        await dbConnect();
        const userSubscription = await SubscriptionService.getSubscriptionStatus(userId);
        if (!userSubscription || new Date(userSubscription.expiresAt!) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
            // Nincs előfizetés vagy nem jár le 7 napon belül, így nem kell értesítést létrehozni
            return null;
        }
        const notification = await Notification.create({
            userId: new mongoose.Types.ObjectId(userId),
            title: "Előfizetés lejáróban",
            message: "Az előfizetésed hamarosan lejár. Ne maradj le a prémium funkciókról, újítsd meg most!",
            type: "warning"
        });
        return notification;
    }
};