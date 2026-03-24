import { useUser } from "@/contexts/user.context";
import { Gem } from "lucide-react";

export default function PremiumBadge({ className }: { className?: string }) {
    const { user } = useUser();
    if (user?.subscriptionPlan == 'pro') return null;
    return (
        <div className={`absolute ${className}`}>
            <Gem className={`text-yellow-500/50 ${className}`}></Gem>
        </div>
    )
}