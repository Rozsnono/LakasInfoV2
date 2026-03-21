import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import MeterDetailClient from "./client";

// Frissített típus: a params most már egy Promise-t ad vissza
export default async function MeterDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    // 0. A Next.js 15 követelménye: feloldjuk a params Promise-t
    const { id } = await params;

    // Hitelesítés
    const houseResult = await getUserHouseAction();

    if (!houseResult.success || !houseResult.hasHouse) {
        redirect("/onboarding");
    }

    let cleanData;

    try {
        // 1. Most már a feloldott "id"-t használjuk a "params.id" helyett
        const meterDetails = await MeterService.getMeterDetailsWithReadings(id);

        if (!meterDetails) {
            redirect("/dashboard/meters");
        }

        // 2. Kiszámoljuk a "trend" százalékot
        let trendPercentage = 0;
        let status: "optimal" | "warning" | "danger" = "optimal";

        if (meterDetails.readings && meterDetails.readings.length >= 2) {
            const utolso = meterDetails.readings[0].difference!;
            const elozo = meterDetails.readings[1].difference!;
            if (elozo > 0) {
                trendPercentage = Math.round(((utolso - elozo) / elozo) * 100);
            }
        }

        // Status számítás
        if (meterDetails.readings && meterDetails.readings.length > 0) {
            const utolsoFogyasztas = meterDetails.readings[0].difference!;
            const limit = meterDetails.tierLimit || 999999;

            if (utolsoFogyasztas > limit) status = "danger";
            else if (utolsoFogyasztas > limit * 0.8) status = "warning";
        }

        // 3. Adatok összeállítása
        cleanData = {
            id: meterDetails._id.toString(),
            name: meterDetails.name,
            type: meterDetails.type,
            unit: meterDetails.unit,
            currentValue: meterDetails.readings.length > 0 ? meterDetails.readings[0].value : meterDetails.initialValue,
            status,
            trendPercentage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            readings: meterDetails.readings.map((r: any) => ({
                _id: r._id.toString(),
                date: new Date(r.date),
                value: r.value,
                difference: r.difference,
                cost: r.calculatedCost || 0,
                photoUrl: r.photoUrl
            }))
        };


    } catch (error) {
        console.error("Hiba a mérőóra lekérésekor:", error);
        redirect("/dashboard/meters");
    }

    return <MeterDetailClient meter={cleanData} />;
}