import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHouse extends Document {
    name: string;
    address?: string;
    inviteCode: string;
    ownerId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const HouseSchema: Schema<IHouse> = new Schema(
    {
        name: {
            type: String,
            required: [true, "A háztartás nevének megadása kötelező."],
            trim: true,
        },
        address: {
            type: String,
            trim: true,
            default: null,
        },
        inviteCode: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        ownerId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: "User",
            },
        ],
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const House: Model<IHouse> = mongoose.models.House || mongoose.model<IHouse>("House", HouseSchema);

export default House;