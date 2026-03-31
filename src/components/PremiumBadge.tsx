import { useHouse } from "@/contexts/house.context";
import { useUser } from "@/contexts/user.context";
import { Building, Crown, Gem } from "lucide-react";

export default function PremiumBadge({ className, isEnterprise }: { className?: string, isEnterprise?: boolean }) {
    const { user } = useUser();
    const { house } = useHouse();
    
    if(user?.subscriptionPlan === 'enterprise' || house?.subscriptionPlan === 'enterprise') return null;
    if (!isEnterprise && (user?.subscriptionPlan === 'pro' || house?.subscriptionPlan === 'pro')) return null;

    if(isEnterprise) {
        return (
            <div className={`absolute ${className}`}>
                <Crown className={`text-yellow-500/50 ${className}`} />
            </div>
        )
    }
    return (
        <div className={`absolute ${className}`}>
            <Gem className={`text-yellow-500/50 ${className}`}></Gem>
        </div>
    )
}