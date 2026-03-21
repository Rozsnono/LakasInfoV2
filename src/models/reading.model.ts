import mongoose, { Schema, Document, Model } from "mongoose";

export interface IReading extends Document {
    value: number;
    date: Date;
    photoUrl?: string;
    difference?: number;
    meterId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    createdAt: Date;
}

const ReadingSchema: Schema<IReading> = new Schema(
    {
        value: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        photoUrl: { type: String, default: null },
        difference: { type: Number, default: 0 },
        meterId: { type: Schema.Types.ObjectId, ref: "Meter", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true, versionKey: false }
);

const Reading: Model<IReading> = mongoose.models.Reading || mongoose.model<IReading>("Reading", ReadingSchema);
export default Reading;