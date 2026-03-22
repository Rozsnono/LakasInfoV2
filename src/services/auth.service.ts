import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import { RegisterInput, LoginInput, AuthResponse } from "@/types/auth";

export const AuthService = {

    async register(data: RegisterInput): Promise<AuthResponse> {
        try {
            await dbConnect();

            const existingUser = await User.findOne({ email: data.email });
            if (existingUser) {
                return { success: false, message: "Ezzel az e-mail címmel már regisztráltak." };
            }

            const hashedPassword = await bcrypt.hash(data.password, 12);

            const newUser = await User.create({
                name: data.name,
                email: data.email,
                password: hashedPassword,
            });

            const token = signToken({ userId: newUser._id.toString(), email: newUser.email, name: newUser.name, colorCode: newUser.colorCode });

            return {
                success: true,
                token,
                user: { id: newUser._id.toString(), name: newUser.name, email: newUser.email, colorCode: newUser.colorCode },
            };
        } catch (error) {
            console.error("AuthService Register Error:", error);
            return { success: false, message: "Hiba történt a regisztráció során." };
        }
    },

    async login(data: LoginInput): Promise<AuthResponse> {
        try {
            await dbConnect();

            const user = await User.findOne({ email: data.email }).select("+password");
            if (!user) {
                return { success: false, message: "Hibás e-mail cím vagy jelszó." };
            }

            const isPasswordCorrect = await bcrypt.compare(data.password, user.password);
            if (!isPasswordCorrect) {
                return { success: false, message: "Hibás e-mail cím vagy jelszó." };
            }

            const houseId = user.selectedHouse ? user.selectedHouse.toString() : (user.houses[0] ? user.houses[0].toString() : null);
            const token = signToken({ userId: user._id.toString(), email: user.email, name: user.name, colorCode: user.colorCode, houseId });

            return {
                success: true,
                token,
                user: { id: user._id.toString(), name: user.name, email: user.email, colorCode: user.colorCode, houseId },
            };
        } catch (error) {
            console.error("AuthService Login Error:", error);
            return { success: false, message: "Hiba történt a bejelentkezés során." };
        }
    },
};