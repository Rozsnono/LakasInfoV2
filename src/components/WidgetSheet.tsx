/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    X, Plus, Check, Zap, Flame, Droplets,
    Users, LayoutGrid, Banknote, ChevronLeft,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { MeterWithStats } from "@/services/meter.service";
import { getMeterVisuals } from "@/types/meter";
import { useAppearance } from "@/contexts/appearance.context";
import { HouseMapWidget, UpcomingReadingsWidget } from "./Widgets";
import { useHouse } from "@/contexts/house.context";
import { useUser } from "@/contexts/user.context";

interface WidgetSelectionSheetProps {
    isOpen: boolean;
    onClose: () => void;
    activeWidgetIds: string[];
    onToggleWidget: (id: string) => void;
    meters: MeterWithStats[];
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
        y: "100%",
        transition: { duration: 0.3 },
    },
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

export default function WidgetSelectionSheet({
    isOpen,
    onClose,
    activeWidgetIds,
    onToggleWidget,
    meters
}: WidgetSelectionSheetProps) {

    const { house } = useHouse();
    const { user } = useUser();

    const removeAccents = (str: string): string => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\u0171\u0170]/g, "u")
            .replace(/[\u0171\u0170]/gi, (match) => match.toLowerCase() === 'ű' ? 'u' : 'U')
            .replace(/[\u0151\u0150]/gi, (match) => match.toLowerCase() === 'ő' ? 'o' : 'O');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[95vh] flex flex-col overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase italic">
                                Widget<span className="text-primary">kezelés</span>
                            </h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto px-2 scrollbar-hide space-y-10">
                            <section className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {meters.map((meter) => (
                                        <React.Fragment key={meter._id.toString()}>
                                            <SmallWidgetCard
                                                id={`unit-${removeAccents(meter.name).replace(/\s/g, '-').toLowerCase()}`}
                                                title={`${meter.name}`}
                                                value={`${meter.stats.consumption.toFixed(2)} ${meter.unit}`}
                                                trend={meter.stats.totalCost.toLocaleString() + " Ft"}
                                                trendUp={meter.stats.isOverLimit}
                                                graphPath={meter.stats.isOverLimit
                                                    ? "M 0 45 Q 40 40 80 30 T 160 10"
                                                    : "M 0 10 Q 40 15 80 30 T 160 40"
                                                }
                                                isActive={activeWidgetIds.includes(`unit-${removeAccents(meter.name).replace(/\s/g, '-').toLowerCase()}`)}
                                                onToggle={() => onToggleWidget(`unit-${removeAccents(meter.name).replace(/\s/g, '-').toLowerCase()}`)}
                                                color={getMeterVisuals(meter.type).hex}
                                            />
                                        </React.Fragment>
                                    ))}
                                </div>
                            </section>

                            <section className="space-y-4">
                                <motion.div
                                    onClick={() => onToggleWidget("unit-overallStatus")}
                                    className={`relative rounded-[2.5rem] p-6 border transition-all ${activeWidgetIds.includes("unit-overallStatus") ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/[0.03] border-white/5 opacity-60"}`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <h4 className="text-sm font-black text-white uppercase italic tracking-wider">Aktuális állapot</h4>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeWidgetIds.includes("unit-overallStatus") ? "bg-primary" : "bg-white/10"}`}>
                                            {activeWidgetIds.includes("unit-overallStatus") ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /> : <Plus className="w-3.5 h-3.5 text-white/40" />}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        {meters.map((meter) => (
                                            <div key={meter._id.toString()} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-xl ${getMeterVisuals(meter.type).color} flex items-center justify-center shadow-lg`}>
                                                        {getMeterVisuals(meter.type).icon}
                                                    </div>
                                                    <div>
                                                        <div className="text-xs font-bold text-white tracking-tight">{meter.name}</div>
                                                        <div className="text-[9px] font-black text-white/30 uppercase">{meter.stats.isOverLimit ? "Limit felett!" : "Kereten belül"}</div>
                                                    </div>
                                                </div>
                                                <div className="text-xs font-black text-white italic">{meter.lastReadingValue} {meter.unit}</div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div
                                    onClick={() => onToggleWidget("unit-roommateStatus")}
                                    className={`relative rounded-[2.5rem] p-6 border transition-all ${activeWidgetIds.includes("unit-roommateStatus") ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/[0.03] border-white/5 opacity-60"}`}
                                >
                                    <div className="flex justify-between items-center mb-6">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black text-white/40 uppercase tracking-widest">Lakótársak</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${activeWidgetIds.includes("unit-roommateStatus") ? "bg-primary" : "bg-white/10"}`}>
                                            {activeWidgetIds.includes("unit-roommateStatus") ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /> : <Plus className="w-3.5 h-3.5 text-white/40" />}
                                        </div>
                                    </div>
                                    <div className="flex gap-6 justify-start items-center">
                                        <RoommateAvatar name="Minta" init="MM" color="bg-indigo-500" isOwner />
                                        <RoommateAvatar name="Elek" init="TE" color="bg-cyan-400" />
                                    </div>
                                </motion.div>
                            </section>

                            <section className="space-y-4">
                                <UpcomingReadingsWidget isProWidget isSelectable={user?.subscriptionPlan == 'pro'} meters={meters} isSelection={() => onToggleWidget("unit-upcomingReadings")} isSelected={activeWidgetIds.includes("unit-upcomingReadings")} />

                                <HouseMapWidget isProWidget isSelectable={user?.subscriptionPlan == 'pro'} address={house?.address} isSelection={() => onToggleWidget("unit-houseMap")} isSelected={activeWidgetIds.includes("unit-houseMap")} />
                            </section>
                        </div>

                        <div className="p-4 shrink-0">
                            <button onClick={onClose} className="w-full py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-xs shadow-2xl active:scale-[0.98] transition-transform">
                                Kész
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function SmallWidgetCard({ title, value, isActive, onToggle, color, trendUp, trend, graphPath }: any) {
    return (
        <motion.div
            onClick={onToggle}
            whileTap={{ scale: 0.98 }}
            className={`rounded-[2rem] p-5 border border-white/5 shadow-lg flex flex-col gap-3 relative overflow-hidden  ${isActive ? "bg-white/10 border-white/20 shadow-lg" : "bg-white/[0.03] border-white/5 opacity-60"}`}
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
            <div className={`absolute bottom-3 right-3 w-5 h-5 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-white" : "bg-white/10 text-white/40"}`}>
                {isActive ? <Check className="w-3 h-3" strokeWidth={4} /> : <Plus className="w-3 h-3" />}
            </div>
        </motion.div>
    )
}

function RoommateAvatar({ name, init, color, isOwner }: any) {
    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-14 h-14 rounded-full ${color} flex items-center justify-center text-white font-bold text-lg shadow-lg relative`}>
                {init}
                {isOwner && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-surface rounded-full border-2 border-zinc-800 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
                    </div>
                )}
            </div>
            <span className="text-[10px] font-bold text-white/60">{name}</span>
        </div>
    );
}