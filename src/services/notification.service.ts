import dbConnect from "@/lib/dbConnect";
import Notification, { INotification } from "@/models/notification.model";
import mongoose from "mongoose";

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
    }
};