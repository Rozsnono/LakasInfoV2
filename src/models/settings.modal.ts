import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
    userId: mongoose.Types.ObjectId;
    theme: "dark" | "light" | "system";
    accent: string;
    animations: boolean;
    wallpaper: string;
    widgets: { [houseId: string]: string[] };
}

const SettingsSchema: Schema<ISettings> = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
        theme: { type: String, enum: ["dark", "light", "system"], default: "system" },
        accent: { type: String, default: "#ff3b30" },
        animations: { type: Boolean, default: true },
        wallpaper: { type: String, default: "v6" },
        widgets: { type: Map, of: [String], default: {} },
    },
    { timestamps: true, versionKey: false }
);

const Settings: Model<ISettings> = mongoose.models.Settings || mongoose.model<ISettings>("Settings", SettingsSchema);
export default Settings;