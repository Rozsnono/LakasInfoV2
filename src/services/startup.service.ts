"use strict";

import { cookies } from "next/headers";
import { UserService } from "./profile.service";
import { jwtVerify, SignJWT } from "jose";
import { SubscriptionService } from "./subscription.service";
import { HouseService } from "./house.service";
import { SettingsService } from "./settings.service";
import { IUser } from "@/models/user.model";
import { ISubscription } from "@/models/subsription.modal";
import { IHouse } from "@/models/house.model";
import { ISettings } from "@/models/settings.modal";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { SubscriptionStatus } from "@/types/subscription";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs"
);


export const StartupService = {

    async getDatasForCookies() {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) return null;

        const { payload } = await jwtVerify(token, JWT_SECRET);

        const user = await UserService.getUserById(payload.userId as string);
        if (!user.success || !user.user) return null;

        const subscription = await SubscriptionService.getSubscriptionStatus(payload.userId as string);
        if (!subscription) return null;

        const house = await HouseService.getHouseDetailsByUserId(payload.userId as string);
        if (!house.success || !house.house) return null;

        const settings = await SettingsService.getSettings(payload.userId as string);
        if (!settings) return null;

        return {
            user: user.user as IUser,
            subscription: subscription as SubscriptionStatus,
            house: house.house as IHouse,
            settings: settings as ISettings
        };
    },

    async settingCookies(data: { user: IUser | null, subscription: SubscriptionStatus | null, house: IHouse | null, settings: ISettings | null }) {
        const cookieStore = await cookies();

        if (data.user && data.subscription && data.house && data.settings) {
            const newToken = await new SignJWT({
                userId: data.user._id.toString(),
                name: data.user.name,
                email: data.user.email,
                colorCode: data.user.colorCode,
                subscriptionPlan: data.subscription.plan,
                subscriptionExpiresAt: data.subscription.expiresAt!.toISOString(),
                houseId: data.house._id.toString(),
                houseRole: data.house.membersRoles.get(data.user._id.toString()) || 'guest'
            })
                .setProtectedHeader({ alg: "HS256" })
                .setIssuedAt()
                .setExpirationTime("7d")
                .sign(JWT_SECRET);

            cookieStore.set("token", newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: "lax",
            });
        }

        if (data.settings) {

            const cookieSettings: Partial<ResponseCookie> = {
                httpOnly: false,
                secure: process.env.NODE_ENV === "production",
                maxAge: 60 * 60 * 24 * 365,
                path: "/",
                sameSite: "lax",
            }

            cookieStore.set("app_theme", data.settings.theme, cookieSettings);

            cookieStore.set("app_accent", data.settings.accent, cookieSettings);

            cookieStore.set("app_animations", data.settings.animations.toString(), cookieSettings);

            cookieStore.set("app_wallpaper", data.settings.wallpaper, cookieSettings);

            cookieStore.set("app_widgets", JSON.stringify(data.settings.widgets), cookieSettings);
        }
    }
};