import dbConnect from "@/lib/dbConnect";
import { signToken } from "@/lib/jwt";
import House, { IHouse } from "@/models/house.model";
import User, { IUser } from "@/models/user.model";
import Settings from "@/models/settings.modal";
import mongoose from "mongoose";
import { SubscriptionService } from "./subscription.service";

/**
 * Szerviz válasz interfész a konzisztens hibakezeléshez
 */
export interface HouseServiceResponse {
    success: boolean;
    message: string;
    house?: IHouse;
    newToken?: string;
}

export interface HousesServiceResponse extends HouseServiceResponse {
    houses?: IHouse[];
}

export const HouseService = {

    async getHouseById(houseId: string): Promise<IHouse | null> {
        await dbConnect();
        const house = await House.findById(houseId).populate({ path: "members", select: "_id name email colorCode" }).lean<IHouse>().exec();
        if (!house) return null;
        const cleanHouse = {
            _id: house._id,
            name: house.name,
            address: house.address,
            ownerId: house.ownerId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            members: house.members.map((member: any) => ({
                _id: member._id,
                name: member.name,
                email: member.email,
                colorCode: member.colorCode,
                isOwner: house.ownerId.equals(member._id)
            }))
        };
        return cleanHouse as unknown as IHouse;
    },

    async generateUniqueInviteCode(): Promise<string> {
        await dbConnect();
        let isUnique = false;
        let code = "";

        while (!isUnique) {
            code = Math.floor(100000 + Math.random() * 900000).toString();
            const existing = await House.findOne({ inviteCode: code });
            if (!existing) isUnique = true;
        }

        return code;
    },

    async getNewUserToken(userId: string, houseId?: string): Promise<string> {
        const user = await User.findById(userId);
        const subscription = await SubscriptionService.getSubscriptionStatus(userId);
        if (!user) throw new Error("User not found for token generation");
        const token = signToken({ userId: user._id.toString(), email: user.email, name: user.name, houseId: houseId || null, colorCode: user.colorCode, subscriptionPlan: subscription.plan || "free", subscriptionExpiresAt: subscription.expiresAt ? subscription.expiresAt.toISOString() : null });
        return token;
    },

    async createHouse(name: string, ownerId: string, address?: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();

            const inviteCode = await this.generateUniqueInviteCode();
            const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

            const isPro = await SubscriptionService.userHasProSubscription(ownerId);
            const hasHouse = await User.findById(ownerObjectId).select("houses").lean().exec();

            if (!isPro && hasHouse && hasHouse.houses && hasHouse.houses.length > 0) {
                return {
                    success: false,
                    message: "A háztartás létrehozásához Pro előfizetés szükséges. Kattints a bővebb információért!",
                };
            }

            const newHouse = await House.create({
                name,
                address: address || undefined,
                inviteCode,
                ownerId: ownerObjectId,
                members: [ownerObjectId],
            });

            await User.findByIdAndUpdate(ownerObjectId, {
                $push: { houses: newHouse._id },
                $set: { selectedHouse: newHouse._id }
            });

            return {
                success: true,
                message: "Háztartás sikeresen létrehozva.",
                house: newHouse,
                newToken: await this.getNewUserToken(ownerId, newHouse._id.toString()),
            };
        } catch (error) {
            console.error("CreateHouse Error:", error);
            return { success: false, message: "Hiba történt a ház létrehozása során." };
        }
    },

    async joinHouse(inviteCode: string, userId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const userObjectId = new mongoose.Types.ObjectId(userId);

            const house = await House.findOne({ inviteCode });

            if (!house) {
                return { success: false, message: "Érvénytelen vagy lejárt meghívó kód." };
            }
            const isMember = house.members.some((id: mongoose.Types.ObjectId) =>
                id.equals(userObjectId)
            );

            if (isMember) {
                return { success: false, message: "Már tagja vagy ennek a háztartásnak." };
            }

            const isPro = await SubscriptionService.userHasProSubscription(house?.ownerId.toString() || "");

            if (!isPro && house?.members.length >= 2) {
                return {
                    success: false,
                    message: "A háztartáshoz való csatlakozáshoz Pro előfizetés szükséges. Kattints a bővebb információért!",
                };
            }

            await House.findByIdAndUpdate(house._id, {
                $push: { members: userObjectId },
            });

            await User.findByIdAndUpdate(userObjectId, {
                $push: { houses: house._id },
                $set: { selectedHouse: house._id }
            });

            return {
                success: true,
                message: "Sikeresen csatlakoztál a háztartáshoz.",
                house: house,
                newToken: await this.getNewUserToken(userId, house._id.toString()),
            };
        } catch (error) {
            console.error("JoinHouse Error:", error);
            return { success: false, message: "Hiba történt a csatlakozás során." };
        }
    },

    async getHouseDetails(houseId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();

            const house = await House.findById(houseId)
                .populate("members", "name email image")
                .exec();

            if (!house) {
                return { success: false, message: "A háztartás nem található." };
            }

            return { success: true, message: "Adatok lekérve.", house };
        } catch (error) {
            console.error("GetHouseDetails Error:", error);
            return { success: false, message: "Hiba történt az adatok lekérésekor." };
        }
    },

    async getHouseDetailsByUserId(userId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const houseId = await User.findById(userId).select("selectedHouse houses").lean().exec();
            if (!houseId || !houseId.selectedHouse && (!houseId.houses || houseId.houses.length === 0)) {
                return { success: false, message: "Nincs aktív háztartás." };
            }
            const house = await House.findOne({ _id: houseId?.selectedHouse || houseId?.houses[0]?.toString() })
                .populate("members", "name email image colorCode").exec();

            if (!house) {
                return { success: false, message: "A háztartás nem található." };
            }

            return { success: true, message: "Adatok lekérve.", house: house };
        } catch (error) {
            console.error("GetHouseDetailsByUserId Error:", error);
            return { success: false, message: "Hiba történt az adatok lekérésekor." };
        }
    },

    async getHousesDetailsByUserId(userId: string): Promise<HousesServiceResponse> {
        try {
            await dbConnect();

            const houses = await House.find({ members: new mongoose.Types.ObjectId(userId) })
                .populate("members", "name email image colorCode").exec();

            if (!houses || houses.length === 0) {
                return { success: false, message: "A háztartás nem található." };
            }

            return { success: true, message: "Adatok lekérve.", houses: houses };
        } catch (error) {
            console.error("GetHousesDetailsByUserId Error:", error);
            return { success: false, message: "Hiba történt az adatok lekérésekor." };
        }
    },

    async updateHouse(houseId: string, data: { name: string; address: string }): Promise<HouseServiceResponse> {
        try {
            await dbConnect();

            const updatedHouse = await House.findByIdAndUpdate(
                houseId,
                { $set: { name: data.name, address: data.address } },
                { new: true }
            );

            if (!updatedHouse) {
                return { success: false, message: "A háztartás nem található." };
            }

            return {
                success: true,
                message: "Háztartás adatai frissítve.",
                house: updatedHouse
            };
        } catch (error) {
            console.error("UpdateHouse Error:", error);
            return { success: false, message: "Hiba történt a frissítés során." };
        }
    },

    async deleteHouse(houseId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const houseObjectId = new mongoose.Types.ObjectId(houseId);

            // 1. Keressük meg a házat, hogy tudjuk kik a tagok
            const house = await House.findById(houseObjectId);
            if (!house) {
                return { success: false, message: "A háztartás nem található." };
            }

            // 2. Távolítsuk el a ház hivatkozást az összes tagnál a User modellben
            await User.updateMany(
                { _id: { $in: house.members } },
                { $pull: { houses: houseObjectId }, $set: { selectedHouse: null } }
            );

            await Settings.updateMany(
                { userId: { $in: house.members } },
                { $pull: { "widgets": { [houseId]: { $exists: true } } } }
            );

            // 3. Töröljük magát a házat
            await House.findByIdAndDelete(houseObjectId);

            // Megjegyzés: Itt érdemes lehet törölni a házhoz tartozó mérőórákat és méréseket is!

            return {
                success: true,
                message: "Háztartás és minden kapcsolódó hozzáférés törölve."
            };
        } catch (error) {
            console.error("DeleteHouse Error:", error);
            return { success: false, message: "Hiba történt a törlés során." };
        }
    },

    async leaveHouse(houseId: string, userId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const houseObjectId = new mongoose.Types.ObjectId(houseId);

            const house = await House.findById(houseObjectId);
            if (!house) {
                return { success: false, message: "A háztartás nem található." };
            }

            // Tulajdonos nem hagyhatja el a házat (törölnie kell vagy átadni)
            if (house.ownerId.equals(userObjectId)) {
                return {
                    success: false,
                    message: "Tulajdonosként nem hagyhatod el a házat. Használd a törlés funkciót!"
                };
            }

            // Eltávolítás a ház tagjai közül
            await House.findByIdAndUpdate(houseObjectId, {
                $pull: { members: userObjectId }
            });

            // Eltávolítás a felhasználó házai közül
            await User.findByIdAndUpdate(userObjectId, {
                $pull: { houses: houseObjectId }
            });

            return {
                success: true,
                message: "Sikeresen elhagytad a háztartást."
            };
        } catch (error) {
            console.error("LeaveHouse Error:", error);
            return { success: false, message: "Hiba történt a kilépés során." };
        }
    },

    async getHouseMembers(houseId: string): Promise<HouseServiceResponse & { members?: IUser[] }> {
        try {
            await dbConnect();
            const house = await House.findById(houseId)
                .populate("members", "name email image")
                .lean();

            if (!house) return { success: false, message: "Ház nem található." };

            return {
                success: true,
                message: "Tagok lekérve.",
                house: house as IHouse,
                members: house.members as unknown as IUser[]
            };
        } catch (error) {
            return { success: false, message: "Hiba a tagok lekérésekor." };
        }
    },

    async removeMember(houseId: string, memberId: string, requesterId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const house = await House.findById(houseId);
            if (!house) return { success: false, message: "Ház nem található." };

            // Csak a tulajdonos távolíthat el tagot
            if (house.ownerId.toString() !== requesterId) {
                return { success: false, message: "Nincs jogosultságod tag eltávolításához." };
            }

            // Tulajdonost nem lehet eltávolítani
            if (house.ownerId.toString() === memberId) {
                return { success: false, message: "A tulajdonos nem távolítható el." };
            }

            await House.findByIdAndUpdate(houseId, { $pull: { members: memberId } });
            await User.findByIdAndUpdate(memberId, { $pull: { houses: houseId } });

            return { success: true, message: "Tag eltávolítva." };
        } catch (error) {
            return { success: false, message: "Hiba az eltávolítás során." };
        }
    },

    async changeSelectedHouse(userId: string, houseId: string): Promise<HouseServiceResponse> {
        try {
            await dbConnect();
            const userObjectId = new mongoose.Types.ObjectId(userId);
            const houseObjectId = new mongoose.Types.ObjectId(houseId);

            const house = await House.findById(houseObjectId);
            if (!house) {
                return { success: false, message: "Ház nem található." };
            }

            const isMember = house.members.some((id: mongoose.Types.ObjectId) =>
                id.equals(userObjectId)
            );

            if (!isMember) {
                return { success: false, message: "Nem vagy tagja ennek a háztartásnak." };
            }

            await User.findByIdAndUpdate(userObjectId, {
                $set: { selectedHouse: houseObjectId }
            });

            return {
                success: true,
                message: "Aktív háztartás megváltoztatva.",
                newToken: await this.getNewUserToken(userId, houseId)
            };
        } catch (error) {
            console.error("ChangeSelectedHouse Error:", error);
            return { success: false, message: "Hiba a háztartás váltása során." };
        }
    }
};