import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { getAllReadingsAction } from "@/app/actions/reading";
import AllReadingsClient from "./client";
import { IReadingWithInfo, ReadingWithMeterInfo } from "@/services/reading.service";
export default async function AllReadingsPage() {
    const houseResult = await getUserHouseAction();

    if (!houseResult.success || !houseResult.hasHouse) {
        redirect("/onboarding");
    }

    const readingsResult = await getAllReadingsAction(houseResult.house!._id);
    const cleanReadings: IReadingWithInfo[] = readingsResult.success
        ? readingsResult.value!.map((r: ReadingWithMeterInfo | unknown) => ({
            _id: (r as ReadingWithMeterInfo)._id.toString(),
            meterId: (r as ReadingWithMeterInfo).meterId.toString(),
            unit: (r as ReadingWithMeterInfo).meterUnit || "",
            name: (r as ReadingWithMeterInfo).meterName || "Ismeretlen óra",
            type: (r as ReadingWithMeterInfo).type || "villany",
            value: `${(r as ReadingWithMeterInfo).value.toLocaleString()} kWh`, // Itt már formázhatod is
            dateLabel: new Date((r as ReadingWithMeterInfo).date).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' }),
            fullDate: new Date((r as ReadingWithMeterInfo).date).toISOString(),
            hasPhoto: !!(r as ReadingWithMeterInfo).photoUrl,
            photoUrl: (r as ReadingWithMeterInfo).photoUrl || null,
        } as IReadingWithInfo))
        : [];

    return (
        <AllReadingsClient
            initialReadings={cleanReadings as IReadingWithInfo[]}
        />
    );
}