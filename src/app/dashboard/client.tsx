"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Search,
    Bell,
    MapPin,
    Plus,
    Calculator,
    ReceiptText,
    MoreHorizontal,
    Zap,
    Flame,
    Droplets,
    TrendingUp,
    TrendingDown,
    ChartColumn,
    Gem
} from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import Link from "@/contexts/router.context";
import NewReadingSheet from "@/components/NewReadingSheet";
import MoreOptionsSheet from "@/components/MoreOptionsSheet";
import NotificationsSheet from "@/components/NotificationsSheet";
import WidgetSelectionSheet from "@/components/WidgetSheet";
import { MeterWithStats } from "@/services/meter.service";
import { useUser } from "@/contexts/user.context";
import { getNotificationsAction } from "@/app/actions/notification";
import Widgets from "@/components/Widgets";
import { useAppearance } from "@/contexts/appearance.context";
import { useHouse } from "@/contexts/house.context";
import PremiumBadge from "@/components/PremiumBadge";
import { subscriptionIsExpiredAction } from "../actions/subscription";
import { useAction } from "@/providers/action.provider";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

const balanceVariants: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function DashboardClient({
    houseAddress,
    initialMeters,
    initialUnreadCount
}: {
    houseAddress: string;
    initialMeters: MeterWithStats[];
    initialUnreadCount: number;
}) {
    const [isNewReadingOpen, setIsNewReadingOpen] = useState(false);
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isWidgetSheetOpen, setIsWidgetSheetOpen] = useState(false);

    const { widgets, setWidgets } = useAppearance();
    const { house } = useHouse();
    const [activeWidgetIds, setActiveWidgetIds] = useState<string[]>(widgets[house?._id.toString() || ""] || []);

    const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
    const { user } = useUser();

    const refreshNotifications = async () => {
        const res = await getNotificationsAction();
        if (res.success) {
            setUnreadCount(res.unreadCount as number);
        }
    };

    useEffect(() => {
        subscriptionIsExpiredAction()
        if (activeWidgetIds.length != (widgets[house?._id.toString() || ""] || []).length) {
            setWidgets({ ...widgets, [house?._id.toString() || ""]: activeWidgetIds });
        }
    }, [activeWidgetIds]);

    useEffect(() => {
        if (!isNotificationsOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            refreshNotifications();
        }
    }, [isNotificationsOpen]);

    const totalMonthlyCost = useMemo(() => {
        return initialMeters.reduce((acc, meter) => acc + (meter.lastReadingIsPaid ? 0 : meter.stats.totalCost), 0);
    }, [initialMeters]);

    const filteredMeters = useMemo(() => {
        return initialMeters.filter(meter => activeWidgetIds.includes(meter._id.toString()));
    }, [initialMeters, activeWidgetIds]);

    const handleToggleWidget = (id: string) => {
        setActiveWidgetIds(prev =>
            prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
        );
    };

    const getMeterVisuals = (type: string) => {
        switch (type) {
            case "villany": return { icon: <Zap className="w-5 h-5 text-white" />, color: "bg-yellow-500", hex: "#eab30840" };
            case "gaz": return { icon: <Flame className="w-5 h-5 text-white" />, color: "bg-orange-500", hex: "#f9731640" };
            case "viz": return { icon: <Droplets className="w-5 h-5 text-white" />, color: "bg-blue-500", hex: "#3b82f640" };
            default: return { icon: <Zap className="w-5 h-5 text-white" />, color: "bg-gray-500", hex: "#6b728040" };
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-full"
        >
            <div className="relative z-10 px-4 pt-12 pb-12 flex flex-col gap-8">
                <motion.header variants={itemVariants} className="flex items-center gap-3">
                    <Link href={'/dashboard/profile'}>
                        <div style={{ background: user?.colorCode }} className="w-10 h-10 rounded-full p-[0.1rem] overflow-hidden border border-white/10 shrink-0 flex items-center justify-center">
                            <span className="font-bold text-text-primary text-sm uppercase bg-surface-elevated px-2 rounded-full w-full text-center tracking-tighter h-full flex items-center justify-center">
                                {user?.name ? (user.name.charAt(0) + (user.name.split(' ')[1]?.charAt(0) || '')) : "?"}
                            </span>
                        </div>
                    </Link>
                    <div className="flex-1 bg-surface/80 backdrop-blur-md rounded-full h-10 flex items-center px-4 border border-white/5 shadow-inner">
                        <Search className="w-4 h-4 text-text-secondary mr-2" />
                        <input
                            type="text"
                            placeholder="Mérőóra keresése..."
                            className="bg-transparent text-text-primary text-sm font-medium w-full focus:outline-none placeholder:text-text-secondary"
                        />
                    </div>
                    <Link href="/dashboard/stats">
                        <div className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center border border-white/5 shrink-0 relative active:scale-95 transition-transform">
                            <ChartColumn className="w-5 h-5 text-text-primary" />
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsNotificationsOpen(true)}
                        className="w-10 h-10 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center border border-white/5 shrink-0 relative active:scale-95 transition-transform"
                    >
                        <Bell className="w-5 h-5 text-text-primary" />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-primary rounded-full border-2 border-surface shadow-[0_0_10px_rgba(255,59,48,0.5)]"></span>
                        )}
                    </button>
                </motion.header>

                <motion.div
                    variants={balanceVariants}
                    className="flex flex-col items-center text-center mt-2"
                >
                    <span className="text-text-secondary text-sm font-medium mb-1 opacity-60 uppercase tracking-widest flex items-center justify-center gap-1">E havi várható költség
                        <PremiumBadge className="h-3 w-3 relative text-yellow-400" /></span>
                    <h2 className="text-6xl font-black tracking-tighter text-text-primary italic">
                        {user?.subscriptionPlan == 'pro' ? totalMonthlyCost.toLocaleString('hu-HU', { maximumFractionDigits: 0 }) : '---'} <span className="text-2xl text-primary not-italic">Ft</span>
                    </h2>
                    <motion.div whileTap={{ scale: 1.02 }} className="mt-3">
                        <Link href="/dashboard/properties" className="flex items-center gap-2 mt-4 text-text-secondary text-[10px] font-bold uppercase tracking-wider bg-surface-elevated/50 px-4 py-1.5 rounded-full border border-white/5 shadow-sm">
                            <MapPin className="w-3 h-3 text-primary" />
                            {houseAddress}
                        </Link>
                    </motion.div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-between px-2 mt-4">
                    <ActionButton
                        icon={<Plus className="w-6 h-6" />}
                        label="Új állás"
                        onClick={() => setIsNewReadingOpen(true)}
                    />
                    <Link href="/dashboard/calculator" className="relative">
                        <PremiumBadge className="top-1 right-2 w-4 h-4" />
                        <ActionButton icon={<Calculator className="w-6 h-6" />} label="Kalkulátor" />
                    </Link>
                    <Link href="/dashboard/meters">
                        <ActionButton icon={<ReceiptText className="w-6 h-6" />} label="Mérőórák" />
                    </Link>
                    <ActionButton
                        icon={<MoreHorizontal className="w-6 h-6" />}
                        label="Továbbiak"
                        onClick={() => setIsMoreOpen(true)}
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 mt-2">
                    <Widgets />
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="flex justify-center mt-4"
                >
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsWidgetSheetOpen(true)}
                        className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-8 py-4 shadow-lg backdrop-blur-sm"
                    >
                        <Plus className="w-5 h-5 text-text-primary" strokeWidth={3} />
                        <span className="text-text-primary font-black uppercase tracking-widest text-xs">
                            Widgetek hozzáadása
                        </span>
                    </motion.button>
                </motion.div>


            </div>

            <NewReadingSheet isOpen={isNewReadingOpen} onClose={() => setIsNewReadingOpen(false)} />
            <MoreOptionsSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
            <NotificationsSheet isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

            <WidgetSelectionSheet
                isOpen={isWidgetSheetOpen}
                onClose={() => setIsWidgetSheetOpen(false)}
                activeWidgetIds={activeWidgetIds}
                onToggleWidget={handleToggleWidget}
                meters={initialMeters}
            />

        </motion.div>
    );
}

