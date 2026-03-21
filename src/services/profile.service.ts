import dbConnect from "@/lib/dbConnect"; // Feltételezve, hogy itt van az adatbázis csatlakozásod
import User from "@/models/user.model"; // A User modelled helye
import { ObjectId } from "mongodb";

export class UserService {
    /**
     * Felhasználó adatainak frissítése az adatbázisban
     */
    static async updateProfile(userId: string, data: { name: string; email: string }) {
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
                        email: data.email.toLowerCase()
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
}