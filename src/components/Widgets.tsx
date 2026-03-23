"use client";

import { JSX, useEffect, useState } from "react";
import { useAppearance } from "@/contexts/appearance.context";
import { motion, Variants, AnimatePresence } from "framer-motion";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { CrownIcon, TrendingDown, TrendingUp, Loader2, LayoutGrid, Camera, ChevronRight, CalendarClock, Map, MapPin, ChevronLeft, Check, Plus } from "lucide-react";
import { getMetersForWidgetAction } from "@/app/actions/meter"
import { MeterWithStats } from "@/services/meter.service";
import { getMeterVisuals } from "@/types/meter";
import { IHouse } from "@/models/house.model";
import React from "react";

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

export default function Widgets() {
    const { widgets } = useAppearance();

    const [meters, setMeters] = useState<MeterWithStats[]>([]);
    const [house, setHouse] = useState<IHouse | null>(null);
    const [widgetComponents, setWidgetComponents] = useState<{ id: string; type: 'small' | 'large' | string; component: JSX.Element }[]>([]);

    // Töltési állapot
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMeters = async () => {
            setIsLoading(true);
            try {
                const results = await getMetersForWidgetAction();
                setMeters(results.results.meters);
                setHouse(results.results.house);
                const components = [
                    ...MonthlyCandCWidgetByMeter(results.results.meters),
                    {
                        type: 'large',
                        id: 'unit-overallStatus',
                        component: <OverallStatusWidget meters={results.results.meters} />
                    },
                    // ÚJ WIDGET: Közeledő diktálások (Nagy)
                    {
                        type: 'large',
                        id: 'unit-upcomingReadings',
                        component: <UpcomingReadingsWidget meters={results.results.meters} />
                    },
                    // ÚJ WIDGET: Ház Térkép (Nagy)
                    {
                        type: 'large',
                        id: 'unit-houseMap',
                        component: <HouseMapWidget address={results.results.house?.address} />
                    },
                    {
                        type: 'large',
                        id: 'unit-roommateStatus',
                        component: <RoommateStatusWidget members={results.results.house?.members} />
                    }
                ];
                setWidgetComponents(components);
            } catch (error) {
                console.error("Hiba a widgetek betöltésekor:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeters();
    }, []);

    // 1. Töltőképernyő
    if (isLoading) {
        return (
            <div className="col-span-2 flex flex-col items-center justify-center py-16 gap-4 opacity-70">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                    Widgetek töltése...
                </span>
            </div>
        );
    }

    // Szűrjük a megjelenítendő widgeteket
    const activeWidgets = widgetComponents.filter(f => widgets[house?._id.toString() || ""]?.includes(f.id));

    // 2. Üres állapot (ha nincs bekapcsolva egy widget sem)
    if (activeWidgets.length === 0) {
        return (
            <div className="col-span-2 flex flex-col items-center justify-center py-12 px-6 mt-2 bg-white/[0.02] border border-dashed border-white/10 rounded-[2.5rem] gap-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                    <LayoutGrid className="w-6 h-6 text-white/30" />
                </div>
                <div className="text-center space-y-1">
                    <span className="block text-white/60 text-sm font-black uppercase tracking-widest">Nincs aktív widget</span>
                    <span className="block text-white/30 text-[10px] font-bold uppercase tracking-wider leading-relaxed">
                        Kattints a fenti + gombra,<br />hogy személyre szabd a kezdőképernyőd!
                    </span>
                </div>
            </div>
        );
    }

    // 3. Rendereljük a widgeteket, ha vannak
    return (
        <React.Fragment>
            {activeWidgets.map((w, index) => (
                <div key={index} className={`${w.type === 'small' ? '' : 'col-span-2'} `}>
                    {w.component}
                </div>
            ))}
        </React.Fragment>
    );
}

// Közeledő Diktálások Widget
export function UpcomingReadingsWidget({ meters, isSelection, isSelected }: { meters: MeterWithStats[], isSelection?: () => void, isSelected?: boolean }) {
    // Kiszámolja a hátralévő napokat (Utolsó rögzítés + 30 nap logikával)
    const calculateStatus = (lastReadingDate: Date) => {
        // Ha nincs adat, berakunk egy alapértelmezett értéket
        const lastDate = new Date(lastReadingDate);

        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 1); // Pontosan 1 hónapot adunk hozzá

        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Lejárt!", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", days: diffDays };
        if (diffDays === 0) return { text: "Ma esedékes", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", days: diffDays };
        if (diffDays <= 3) return { text: `${diffDays} nap múlva`, color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", days: diffDays };
        return { text: `${diffDays} nap múlva`, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", days: diffDays };
    };

    return (
        <motion.div onClick={isSelection} variants={isSelection ? undefined : itemVariants} className={`${!isSelection ? 'bg-surface' : isSelected ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/[0.03] border-white/5 opacity-60"} rounded-[2.5rem] p-6 border border-white/5 shadow-xl mt-2 flex flex-col gap-6 relative`}>
            <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <CalendarClock className="w-4 h-4 text-white/60" />
                </div>
                <h3 className="text-text-primary font-black text-lg tracking-tight uppercase italic">Diktálások</h3>
            </div>

            {
                isSelection && (
                    <div className={`w-6 h-6 absolute top-6 right-6 rounded-full flex items-center justify-center ${isSelected ? "bg-primary" : "bg-white/10"}`}>
                        {isSelected ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /> : <Plus className="w-3.5 h-3.5 text-white/40" />}
                    </div>
                )
            }

            <div className="flex flex-col gap-3">
                {meters.map((meter) => {
                    const status = calculateStatus(meter.lastReadingDate!);
                    const visual = getMeterVisuals(meter.type);
                    return (
                        <Link key={meter._id.toString()} href={!isSelection ? `/dashboard/meters/${meter._id}` : '#'}>
                            <UpcomingReadingItem
                                title={meter.name}
                                time={meter.stats.isOverLimit ? "Limit felett!" : "Kereten belül"}
                                date={status}
                                icon={visual.icon}
                                color={visual.color}
                            />
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    );
}

// Térkép Widget (Sötét móddal)
export function HouseMapWidget({ address, isSelection, isSelected }: { address?: string, isSelection?: () => void, isSelected?: boolean }) {
    if (!address) {
        return (
            <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl mt-2 flex flex-col items-center justify-center gap-3 h-48">
                <Map className="w-8 h-8 text-white/20" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">Nincs cím megadva a térképhez</span>
            </motion.div>
        );
    }

    return (
        <motion.div onClick={isSelection} variants={isSelection ? undefined : itemVariants} className={`${!isSelection ? 'bg-surface' : isSelected ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/[0.03] border-white/5 opacity-60"} rounded-[2.5rem] border border-white/5 shadow-xl mt-2 overflow-hidden h-[220px] relative group cursor-pointer`}>
            <Link href={isSelection ? '#' : '/dashboard/map'}>
                <iframe
                    title="House Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-[300px] -mt-10 pointer-events-none"
                    style={{
                        filter: 'invert(100%) hue-rotate(180deg) brightness(60%) contrast(150%) grayscale(100%)',
                    }}
                    frameBorder="0"
                    scrolling="no"
                />

                {
                    isSelection && (
                        <div className={`w-6 h-6 absolute top-6 right-6 rounded-full flex items-center justify-center ${isSelected ? "bg-primary" : "bg-white/10"} z-50`}>
                            {isSelected ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /> : <Plus className="w-3.5 h-3.5 text-white/40" />}
                        </div>
                    )
                }

                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-12 flex flex-col justify-end">
                    <div className="flex items-start gap-3 transform group-active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <MapPin className="text-primary w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white font-black text-sm tracking-tight truncate">Címünk</span>
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5 line-clamp-2">
                                {address}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

        </motion.div >
    );
}

// ---------------------------------------------------------------------------
// RÉGI WIDGETEK
// ---------------------------------------------------------------------------

function MonthlyCandCWidgetByMeter(meters: MeterWithStats[]) {
    const graphPaths =
    {
        villany: { up: "M 0 45 Q 40 40 80 30 T 160 10", down: "M 0 10 Q 40 15 80 30 T 160 40" },
        viz: { up: "M 0 45 Q 40 70 80 30 T 160 10", down: "M 0 10 Q 30 15 60 30 T 160 40" },
        gaz: { up: "M 0 45 Q 40 40 80 30 T 160 10", down: "M 0 10 Q 40 15 80 30 T 160 40" }
    };

    const removeAccents = (str: string): string => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[\u0171\u0170]/g, "u")
            .replace(/[\u0171\u0170]/gi, (match) => match.toLowerCase() === 'ű' ? 'u' : 'U')
            .replace(/[\u0151\u0150]/gi, (match) => match.toLowerCase() === 'ő' ? 'o' : 'O');
    };

    return meters.map((meter) => {
        const { stats } = meter;
        const trendUp = stats.isOverLimit;
        const trend = stats.totalCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " Ft";
        const color = getMeterVisuals(meter.type).hex;
        return ({
            type: 'small',
            id: `unit-${removeAccents(meter.name).replace(/\s/g, '-').toLowerCase()}`,
            component: (
                <MonthlyConsumptionAndCostWidget
                    key={meter._id.toString()}
                    title={`${meter.name}`}
                    unit={meter.unit}
                    value={stats.consumption}
                    trendUp={trendUp}
                    trend={trend}
                    graphPath={trendUp ? graphPaths[meter.type].up : graphPaths[meter.type].down}
                    color={color}
                />
            )
        });
    });
}

function MonthlyConsumptionAndCostWidget({ title, value, unit, trendUp, trend, graphPath, color }: { title: string; value: number; unit: string; trendUp: boolean; trend: string; graphPath: string; color: string; }) {
    return (
        <motion.div
            variants={itemVariants}
            whileTap={{ scale: 0.98 }}
            className="bg-surface rounded-[2rem] p-5 border border-white/5 shadow-lg flex flex-col gap-3 relative overflow-hidden h-full"
        >
            <div className="flex justify-between items-start z-10">
                <span className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">{title}</span>
                <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
            </div>
            <div className="z-10 mt-auto">
                <div className="text-text-primary font-black text-2xl tracking-tighter italic leading-none mt-2">
                    {value.toFixed(2).toLocaleString()} <span className="text-xs">{unit}</span>
                </div>
                <div className="text-[10px] font-black flex items-center gap-1 mt-2 uppercase tracking-tight" style={{ color: trendUp ? '#ef4444' : '#10b981' }}>
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
    )
}

function OverallStatusWidget({ meters }: { meters: MeterWithStats[] }) {
    return (
        <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl mt-2 flex flex-col gap-6">
            <div className="flex justify-between items-center mb-1">
                <h3 className="text-text-primary font-black text-lg tracking-tight uppercase italic">Aktuális állapot</h3>
                <Link href="/dashboard/meters" className="text-primary text-xs font-black uppercase tracking-widest active:opacity-70">
                    Összes
                </Link>
            </div>

            <div className="flex flex-col gap-5">
                {meters.map((meter) => {
                    const visual = getMeterVisuals(meter.type);
                    return (
                        <Link key={meter._id.toString()} href={`/dashboard/meters/${meter._id}`}>
                            <ReadingItem
                                title={meter.name}
                                time={meter.stats.isOverLimit ? "Limit felett!" : "Kereten belül"}
                                value={`${meter.lastReadingValue.toLocaleString()} ${meter.unit}`}
                                icon={visual.icon}
                                color={visual.color}
                            />
                        </Link>
                    );
                })}
            </div>
        </motion.div>
    )
}

interface ReadingItemProps {
    title: string;
    time: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

interface UpcomingReadingItemProps {
    title: string;
    time: string;
    date: { text: string; color: string; bg: string; border: string; days: number };
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

function UpcomingReadingItem({ title, time, date, icon, color }: UpcomingReadingItemProps) {
    return (
        <div className="flex items-center justify-between w-full active:opacity-60 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg transition-transform group-active:scale-90`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-text-primary font-bold text-[16px] tracking-tight italic">{title}</span>
                </div>
            </div>
            <span className="text-text-primary font-black text-[15px] tracking-tight">{
                date.days < 0 ? <span className={`${date.color} ${date.bg} ${date.border} px-2 py-1 rounded-full text-xs font-bold`}>Lejárt</span> :
                    date.days == 0 ? <span className={`${date.color} ${date.bg} ${date.border} px-2 py-1 rounded-full text-xs font-bold`}>Ma</span> :
                        <span className={`${date.color} ${date.bg} ${date.border} px-2 py-1 rounded-full text-xs font-bold`}>{date.days} nap múlva</span>
            }</span>
        </div>
    );
}

function RoommateStatusWidget({ members }: { members?: { name: string; colorCode: string; isOwner?: boolean }[] }) {
    function getInitials(name: string): string {
        const parts = name.trim().split(" ");
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    return (
        <motion.div whileTap={{ scale: 0.98 }} variants={itemVariants}
            className={`bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl mt-2 flex flex-col gap-6`}
        >
            <div className="flex justify-between items-center">
                <div className="flex justify-between items-center w-full">
                    <h3 className="text-text-primary font-black text-lg tracking-tight uppercase italic">Lakótársak</h3>
                    <Link href="/dashboard/roommates" className="text-primary text-xs font-black uppercase tracking-widest active:opacity-70">
                        Összes
                    </Link>
                </div>
            </div>
            <div className="flex gap-6 justify-start items-center">
                {members?.map((member, index) => (
                    <div key={index} className="relative">
                        <RoommateAvatar name={member.name} init={getInitials(member.name)} color={member.colorCode} isOwner={member.isOwner} />
                    </div>
                ))}
            </div>
        </motion.div>
    )
}

function RoommateAvatar({ name, init, color, isOwner }: { name: string; init: string; color: string; isOwner?: boolean }) {
    function getAdaptiveGray(hex: string) {
        hex = hex.replace('#', '');

        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        if (brightness < 128) {
            return "#F2F2F7";
        } else {
            return "#1C1C1E";
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg relative border`} style={{ background: color, borderColor: getAdaptiveGray(color) }}>
                <span style={{ color: getAdaptiveGray(color) }}>{init}</span>
                {isOwner && (
                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-5 h-5 rounded-full text-yellow-400 flex items-center justify-center">
                        <CrownIcon className="w-3 h-3" />
                    </div>
                )}
            </div>
            <span className="text-[10px] font-bold text-white/60 text-center">{name}</span>
        </div>
    );
}