"use client";

import { JSX, useEffect, useState } from "react";
import { useAppearance } from "@/contexts/appearance.context";
import { motion, Variants, AnimatePresence, TargetAndTransition, VariantLabels } from "framer-motion";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { CrownIcon, TrendingDown, TrendingUp, Loader2, LayoutGrid, CalendarClock, Map, MapPin, Check, Plus, Gem, Receipt } from "lucide-react";
import { getMetersForWidgetAction } from "@/app/actions/meter";
import { MeterWithStats } from "@/services/meter.service";
import { getMeterVisuals } from "@/types/meter";
import { IHouse } from "@/models/house.model";
import React from "react";
import { useUser } from "@/contexts/user.context";

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

interface WidgetContainerProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    isSelectable?: boolean;
    isProWidget?: boolean;
    whileTap?: TargetAndTransition | VariantLabels | undefined;
}

// A közös "Doboz", ami lekezeli a hátteret, animációt és a kiválasztó/Pro badge-eket
function WidgetContainer({ children, className = "", onClick, isSelectionMode, isSelected, isSelectable, isProWidget, whileTap }: WidgetContainerProps) {
    const baseClass = !isSelectionMode
        ? 'bg-surface'
        : isSelected && isSelectable ? "bg-white/10 border-white/20 shadow-xl" : "bg-white/[0.03] border-white/5 opacity-60";

    return (
        <motion.div
            onClick={onClick}
            variants={isSelectionMode ? undefined : itemVariants}
            whileTap={whileTap}
            className={`${baseClass} rounded-[2.5rem] border border-white/5 shadow-xl mt-2 relative ${className}`}
        >
            {/* Jobb felső extra ikonok (Kiválasztás Pipa / Plusz) */}
            {isSelectable && isSelectionMode && (
                <div className={`w-6 h-6 absolute top-6 right-6 rounded-full flex items-center justify-center ${isSelected ? "bg-primary" : "bg-white/10"} z-50`}>
                    {isSelected ? <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} /> : <Plus className="w-3.5 h-3.5 text-white/40" />}
                </div>
            )}

            {/* Pro Badge (Ha kiválasztható is, akkor beljebb toljuk, hogy ne takarják egymást!) */}
            {isProWidget && isSelectionMode && (
                <div className={`w-6 h-6 absolute top-6 ${isSelectable ? 'right-14' : 'right-6'} rounded-full flex items-center justify-center bg-white/10 z-50`}>
                    <Gem className="w-3.5 h-3.5 text-yellow-500/60" />
                </div>
            )}

            {children}
        </motion.div>
    );
}

function WidgetHeader({ title, icon, action, isProWidget, isSelectable }: { title: string, icon?: React.ReactNode, action?: React.ReactNode, isProWidget?: boolean, isSelectable?: boolean }) {
    return (
        <div className="flex justify-between items-center mb-1 w-full relative z-10">
            <div className="flex items-center gap-3" style={{ filter: `${isProWidget && !isSelectable ? 'blur(4px)' : ''}` }}>
                {icon && (
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                        {icon}
                    </div>
                )}
                <h3 className="text-text-primary font-black text-lg tracking-tight uppercase italic">{title}</h3>
            </div>
            {action}
        </div>
    );
}

