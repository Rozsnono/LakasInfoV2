import dbConnect from "@/lib/dbConnect"; // Feltételezve, hogy itt van az adatbázis csatlakozásod
import House from "@/models/house.model";
import User from "@/models/user.model"; // A User modelled helye
import { ObjectId } from "mongodb";

export class UserService {
    /**
     * Felhasználó adatainak frissítése az adatbázisban
     */
    static async updateProfile(userId: string, data: { name: string; email: string, colorCode: string }) {
        try {
            await dbConnect();

            // Ellenőrizzük, hogy érvényes-e az ID
            if (!ObjectId.isValid(userId)) {
                throw new Error("Érvénytelen felhasználó azonosító");
            }
            // Frissítés MongoDB-ben (Mongoose példa)
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                {
                    $set: {
                        name: data.name,
                        email: data.email.toLowerCase(),
                        colorCode: data.colorCode
                    }
                },
                { new: true } // A frissített objektumot adja vissza
            );

            if (!updatedUser) {
                throw new Error("A felhasználó nem található az adatbázisban");
            }

            return { success: true, user: updatedUser };
        } catch (error) {
            console.error("UserService Update Error:", error);
            throw error; // Továbbdobjuk a Server Action-nek
        }
    }

    static async getUserById(userId: string) {
        try {
            await dbConnect();
            if (!ObjectId.isValid(userId)) {
                throw new Error("Érvénytelen felhasználó azonosító");
            }

            const user = await User.findById(userId).select("-password"); // Jelszó kizárása a lekérdezésből

            if (!user) {
                return { success: false, message: "A felhasználó nem található az adatbázisban" };
            }

            return { success: true, user };
        } catch (error) {
            console.error("UserService Get User Error:", error);
            return { success: false, message: "Hiba történt a felhasználó lekérdezése során" };
        }
    }
}