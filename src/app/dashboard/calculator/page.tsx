import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import CalculatorClient from "./client";
import { IMeter } from "@/models/meter.model";

export default async function CalculatorPage() {
    const houseResult = await getUserHouseAction();

    if (!houseResult.success || !houseResult.hasHouse) {
        redirect("/onboarding");
    }

    // Lekérjük az összes mérőórát a házhoz
    const meters = await MeterService.getMetersByHouse(houseResult.house!._id);

    // Csak azokat adjuk át, amiknek van beállított ára
    const validMeters = meters
        .filter(m => m.basePrice !== null && m.marketPrice !== null)
        .map(m => ({
            _id: m._id,
            name: m.name,
            type: m.type,
            unit: m.unit,
            basePrice: m.basePrice,
            marketPrice: m.marketPrice,
            tierLimit: m.tierLimit || 0
        }));

    return <CalculatorClient initialMeters={validMeters as IMeter[]} />;
}