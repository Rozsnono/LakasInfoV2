import PropertiesClient from "./client";

import { redirect } from "next/navigation";
import { getUserHousesAction } from "@/app/actions/house";

export default async function PropertiesPage() {

    const result = await getUserHousesAction();

    if (!result.success || !result.houses || result.houses.length === 0) {
        redirect("/onboarding");
    }

    return <PropertiesClient houses={result.houses} />;
}

