"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
    X, Gem, QrCode, UserPlus, HelpCircle, User,
    Home, FileText, Lightbulb, Bell, LogOut,
    PenTool
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
    const [activeSheet, setActiveSheet] = useState<string | null>(null);
    const [isPro, setIsPro] = useState(false);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    // Értesítési állapot
    const [unreadCount, setUnreadCount] = useState(0);

    const householdCode = house?.inviteCode || "N/A";
    const displayName = profile?.name || "Felhasználó";

    // Adatok lekérése a backendből
    const fetchUnreadCount = async () => {
        const res = await getNotificationsAction();
        if (res.success) {
            setUnreadCount(res.unreadCount as number);
        }
    };

    const handleSheetActivation = (sheetId: string) => {
        setActiveSheet(sheetId);
        if (sheetId === 'appearance') {
            router.push("/dashboard/appearance");
        }
    }

    // Kezdeti betöltés és frissítés a sheet bezárásakor
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUnreadCount();

        // Ha visszatérünk az értesítésekből, frissítsük a számot
        if (activeSheet === null) {
            fetchUnreadCount();
        }
    }, [activeSheet]);

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
        { id: "household", icon: <Home className="w-5 h-5 text-emerald-400" />, label: "Háztartás adatai" },
        { id: "reports", icon: <FileText className="w-5 h-5 text-orange-400" />, label: "Rezsi jelentések" },
        { id: "energy", icon: <Lightbulb className="w-5 h-5 text-yellow-400" />, label: "Energiatakarékosság" },
        { id: "notifications", icon: <Bell className="w-5 h-5 text-primary" />, label: "Értesítések", badge: unreadCount },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen  px-4 pt-12 pb-32 flex flex-col gap-6"
        >
            {/* HEADER */}
            <motion.header variants={itemVariants} className="flex items-center justify-between">
                <Link href="/dashboard" className="w-12 h-12 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <X className="w-5 h-5 text-white" />
                </Link>
                <button
                    onClick={() => setIsPro(!isPro)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all active:scale-95 ${isPro ? "bg-primary border-primary" : "bg-surface-elevated border-white/5"}`}
                >
                    <Gem className={`w-4 h-4 ${isPro ? "text-white" : "text-primary"}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isPro ? "text-white" : "text-white"}`}>LakasInfo Pro</span>
                </button>
            </motion.header>

            {/* PROFIL AVATAR */}
            <motion.div variants={itemVariants} className="flex flex-col items-center mt-2">
                <div onClick={() => setActiveSheet("qr")} className="relative cursor-pointer group">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-orange-500 p-1">
                        <div className="w-full h-full rounded-full bg-surface flex items-center justify-center border-[3px] border-background">
                            <span className="text-4xl font-black text-white tracking-tighter">{initials}</span>
                        </div>
                    </div>
                    <div className="absolute bottom-1 right-1 w-9 h-9 bg-surface-elevated border border-white/10 rounded-full flex items-center justify-center shadow-lg group-active:scale-90 transition-transform">
                        <QrCode className="w-4 h-4 text-primary" />
                    </div>
                </div>
                <h1 className="text-4xl font-black text-white mt-6 tracking-tight">{displayName}</h1>
            </motion.div>

            {/* GYORS KÁRTYÁK */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl flex flex-col justify-between aspect-square">
                    <div className="w-12 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl" />
                    <div>
                        <h3 className="text-white font-black text-xl leading-none">{isPro ? "Pro" : "Alap"}</h3>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-2 block">Csomag</span>
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} onClick={handleCopy} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl flex flex-col justify-between aspect-square cursor-pointer active:scale-95 transition-transform">
                    <div className="w-12 h-12 bg-surface-elevated rounded-2xl flex items-center justify-center border border-white/5">
                        <UserPlus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-black text-[15px] leading-tight">Lakótárs</h3>
                        <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1 block">{copied ? "Másolva!" : "Meghívás"}</span>
                    </div>
                </motion.div>
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
                            <span className="text-white font-bold text-[17px] tracking-tight">{item.label}</span>
                        </div>
                        {item.badge && item.badge > 0 ? (
                            <div className="px-2.5 py-1 rounded-full bg-primary text-white font-black text-[10px] shadow-[0_0_15px_rgba(255,59,48,0.4)]">
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
        </motion.div>
    );
}