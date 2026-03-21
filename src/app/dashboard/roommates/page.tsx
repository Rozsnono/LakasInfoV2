import { redirect } from "next/navigation";
import { getRoommatesAction } from "@/app/actions/house";
import RoommatesClient from "./client";

export default async function RoommatesPage() {
    const result = await getRoommatesAction();

    if (!result.success) {
        redirect("/dashboard");
    }

    return (
        <RoommatesClient 
            initialMembers={result.members} 
            inviteCode={result.house.inviteCode}
            isOwner={result.currentUserId === result.house.ownerId}
        />
    );
}