interface ActionButtonProps {
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
    return (
        <div className="flex flex-col items-center gap-2">
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClick}
                className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center text-text-primary shadow-xl border border-white/5 transition-all"
            >
                {icon}
            </motion.button>
            <span className="text-text-primary text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
        </div>
    );
}

interface UsageGraphCardProps {
    title: string;
    value: string;
    trend: string;
    trendUp: boolean;
    color: string;
    graphPath: string;
}

function UsageGraphCard({ title, value, trend, trendUp, color, graphPath }: UsageGraphCardProps) {
    return (
        <motion.div
            whileTap={{ scale: 0.98 }}
            className="bg-surface rounded-[2rem] p-5 border border-white/5 shadow-lg flex flex-col gap-3 relative overflow-hidden"
        >
            <div className="flex justify-between items-start z-10">
                <span className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">{title}</span>
                <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
            </div>
            <div className="z-10">
                <div className="text-text-primary font-black text-2xl tracking-tighter italic">
                    {parseFloat(value).toFixed(2).toLocaleString()}
                </div>
                <div className="text-[10px] font-black flex items-center gap-1 mt-1 uppercase tracking-tight" style={{ color: trendUp ? '#ef4444' : '#10b981' }}>
                    {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trend}
                </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
                <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
                    <path d={graphPath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </motion.div>
    );
}

interface ReadingItemProps {
    title: string;
    time: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

function ReadingItem({ title, time, value, icon, color }: ReadingItemProps) {
    return (
        <div className="flex items-center justify-between w-full active:opacity-60 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg transition-transform group-active:scale-90`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-text-primary font-bold text-[16px] tracking-tight italic">{title}</span>
                    <span className="text-text-secondary text-[10px] font-black opacity-40 uppercase tracking-widest">{time}</span>
                </div>
            </div>
            <span className="text-text-primary font-black text-[15px] tracking-tight">{value}</span>
        </div>
    );
}