import { redirect } from "next/navigation";
import { getUserHousesAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import MapClient from "./client"; // A fenti komponens

export default async function MetersPage() {
    // 1. Hitelesítés és a ház lekérése
    const houseResult = await getUserHousesAction();

    if (!houseResult.success || !houseResult.hasHouse || !houseResult.houses) {
        redirect("/onboarding");
    }

    return <MapClient houses={houseResult.houses} />;
}