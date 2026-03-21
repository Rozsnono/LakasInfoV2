import React from "react";
import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { HouseProvider } from "@/contexts/house.context";
import DashboardNav from "./navbar"; // A friss kliens komponensünk
import mongoose from "mongoose";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    // 1. Lekérjük a felhasználó házát az adatbázisból (Server Side)
    const result = await getUserHouseAction();

    // 2. Ha nincs háza, visszadobjuk az Onboardingra
    if (!result.success || !result.hasHouse || !result.house) {
        redirect("/onboarding");
    }

    // 3. Megtisztítjuk és típusosítjuk a kliens számára átadandó adatot
    const houseData = {
        _id: result.house._id.toString(),
        name: result.house.name,
        address: result.house.address,
        members: result.house.members.map((member: string | mongoose.Types.ObjectId) => member.toString()) // Csak ID-k a contextben
    };

    return (
        <div className="flex flex-col h-screen relative overflow-hidden text-white">

            <div className="flex-1 overflow-y-auto pb-32 scrollbar-hide">
                <HouseProvider house={houseData}>
                    {children}
                </HouseProvider>
            </div>

            <DashboardNav />

        </div>
    );
}