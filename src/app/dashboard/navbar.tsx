"use client";

import Link from "@/contexts/router.context";
import React from "react";
import { usePathname } from "next/navigation";
import { Home, Gauge, BarChart3, User, History, MessageSquareIcon } from "lucide-react";

export default function DashboardNav() {
    const pathname = usePathname();

    const navItems = [
        {
            label: "Kezdőlap",
            href: "/dashboard",
            icon: <Home className="w-5 h-5" strokeWidth={2.5} />,
            // Pontosan a főoldalon aktív
            isActive: pathname === "/dashboard",
        },
        {
            label: "Óraállások",
            href: "/dashboard/meters",
            icon: <Gauge className="w-5 h-5" strokeWidth={2} />,
            // Aktív, ha a /meters útvonalon vagyunk (pl. /meters/m1-en is)
            isActive: pathname.startsWith("/dashboard/meters"),
        },
        {
            label: "Előzmények",
            href: "/dashboard/history",
            icon: <History className="w-5 h-5" strokeWidth={2.5} />,
            isActive: pathname.startsWith("/dashboard/history"),
        },
        {
            label: "Üzenetek",
            href: "/dashboard/messages",
            icon: <MessageSquareIcon className="w-5 h-5" strokeWidth={2} />,
            isActive: pathname.startsWith("/dashboard/messages"),
        }
    ];

    if (pathname.startsWith("/dashboard/messages/")) {
        return null;
    }

    return (
        <>
            {/* Lebegő alsó navigációs sáv */}
            <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-md bg-surface/90 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 py-4 flex justify-between items-center z-50 shadow-2xl">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${item.isActive ? "scale-110" : "opacity-50 hover:opacity-80"
                            }`}
                    >
                        <div
                            className={`flex items-center justify-center transition-all duration-300 ${item.isActive ? "text-primary" : "text-text-primary"
                                }`}
                        >
                            {item.icon}
                        </div>
                        {/* <span
                            className={`text-[9px] font-black uppercase tracking-widest transition-colors ${item.isActive ? "text-primary" : "text-text-primary/60"
                                }`}
                        >
                            {item.label}
                        </span> */}
                    </Link>
                ))}
            </div>

            {/* Fekete átmenet (Fade) az oldal alján, hogy a tartalom szépen eltűnjön a menü mögött */}
            <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent h-24 z-20 pointer-events-none" />
        </>
    );
}