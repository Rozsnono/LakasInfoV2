"use client";

import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useRouter } from "@/contexts/router.context";
import { logoutAction } from "@/app/actions/auth";
import { getCurrentUserAction } from "@/app/actions/profile";
import { Loader2 } from "lucide-react";

export interface HouseData {
    _id: string;
    joinCodes?: Map<string, number>;
    name?: string;
}

export interface ProfileData {
    _id: string;
    name: string;
    email: string;
    image?: string;
    houseId?: string;
    house?: HouseData;
    colorCode?: string;
    firstName?: string;
    householdCode?: string;
    houseRole?: string;
    houseSubscriptionPlan?: "free" | "pro" | "enterprise";
    subscriptionPlan?: "free" | "pro" | "enterprise";
    subscriptionExpiresAt?: string | null;
}

interface ProfileContextType {
    user: ProfileData | null;
    isLoading: boolean;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadUser = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getCurrentUserAction();
            if (response.success && response.user) {
                setUser(response.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error(error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadUser();
    }, [loadUser]);

    const logout = useCallback(async () => {
        try {
            const response = await logoutAction();
            if (response.success) {
                setUser(null);
                router.push("/login");
                router.refresh();
            }
        } catch {
            console.error("Logout failed");
        }
    }, [router]);

    return (
        <ProfileContext.Provider value={{ user, isLoading, logout, refreshUser: loadUser }}>
            {isLoading ? (
                <div className="min-h-[100dvh] w-full  flex flex-col items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                </div>
            ) : (
                children
            )}
        </ProfileContext.Provider>
    );
}

export function useUser() {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a ProfileProvider");
    }
    return context;
}