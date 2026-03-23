import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscription extends Document {
    userId: mongoose.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    plan: "free" | "pro" | "enterprise";
    isPaid: boolean;
}

const SubscriptionSchema: Schema<ISubscription> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date, default: null },
        plan: { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
        isPaid: { type: Boolean, default: false },
    },
    { timestamps: true, versionKey: false }
);

const Subscription: Model<ISubscription> = mongoose.models.Subscription || mongoose.model<ISubscription>("Subscription", SubscriptionSchema);
export default Subscription;