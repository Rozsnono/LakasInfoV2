import { redirect } from "next/navigation";
import { getUserHouseAction } from "@/app/actions/house";
import OnboardingClient from "./client";

export default async function OnboardingPage() {
    const result = await getUserHouseAction();

    if (result.success && result.hasHouse) {
        await redirect("/dashboard");
    }

    return <OnboardingClient />;
}