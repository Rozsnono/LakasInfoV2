import dbConnect from "@/lib/dbConnect";
import { SubscriptionInput, SubscriptionResponse, SubscriptionStatus } from "@/types/subscription";
import Subscription from "@/models/subsription.modal";

export const SubscriptionService = {

    async updateSubscription(data: SubscriptionInput): Promise<SubscriptionResponse> {
        try {
            await dbConnect();

            const existingUser = await Subscription.findOne({ userId: data.userId });
            if (!existingUser) {
                await this.createSubscription(data.userId);
                return { success: false, message: "Előfizetés nem található, létrehoztam egy újat a felhasználóhoz. Kérlek próbáld újra a frissítést." };
            }

            const newData = await Subscription.findOneAndUpdate(
                { userId: data.userId },
                {
                    startDate: new Date(),
                    endDate: data.type === "monthly" ? new Date(new Date().setMonth(new Date().getMonth() + 1)) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
                    plan: data.plan,
                    isRenewable: true,
                    isPaid: true,
                },
                { new: true }
            );

            return {
                success: true,
                message: "Előfizetés sikeresen frissítve.",
                plan: newData?.plan || "free",
                endDate: newData?.endDate || null,
            };
        } catch (error) {
            console.error("AuthService Update Subscription Error:", error);
            return { success: false, message: "Hiba történt az előfizetés frissítése során." };
        }
    },

    async createSubscription(userId: string): Promise<SubscriptionResponse> {
        try {
            await dbConnect();
            const existingUser = await Subscription.findOne({ userId });
            if (existingUser) {
                return { success: false, message: "Már létezik előfizetés ehhez a felhasználóhoz." };
            }

            const newSubscription = new Subscription({
                userId
            });

            await newSubscription.save();

            return {
                success: true,
                message: "Előfizetés sikeresen létrehozva.",
            };
        }
        catch (error) {
            console.error("AuthService Create Subscription Error:", error);
            return { success: false, message: "Hiba történt az előfizetés létrehozása során." };
        }
    },

    async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
        try {
            await dbConnect();
            const subscription = await Subscription.findOne({ userId });
            if (!subscription) {
                return { plan: "free", isActive: false, expiresAt: null };
            }
            const isActive = subscription.isPaid && (!subscription.endDate || subscription.endDate > new Date());
            return {
                plan: subscription.plan,
                isActive,
                expiresAt: subscription.endDate,
            };
        } catch (error) {
            console.error("AuthService Get Subscription Status Error:", error);
            return { plan: "free", isActive: false, expiresAt: null };
        }
    },

    async cancelSubscription(userId: string): Promise<SubscriptionResponse> {
        try {
            await dbConnect();
            const subscription = await Subscription.findOne({ userId });
            if (!subscription) {
                return { success: false, message: "Előfizetés nem található." };
            }
            subscription.isPaid = false;
            subscription.endDate = new Date();
            await subscription.save();
            return {
                success: true,
                message: "Előfizetés sikeresen lemondva.",
            };
        } catch (error) {
            console.error("AuthService Cancel Subscription Error:", error);
            return { success: false, message: "Hiba történt az előfizetés lemondása során." };
        }
    },

    async userHasProSubscription(userId: string): Promise<boolean> {
        try {
            await dbConnect();
            const subscription = await Subscription.findOne({ userId });
            return !!subscription && subscription.plan == 'pro' && (!subscription.endDate || subscription.endDate > new Date());
        } catch (error) {
            console.error("AuthService User Has Pro Subscription Error:", error);
            return false;
        }
    },

    async checkAndDowngradeExpiredSubscription(userId: string): Promise<{ plan: "free" | "pro" | "enterprise", expiresAt: Date | null } | null> {
        try {
            await dbConnect();
            const subscription = await Subscription.findOne({ userId });
            if (subscription && subscription.isPaid && !subscription.isRenewable && subscription.endDate && subscription.endDate <= new Date()) {
                subscription.isPaid = false;
                subscription.plan = "free";
                await subscription.save();
                return { plan: "free", expiresAt: null };
            } else if (subscription && subscription.isPaid && subscription.isRenewable && subscription.endDate && subscription.endDate <= new Date()) {
                subscription.endDate = new Date(new Date(subscription.endDate).getTime() + (new Date(subscription.endDate).getTime() - new Date(subscription.startDate).getTime()));
                await subscription.save();
                return { plan: subscription.plan, expiresAt: subscription.endDate };
            } else {
                return { plan: subscription?.plan || "free", expiresAt: subscription?.endDate || null };
            }
        } catch (error) {
            console.error("AuthService Check And Downgrade Expired Subscription Error:", error);
        }
        return null;
    }
};