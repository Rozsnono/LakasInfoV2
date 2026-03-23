import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import ExportClient from "./client";
import { IMeter } from "@/models/meter.model";

export default async function CalculatorPage() {
    const houseResult = await getUserHouseAction();

    if (!houseResult.success || !houseResult.hasHouse) {
        redirect("/onboarding");
    }

    const meters = await MeterService.getMetersByHouse(houseResult.house!._id);

    const validMeters = meters
        .map(m => ({
            _id: m._id.toString(),
            name: m.name,
            type: m.type,
            unit: m.unit,
            basePrice: m.basePrice,
            marketPrice: m.marketPrice,
            tierLimit: m.tierLimit || 0
        }));

    return <ExportClient initialMeters={validMeters as unknown as IMeter[]} />;
}