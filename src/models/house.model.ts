import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHouse extends Document {
    name: string;
    address?: string;
    inviteCodes: Map<string, number>;
    ownerId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[];
    membersRoles: Map<string, 'owner' | 'member' | 'guest'>;
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
        inviteCodes: {
            type: Map,
            of: {
                type: Number,
                default: 0,
            },
            default: {},
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
        membersRoles: {
            type: Map,
            of: {
                type: String,
                enum: ['owner', 'member', 'guest'],
            },
            default: {},
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const House: Model<IHouse> = mongoose.models.House || mongoose.model<IHouse>("House", HouseSchema);

export default House;