import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import MetersClient from "./client"; // A fenti komponens

export default async function MetersPage() {
    // 1. Hitelesítés és a ház lekérése
    const houseResult = await getUserHouseAction();

    if (!houseResult.success || !houseResult.hasHouse || !houseResult.house) {
        redirect("/onboarding");
    }

    // 2. Az adott házhoz tartozó összes mérőóra lekérése a szervizből
    const meters = await MeterService.getDashboardData(houseResult.house._id.toString());

    // 3. A JSON parse/stringify azért kell, hogy a Mongoose ObjectId-k 
    // tiszta stringekké/objektumokká alakuljanak, amit a Kliens Komponens már megért.
    const cleanMeters = JSON.parse(JSON.stringify(meters));

    // 4. Rendereljük a klienst a valós adatokkal
    return <MetersClient initialMeters={cleanMeters} />;
}