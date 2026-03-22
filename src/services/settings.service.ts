import dbConnect from "@/lib/dbConnect"; // Feltételezve, hogy itt van az adatbázis csatlakozásod
import Settings from "@/models/settings.modal"; // A User modelled helye
import { ObjectId } from "mongodb";

export class SettingsService {

    /**
     * Felhasználó beállításainak lekérése az adatbázisból
     * @param userId A felhasználó azonosítója
     * @returns A beállítások vagy null, ha nem található
     */
    static async getSettings(userId: string) {
        try {
            await dbConnect();
            if (!ObjectId.isValid(userId)) {
                throw new Error("Érvénytelen felhasználó azonosító");
            }

            const settings = await Settings.findOne({ userId: new ObjectId(userId) });
            return settings;
        } catch (error) {
            console.error("SettingsService Get Error:", error);
            throw error;
        }

    }


    /**
     * Új beállítások létrehozása egy új felhasználó számára
     * @param userId A felhasználó azonosítója
     * @returns Az újonnan létrehozott beállítások
     */
    static async createSettings(userId: string) {
        try {
            await dbConnect();
            if (!ObjectId.isValid(userId)) {
                throw new Error("Érvénytelen felhasználó azonosító");
            }

            const newSettings = new Settings({ userId: new ObjectId(userId) });
            await newSettings.save();
            return newSettings;
        } catch (error) {
            console.error("SettingsService Create Error:", error);
            throw error;
        }

    }

    /**
     * Felhasználó beállításainak frissítése az adatbázisban
     * @param userId A felhasználó azonosítója
     * @param data A frissítendő beállítások adatai
     * @returns A frissített beállítások vagy hiba esetén egy hibaüzenet
     */
    static async updateSettings(userId: string, data: { theme: "dark" | "light" | "system"; accent: string; animations: boolean; wallpaper: string, widgets: string[] }) {
        try {
            await dbConnect();

            // Ellenőrizzük, hogy érvényes-e az ID
            if (!ObjectId.isValid(userId)) {
                throw new Error("Érvénytelen felhasználó azonosító");
            }

            // Frissítés MongoDB-ben (Mongoose példa)
            const updatedSettings = await Settings.findOneAndUpdate(
                { userId: new ObjectId(userId) },
                {
                    $set: {
                        theme: data.theme,
                        accent: data.accent,
                        animations: data.animations,
                        wallpaper: data.wallpaper,
                        widgets: data.widgets
                    }
                },
                { new: true } // A frissített objektumot adja vissza
            );

            if (!updatedSettings) {
                throw new Error("A felhasználó beállításai nem találhatók az adatbázisban");
            }

            return { success: true, settings: updatedSettings };
        } catch (error) {
            console.error("SettingsService Update Error:", error);
            throw error; // Továbbdobjuk a Server Action-nek
        }
    }
}