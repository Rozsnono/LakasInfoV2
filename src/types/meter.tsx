import { Droplets, Flame, Zap } from "lucide-react";

export const getMeterVisuals = (type: string) => {
    switch (type) {
        case "villany": return { icon: <Zap className="w-5 h-5 text-text-primary" />, color: "bg-yellow-500", hex: "#eab30840" };
        case "gaz": return { icon: <Flame className="w-5 h-5 text-text-primary" />, color: "bg-orange-500", hex: "#f9731640" };
        case "viz": return { icon: <Droplets className="w-5 h-5 text-text-primary" />, color: "bg-blue-500", hex: "#3b82f640" };
        default: return { icon: <Zap className="w-5 h-5 text-text-primary" />, color: "bg-gray-500", hex: "#6b728040" };
    }
};