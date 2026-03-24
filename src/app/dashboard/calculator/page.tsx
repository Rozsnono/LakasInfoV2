import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import CalculatorClient from "./client";
import { IMeter, IMeterBase } from "@/models/meter.model";
import { SubscriptionService } from "@/services/subscription.service";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs");

async function getUserId() {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.userId as string;
    } catch { return null; }
}

export default async function CalculatorPage() {
    const houseResult = await getUserHouseAction();
    const userId = await getUserId();

    if (!houseResult.success || !houseResult.hasHouse) {
        redirect("/onboarding");
    }
    // Lekérjük az összes mérőórát a házhoz
    const meters = await MeterService.getMetersByHouse(houseResult.house!._id);


    // Csak azokat adjuk át, amiknek van beállított ára
    const validMeters = meters
        .filter(m => m.basePrice !== null && m.marketPrice !== null)
        .map(m => ({
            _id: m._id.toString(),
            name: m.name,
            type: m.type,
            unit: m.unit,
            basePrice: m.basePrice,
            marketPrice: m.marketPrice,
            tierLimit: m.tierLimit || 0
        }));

    return <CalculatorClient initialMeters={validMeters as IMeterBase[]} />;
}