function BaseListItem({ icon, iconColorClass, title, subtitle, rightElement }: { icon: React.ReactNode, iconColorClass: string, title: string, subtitle?: string, rightElement: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between w-full active:opacity-60 transition-all group">
            <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl ${iconColorClass} flex items-center justify-center shadow-lg transition-transform group-active:scale-90`}>
                    {icon}
                </div>
                <div className="flex flex-col items-start leading-tight">
                    <span className="text-text-primary font-bold text-[16px] tracking-tight italic">{title}</span>
                    {subtitle && <span className="text-text-secondary text-[10px] font-black opacity-40 uppercase tracking-widest">{subtitle}</span>}
                </div>
            </div>
            {rightElement}
        </div>
    );
}

export default function Widgets() {
    const { widgets } = useAppearance();
    const { user } = useUser();
    const [meters, setMeters] = useState<MeterWithStats[]>([]);
    const [house, setHouse] = useState<IHouse | null>(null);
    const [widgetComponents, setWidgetComponents] = useState<{ id: string; type: 'small' | 'large' | string; component: JSX.Element }[]>([]);
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
                        isPro: false,
                        component: <OverallStatusWidget meters={results.results.meters} />
                    },
                    {
                        type: 'large',
                        id: 'unit-upcomingReadings',
                        isPro: true,
                        component: <UpcomingReadingsWidget meters={results.results.meters} isProWidget isSelectable={user?.subscriptionPlan == 'pro'} />
                    },
                    {
                        type: 'large',
                        id: 'unit-unpaidBills', // Új widget azonosító
                        isPro: true,
                        component: <UnpaidBillsWidget meters={results.results.meters} isProWidget isSelectable={user?.subscriptionPlan == 'pro'} />
                    },
                    {
                        type: 'large',
                        id: 'unit-houseMap',
                        isPro: true,
                        component: <HouseMapWidget address={results.results.house?.address} isProWidget isSelectable={user?.subscriptionPlan == 'pro'} />
                    },
                    {
                        type: 'large',
                        id: 'unit-roommateStatus',
                        isPro: false,
                        component: <RoommateStatusWidget members={results.results.house?.members} />
                    }
                ];
                setWidgetComponents(components.filter(c => !c.isPro || (c.isPro && user?.subscriptionPlan == 'pro')));
            } catch (error) {
                console.error("Hiba a widgetek betöltésekor:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMeters();
    }, [user?.subscriptionPlan]);

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

    const activeWidgets = widgetComponents.filter(f => widgets[house?._id.toString() || ""]?.includes(f.id));

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

// ---------------------------------------------------------------------------
// ÚJ WIDGET: FIZETENDŐ SZÁMLÁK
// ---------------------------------------------------------------------------
export function UnpaidBillsWidget({ meters, isSelection, isSelected, isProWidget, isSelectable }: { meters: MeterWithStats[], isSelection?: () => void, isSelected?: boolean, isProWidget?: boolean, isSelectable?: boolean }) {
    // Kiszűrjük azokat, ahol van fizetendő összeg (ahol totalCost > 0)
    const unpaidMeters = meters.filter(m => !m.lastReadingIsPaid);
    return (
        <WidgetContainer onClick={isSelectable ? isSelection : undefined} isSelectionMode={!!isSelection} isSelected={isSelected} isSelectable={isSelectable} isProWidget={isProWidget} className="p-6 flex flex-col gap-6">
            <WidgetHeader
                isProWidget={isProWidget}
                isSelectable={isSelectable}
                title="Befizetések"
            />
            <div className="flex flex-col gap-3" style={{ filter: `${isProWidget && !isSelectable ? 'blur(4px)' : ''}` }}>
                {unpaidMeters.length === 0 ? (
                    <div className="text-center py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <span className="text-emerald-500 text-[11px] font-black uppercase tracking-widest">Minden rendezve!</span>
                    </div>
                ) : (
                    unpaidMeters.map(meter => {
                        const visual = getMeterVisuals(meter.type);
                        const badge = <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-full text-[0.6rem] font-black">{meter.stats.totalCost.toLocaleString("hu-HU", { maximumFractionDigits: 0 })} Ft</span>;

                        return (
                            <Link key={meter._id.toString()} href={!isSelection ? `/dashboard/meters/${meter._id}` : '#'}>
                                <BaseListItem
                                    title={meter.name}
                                    subtitle="Fizetendő összeg"
                                    icon={visual.icon}
                                    iconColorClass={visual.color}
                                    rightElement={badge}
                                />
                            </Link>
                        )
                    })
                )}
            </div>
        </WidgetContainer>
    );
}

export function UpcomingReadingsWidget({ meters, isSelection, isSelected, isProWidget, isSelectable }: { meters: MeterWithStats[], isSelection?: () => void, isSelected?: boolean, isProWidget?: boolean, isSelectable?: boolean }) {
    const calculateStatus = (lastReadingDate: Date) => {
        const lastDate = new Date(lastReadingDate || new Date());
        const nextDate = new Date(lastDate);
        nextDate.setMonth(nextDate.getMonth() + 1);

        const today = new Date();
        const diffTime = nextDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", days: diffDays };
        if (diffDays === 0) return { color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", days: diffDays };
        if (diffDays <= 3) return { color: "text-yellow-500", bg: "bg-yellow-500/10", border: "border-yellow-500/20", days: diffDays };
        return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20", days: diffDays };
    };

    return (
        <WidgetContainer onClick={isSelectable ? isSelection : undefined} isSelectionMode={!!isSelection} isSelected={isSelected} isSelectable={isSelectable} isProWidget={isProWidget} className="p-6 flex flex-col gap-6">
            <WidgetHeader
                isProWidget={isProWidget}
                isSelectable={isSelectable}
                title="Diktálások"
            />
            <div className="flex flex-col gap-3" style={{ filter: `${isProWidget && !isSelectable ? 'blur(4px)' : ''}` }}>
                {meters.map((meter) => {
                    const status = calculateStatus(meter.lastReadingDate!);
                    const visual = getMeterVisuals(meter.type);

                    const badge = status.days < 0
                        ? <span className={`${status.color} ${status.bg} ${status.border} border px-2 py-1 rounded-full text-xs font-bold`}>Lejárt</span>
                        : status.days === 0
                            ? <span className={`${status.color} ${status.bg} ${status.border} border px-2 py-1 rounded-full text-xs font-bold`}>Ma</span>
                            : <span className={`${status.color} ${status.bg} ${status.border} border px-2 py-1 rounded-full text-xs font-bold`}>{status.days} nap múlva</span>;

                    return (
                        <Link key={meter._id.toString()} href={!isSelection ? `/dashboard/meters/${meter._id}` : '#'}>
                            <BaseListItem title={meter.name} icon={visual.icon} iconColorClass={visual.color} rightElement={badge} />
                        </Link>
                    );
                })}
            </div>
        </WidgetContainer>
    );
}

export function HouseMapWidget({ address, isSelection, isSelected, isProWidget, isSelectable }: { address?: string, isSelection?: () => void, isSelected?: boolean, isProWidget?: boolean, isSelectable?: boolean }) {
    if (!address) {
        return (
            <WidgetContainer className="p-6 flex flex-col items-center justify-center gap-3 h-48">
                <Map className="w-8 h-8 text-white/20" />
                <span className="text-white/40 text-xs font-bold uppercase tracking-widest text-center">Nincs cím megadva a térképhez</span>
            </WidgetContainer>
        );
    }

    return (
        <WidgetContainer
            onClick={isSelectable ? isSelection : () => { }}
            isSelectionMode={!!isSelection} isSelected={isSelected} isSelectable={isSelectable} isProWidget={isProWidget}
            className="overflow-hidden h-[220px] group cursor-pointer"
        >
            <Link href={isSelection ? '#' : '/dashboard/map'}>
                <iframe
                    title="House Map"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                    className={`${isProWidget && !isSelectable ? 'blur-xs' : ''} w-full h-[300px] -mt-10 pointer-events-none`}
                    style={{ filter: `invert(100%) hue-rotate(180deg) brightness(60%) contrast(150%) grayscale(100%) ${isProWidget && !isSelectable ? 'blur(4px)' : ''}` }}
                    frameBorder="0" scrolling="no"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-5 pt-12 flex flex-col justify-end pointer-events-none">
                    <div style={{ filter: isProWidget && !isSelectable ? 'blur(4px)' : 'none' }} className="flex items-start gap-3 transform group-active:scale-95 transition-transform">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                            <MapPin className="text-primary w-5 h-5" />
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-white font-black text-sm tracking-tight truncate">Címünk</span>
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mt-0.5 line-clamp-2">{address}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </WidgetContainer >
    );
}

function OverallStatusWidget({ meters }: { meters: MeterWithStats[] }) {
    return (
        <WidgetContainer className="p-6 flex flex-col gap-6">
            <WidgetHeader
                title="Aktuális állapot"
                action={<Link href="/dashboard/meters" className="text-primary text-xs font-black uppercase tracking-widest active:opacity-70">Összes</Link>}
            />
            <div className="flex flex-col gap-5">
                {meters.map((meter) => {
                    const visual = getMeterVisuals(meter.type);
                    const valueEl = <span className="text-text-primary font-black text-[15px] tracking-tight">{`${meter.lastReadingValue.toLocaleString()} ${meter.unit}`}</span>;

                    return (
                        <Link key={meter._id.toString()} href={`/dashboard/meters/${meter._id}`}>
                            <BaseListItem
                                title={meter.name}
                                subtitle={meter.stats.isOverLimit ? "Limit felett!" : "Kereten belül"}
                                icon={visual.icon}
                                iconColorClass={visual.color}
                                rightElement={valueEl}
                            />
                        </Link>
                    );
                })}
            </div>
        </WidgetContainer>
    )
}

function RoommateStatusWidget({ members }: { members?: { name: string; colorCode: string; isOwner?: boolean }[] }) {
    function getInitials(name: string): string {
        const parts = name.trim().split(" ");
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    return (
        <WidgetContainer whileTap={{ scale: 0.98 }} className="p-6 flex flex-col gap-6">
            <WidgetHeader
                title="Lakótársak"
                action={<Link href="/dashboard/roommates" className="text-primary text-xs font-black uppercase tracking-widest active:opacity-70">Összes</Link>}
            />
            <div className="flex gap-6 justify-start items-center">
                {members?.map((member, index) => (
                    <div key={index} className="relative">
                        <RoommateAvatar name={member.name} init={getInitials(member.name)} color={member.colorCode} isOwner={member.isOwner} />
                    </div>
                ))}
            </div>
        </WidgetContainer>
    )
}

function RoommateAvatar({ name, init, color, isOwner }: { name: string; init: string; color: string; isOwner?: boolean }) {
    function getAdaptiveGray(hex: string) {
        hex = hex.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128 ? "#F2F2F7" : "#1C1C1E";
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

// ---------------------------------------------------------------------------
// KIS MÉRETŰ WIDGETEK (Havi Fogyasztás)
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
            isPro: false,
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
    const { user } = useUser();
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
                {user?.subscriptionPlan === 'pro' && (
                    <div className="text-[10px] font-black flex items-center gap-1 mt-2 uppercase tracking-tight" style={{ color: trendUp ? '#ef4444' : '#10b981' }}>
                        {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trend}
                    </div>
                )}
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 pointer-events-none">
                <svg viewBox="0 0 160 50" preserveAspectRatio="none" className="w-full h-full">
                    <path d={graphPath} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </motion.div>
    )
}