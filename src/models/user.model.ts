import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    image?: string;
    houses: mongoose.Types.ObjectId[];
    colorCode: string;
    createdAt: Date;
    updatedAt: Date;
    selectedHouse?: mongoose.Types.ObjectId | null;
}

const UserSchema: Schema<IUser> = new Schema(
    {
        name: {
            type: String,
            required: [true, "A név megadása kötelező."],
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Az e-mail cím megadása kötelező."],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Kérlek adj meg egy érvényes e-mail címet."],
        },
        password: {
            type: String,
            required: [true, "A jelszó megadása kötelező."],
            minlength: [8, "A jelszónak legalább 8 karakterből kell állnia."],
            select: false,
        },
        image: {
            type: String,
            default: null,
        },
        colorCode: {
            type: String,
            default: "#ff3b30",
        },
        houses: [
            {
                type: Schema.Types.ObjectId,
                ref: "House",
            },
        ],
        selectedHouse: {
            type: Schema.Types.ObjectId,
            ref: "House",
            default: null,
        },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;