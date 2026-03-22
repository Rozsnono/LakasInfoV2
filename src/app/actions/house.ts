"use server";

import { HouseService } from "@/services/house.service";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { IUser } from "@/models/user.model";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs"
);

/**
 * Segédfüggvény a userId kinyeréséhez a sütiből
 */
async function getUserIdFromToken(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch {
        return null;
    }
}

/**
 * Új háztartás létrehozása
 */
export async function createHouseAction(name: string, address?: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Nem vagy bejelentkezve!" };

        const result = await HouseService.createHouse(name, userId, address);

        if (result.success) {
            revalidatePath("/dashboard");
            revalidatePath("/onboarding");
            (await cookies()).set("token", result.newToken!, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: "lax",
            });
            return {
                success: true,
                houseId: result.house?._id.toString(),
                message: result.message
            };
        }

        return { success: false, message: result.message };
    } catch (error) {
        console.error("CreateHouseAction Error:", error);
        return { success: false, message: "Váratlan hiba a ház létrehozásakor." };
    }
}

/**
 * Csatlakozás meglévő házhoz meghívó kóddal
 */
export async function joinHouseAction(inviteCode: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Nem vagy bejelentkezve!" };

        const result = await HouseService.joinHouse(inviteCode, userId);

        if (result.success) {
            revalidatePath("/dashboard");
            revalidatePath("/onboarding");
            (await cookies()).set("token", result.newToken!, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: "lax",
            });
            return {
                success: true,
                houseId: result.house?._id.toString(),
                message: result.message
            };
        }

        return { success: false, message: result.message };
    } catch (error) {
        console.error("JoinHouseAction Error:", error);
        return { success: false, message: "Váratlan hiba a csatlakozás során." };
    }
}

/**
 * Ellenőrzi, hogy a felhasználónak van-e már háza
 * (Hasznos a middleware-ben vagy az onboarding redirectnél)
 */
export async function getUserHouseAction() {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, hasHouse: false };

        const result = await HouseService.getHouseDetailsByUserId(userId);

        return {
            success: result.success,
            hasHouse: result.success && !!result.house,
            house: result.house ? JSON.parse(JSON.stringify(result.house)) : null
        };
    } catch (error) {
        return { success: false, hasHouse: false };
    }
}

/**
 * Lekéri a felhasználó házának adatait
 * (Hasznos a middleware-ben vagy az onboarding redirectnél)
 */
export async function getUserHousesAction() {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, hasHouse: false };

        const result = await HouseService.getHousesDetailsByUserId(userId);

        return {
            success: result.success,
            hasHouse: result.success && !!result.houses && result.houses.length > 0,
            houses: result.houses ? JSON.parse(JSON.stringify(result.houses)) : null
        };
    } catch (error) {
        return { success: false, hasHouse: false };
    }
}

/**
 * Háztartás adatainak frissítése
 */
export async function updateHouseAction(houseId: string, name: string, address: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Nem vagy bejelentkezve!" };

        // Itt hívjuk a HouseService-t (feltételezve, hogy létezik az update metódus)
        const result = await HouseService.updateHouse(houseId, { name, address });

        if (result.success) {
            revalidatePath("/dashboard");
            revalidatePath("/dashboard/settings");
            return { success: true, message: "Adatok sikeresen frissítve!" };
        }

        return { success: false, message: result.message };
    } catch (error) {
        return { success: false, message: "Hiba a frissítés során." };
    }
}

/**
 * Háztartás végleges törlése
 */
export async function deleteHouseAction(houseId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Nem vagy bejelentkezve!" };

        const result = await HouseService.deleteHouse(houseId);

        if (result.success) {
            revalidatePath("/dashboard");
            revalidatePath("/onboarding");
            (await cookies()).set("token", "", {
                httpOnly: true,
                maxAge: 0,
                path: "/",
                sameSite: "lax",
            });

            return { success: true, message: "Háztartás törölve." };
        }

        return { success: false, message: result.message };
    } catch (error) {
        return { success: false, message: "Hiba a törlés során." };
    }
}

export async function getRoommatesAction() {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, error: "Bejelentkezés szükséges." };

        // Előbb megkeressük a házat, amihez a felhasználó tartozik
        const houseRes = await HouseService.getHouseDetailsByUserId(userId);
        if (!houseRes.success || !houseRes.house) {
            return { success: false, error: "Nincs háztartásod." };
        }

        const houseData = JSON.parse(JSON.stringify(houseRes.house));

        return {
            success: true,
            house: houseData,
            currentUserId: userId,
            members: houseData.members.map((m: IUser) => ({
                id: m._id,
                name: m.name,
                email: m.email,
                image: m.image,
                role: m._id === houseData.ownerId ? "Tulajdonos" : "Lakótárs",
                isMe: m._id.toString() === userId,
                init: m.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            }))
        };
    } catch (error) {
        return { success: false, error: "Hiba a szinkronizáció során." };
    }
}

export async function removeRoommateAction(memberId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Bejelentkezés szükséges." };

        const houseRes = await HouseService.getHouseDetailsByUserId(userId);
        if (!houseRes.success || !houseRes.house) return { success: false, message: "Ház nem található." };

        const result = await HouseService.removeMember(houseRes.house._id.toString(), memberId, userId);
        if (result.success) revalidatePath("/dashboard/roommates");

        return result;
    } catch (error) {
        return { success: false, message: "Hiba történt." };
    }
}

/**
 * Lakás kiválasztása a több ház közül (ha van ilyen)
 */
export async function selectHouseAction(houseId: string) {
    try {
        const userId = await getUserIdFromToken();
        if (!userId) return { success: false, message: "Bejelentkezés szükséges." };

        const result = await HouseService.changeSelectedHouse(userId, houseId);
        if (result.success) revalidatePath("/dashboard");

        return result;
    } catch (error) {
        return { success: false, message: "Hiba történt." };
    }
}