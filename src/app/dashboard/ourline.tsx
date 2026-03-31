"use client";

import { useUser } from "@/contexts/user.context";

export default function OurLine() {

    const { user } = useUser();

    if (!user) return null;
    if (user.houseRole !== "guest") return null;

    return (
        <div className="w-full h-full border-2 border-primary/40 rounded-lg select-none pointer-events-none absolute z-50" />
    )
}