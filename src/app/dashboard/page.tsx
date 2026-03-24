import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import { MeterService } from "@/services/meter.service";
import { NotificationService } from "@/services/notification.service"; // Importáld a service-t
import DashboardClient from "./client";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { subscriptionIsExpiredAction } from "../actions/subscription";

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

export default async function DashboardPage() {
    const result = await getUserHouseAction();
    const userId = await getUserId();

    if (!result.success || !result.hasHouse || !userId) {
        redirect("/onboarding");
    }


    await NotificationService.makeForSubscriptionEnding(userId);
    // Párhuzamosan kérjük le a mérőórákat és az olvasatlan értesítések számát
    const [meters, unreadCount] = await Promise.all([
        MeterService.getDashboardData(result.house._id.toString()),
        NotificationService.getUnreadCount(userId)
    ]);

    return (
        <DashboardClient
            houseAddress={result.house.address}
            initialMeters={JSON.parse(JSON.stringify(meters))}
            initialUnreadCount={unreadCount} // Átadjuk az induló számot
        />
    );
}