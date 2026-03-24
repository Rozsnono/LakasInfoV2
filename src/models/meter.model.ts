import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Tiszta adat-interfész (Mongoose sallangok nélkül)
 */
export interface IMeterBase {
    _id: mongoose.Types.ObjectId | string;
    name: string;
    type: "villany" | "gaz" | "viz";
    unit: string;
    houseId: mongoose.Types.ObjectId;
    initialValue: number;
    isTiered: boolean;
    tierLimit?: number | null;
    basePrice?: number | null;
    marketPrice?: number | null;
    flatPrice?: number | null;
    alertLimit?: number | null;
    createdAt: Date;
    updatedAt: Date;
    isArchived?: boolean; // Ez a mező nem lesz tárolva, csak a frontend használja a régi mérők jelölésére
}

/**
 * Mongoose Dokumentum interfész (ez kiterjeszti az alapot és a Document-et)
 */
export interface IMeter extends IMeterBase, Document {
    _id: mongoose.Types.ObjectId
}

const MeterSchema: Schema<IMeter> = new Schema(
    {
        name: { type: String, required: true, trim: true },
        type: { type: String, enum: ["villany", "gaz", "viz"], required: true },
        unit: { type: String, required: true },
        houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
        initialValue: { type: Number, default: 0 },
        isTiered: { type: Boolean, default: false },
        tierLimit: { type: Number, default: null },
        basePrice: { type: Number, default: null },
        marketPrice: { type: Number, default: null },
        flatPrice: { type: Number, default: null },
        alertLimit: { type: Number, default: null },
        isArchived: { type: Boolean, default: false }, // Ez a mező nem lesz tárolva, csak a frontend használja a régi mérők jelölésére
    },
    { timestamps: true, versionKey: false }
);

const Meter: Model<IMeter> = mongoose.models.Meter || mongoose.model<IMeter>("Meter", MeterSchema);

export default Meter;