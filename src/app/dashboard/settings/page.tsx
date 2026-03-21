import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import HouseSettingsClient from "./client";

export default async function HouseSettingsPage() {
    const result = await getUserHouseAction();

    if (!result.success || !result.house) {
        redirect("/onboarding");
    }

    return <HouseSettingsClient initialHouse={result.house} />;
}