"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    X, Gem, QrCode, UserPlus, HelpCircle, User,
    Home, FileText, Lightbulb, Bell, LogOut,
    PenTool, ShieldCheck, Crown, Loader2
} from "lucide-react";
import Link from "@/contexts/router.context";
import PersonalDataSheet from "@/components/PersonalDataSheet";
import NotificationsSheet from "@/components/NotificationsSheet";
import HouseholdDataSheet from "@/components/HouseholdDataSheet";
import HelpSupportSheet from "@/components/HelpSupportSheet";
import EnergyEfficiencySheet from "@/components/EnergyEfficiencySheet";
import ReadingReportsSheet from "@/components/ReadingReportsSheet";
import QrCodeSheet from "@/components/QrCodeSheet";
import { useUser } from "@/contexts/user.context";
import { useHouse } from "@/contexts/house.context";
import { getNotificationsAction } from "@/app/actions/notification";
import { useRouter } from "@/contexts/router.context";
import AppInfoSheet from "@/components/AppInfosSheet";
import { getSubscriptionStatusTitle } from "@/types/subscription";
import { useAction } from "@/providers/action.provider";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function ProfilePage() {
    const { user: profile, logout } = useUser();
    const { house } = useHouse();
    const router = useRouter();

    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    const [isPro, setIsPro] = useState(profile?.subscriptionPlan === "pro");
    const [copied, setCopied] = useState(false);

    const householdCode = house?.inviteCode || "N/A";
    const displayName = profile?.name || "Felhasználó";

    // Az értesítések lekérése useAction segítségével
    const { data: notifData, isPending: isNotifPending, execute: fetchNotifications } = useAction(
        getNotificationsAction,
        { immediate: true }
    );

    const unreadCount = notifData?.success ? (notifData.unreadCount as number) : 0;

    const handleSheetActivation = (sheetId: string) => {
        setActiveSheet(sheetId);
        if (sheetId === 'appearance') {
            router.push("/dashboard/appearance");
        }
    }

    // Ha bezárunk egy Sheet-et, frissítsük az értesítések számát
    useEffect(() => {
        if (activeSheet === null) {
            fetchNotifications();
        }
    }, [activeSheet, fetchNotifications]);

    const initials = displayName
        .split(" ")
        .map((n: string) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    const handleCopy = async () => {
        await navigator.clipboard.writeText(householdCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const menuItems = [
        { id: "help", icon: <HelpCircle className="w-5 h-5 text-blue-400" />, label: "Súgó és Támogatás" },
        { id: "personal", icon: <User className="w-5 h-5 text-zinc-400" />, label: "Személyes adatok" },
        { id: "appearance", icon: <PenTool className="w-5 h-5 text-primary" />, label: "Megjelenés" },
        { id: "reports", icon: <FileText className="w-5 h-5 text-orange-400" />, label: "Rezsi jelentések" },
        { id: "energy", icon: <Lightbulb className="w-5 h-5 text-yellow-400" />, label: "Energiatakarékosság" },
        { id: "notifications", icon: <Bell className="w-5 h-5 text-primary" />, label: "Értesítések", badge: unreadCount, isLoading: isNotifPending },
        { id: "appinfo", icon: <Gem className="w-5 h-5 text-purple-400" />, label: "Alkalmazás infók" },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen px-4 pt-12 pb-32 flex flex-col gap-6"
        >
            {/* HEADER */}
            <motion.header variants={itemVariants} className="flex items-center justify-between">
                <Link href="/dashboard" className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <X className="w-5 h-5 text-text-primary" />
                </Link>
                <button
                    onClick={() => setIsPro(!isPro)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all active:scale-95 ${isPro ? "bg-primary border-primary" : "bg-surface-elevated border-white/5"}`}
                >
                    {
                        isPro ?
                            <Gem className="w-4 h-4 text-text-primary" /> :
                            <ShieldCheck className="w-4 h-4 text-primary" />
                    }
                    <span className={`text-[10px] font-black uppercase tracking-widest text-text-primary`}>
                        LakasInfo {getSubscriptionStatusTitle(profile?.subscriptionPlan || "free")}
                    </span>
                </button>
            </motion.header>

            {/* PROFIL AVATAR */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mt-2">
                <div onClick={() => setActiveSheet("qr")} className="relative cursor-pointer group">
                    <div className="w-28 h-28 rounded-full p-1" style={{ background: profile?.colorCode }}>
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center border-[3px] border-background">
                            <span className="text-4xl font-black text-text-primary tracking-tighter">{initials}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 w-9 h-9 bg-surface-elevated border border-white/10 rounded-full flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                        <QrCode className="w-4 h-4 text-primary" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-text-primary mt-6 tracking-tight">{displayName}</h1>
            </motion.div>

            {/* GYORS KÁRTYÁK */}
            <div className="grid grid-cols-2 gap-4">
                <Link href="/dashboard/profile/subscriptions">
                    <motion.div whileTap={{ scale: 0.95 }} variants={itemVariants} className={`bg-surface rounded-[2.5rem] p-6 ${isPro ? "border-2 border-primary" : "border border-white/5"} shadow-xl flex flex-col justify-between aspect-square relative`}>
                        <div className="w-12 h-8 rounded-xl" style={{ background: profile?.colorCode }} />
                        <div>
                            <h3 className="text-text-primary font-black text-xl leading-none">{getSubscriptionStatusTitle(profile?.subscriptionPlan || "free")}</h3>
                            <span className="text-text-primary/40 text-[10px] font-bold uppercase tracking-widest mt-2 block">Csomag</span>
                        </div>
                        {
                            isPro && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: [1, 1.15, 1]
                                    }}
                                    transition={{
                                        delay: 0.3,
                                        scale: {
                                            repeat: Infinity,
                                            duration: 2,
                                            ease: "easeInOut",
                                            delay: 0.8
                                        }
                                    }}
                                    className="absolute top-4 right-4 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(var(--primary),0.6)]"
                                >
                                    <Gem className="w-3 h-3 text-text-primary" />
                                </motion.div>
                            )
                        }
                    </motion.div>
                </Link>

                <Link href="/dashboard/roommates">
                    <motion.div whileTap={{ scale: 0.95 }} variants={itemVariants} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl flex flex-col justify-between aspect-square cursor-pointer active:scale-95 transition-transform">
                        <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center border border-white/5">
                            <UserPlus className="w-6 h-6 text-text-primary" />
                        </div>
                        <div>
                            <h3 className="text-text-primary font-black text-[15px] leading-tight">Lakótárs</h3>
                            <span className="text-text-primary/40 text-[10px] font-bold uppercase tracking-widest mt-1 block">{copied ? "Másolva!" : "Meghívás"}</span>
                        </div>
                    </motion.div>
                </Link>

            </div>

            {/* MENÜ LISTA */}
            <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden">
                {menuItems.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => handleSheetActivation(item.id)}
                        className={`w-full flex items-center justify-between p-6 active:bg-white/5 transition-colors ${idx !== menuItems.length - 1 ? "border-b border-white/5" : ""}`}
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{item.icon}</div>
                            <span className="text-text-primary font-bold text-[17px] tracking-tight">{item.label}</span>
                        </div>

                        {/* Töltés állapot vagy értesítés badge */}
                        {item.isLoading ? (
                            <div className="px-2 py-1 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                            </div>
                        ) : item.badge && item.badge > 0 ? (
                            <div className="px-2.5 py-1 rounded-full bg-primary text-text-primary font-black text-[10px] shadow-[0_0_15px_rgba(255,59,48,0.4)]">
                                {item.badge}
                            </div>
                        ) : null}
                    </button>
                ))}
            </motion.div>

            {/* KIJELENTKEZÉS */}
            <motion.button
                variants={itemVariants}
                onClick={logout}
                className="w-full py-6 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center gap-3 text-red-500 font-black uppercase tracking-widest text-xs active:bg-red-500/10 transition-colors"
            >
                <LogOut className="w-5 h-5" /> Kijelentkezés
            </motion.button>

            {/* SHEETS */}
            <PersonalDataSheet isOpen={activeSheet === "personal"} onClose={() => setActiveSheet(null)} />
            <NotificationsSheet isOpen={activeSheet === "notifications"} onClose={() => setActiveSheet(null)} />
            <HouseholdDataSheet isOpen={activeSheet === "household"} onClose={() => setActiveSheet(null)} />
            <HelpSupportSheet isOpen={activeSheet === "help"} onClose={() => setActiveSheet(null)} />
            <EnergyEfficiencySheet isOpen={activeSheet === "energy"} onClose={() => setActiveSheet(null)} />
            <ReadingReportsSheet isOpen={activeSheet === "reports"} onClose={() => setActiveSheet(null)} />
            <QrCodeSheet isOpen={activeSheet === "qr"} onClose={() => setActiveSheet(null)} code={householdCode} />
            <AppInfoSheet isOpen={activeSheet === "appinfo"} onClose={() => setActiveSheet(null)} />
        </motion.div>
    );
}