import mongoose, { Schema, Document, Model } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    meterId?: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: "info" | "warning" | "danger";
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    meterId: { type: Schema.Types.ObjectId, ref: "Meter" },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "danger"], default: "info" },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;