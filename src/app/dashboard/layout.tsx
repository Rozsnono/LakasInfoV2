import React from "react";
import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { HouseProvider } from "@/contexts/house.context";
import DashboardNav from "./navbar"; // A friss kliens komponensünk
import mongoose from "mongoose";
import OurLine from "./ourline";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
    const result = await getUserHouseAction();

    if (!result.success || !result.hasHouse || !result.house) {
        redirect("/onboarding");
    }

    const houseData = {
        _id: result.house._id.toString(),
        name: result.house.name,
        address: result.house.address,
        members: result.house.members.map((member: string | mongoose.Types.ObjectId) => member.toString()),
        subscriptionPlan: result.house.subscriptionPlan || "free"
    };

    return (
        <div className="flex flex-col h-screen relative overflow-hidden text-text-primary">

            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <HouseProvider house={houseData}>
                    {children}
                </HouseProvider>
            </div>
            <OurLine />
            <DashboardNav />

        </div>
    );
}