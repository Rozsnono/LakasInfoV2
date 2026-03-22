import { JSX, useEffect, useState } from "react";
import { useAppearance } from "@/contexts/appearance.context";
import { motion } from "framer-motion";
import Link from "@/contexts/router.context";
import { Crown, CrownIcon, TrendingDown, TrendingUp } from "lucide-react";
import { getMetersForWidgetAction } from "@/app/actions/meter"
import { MeterWithStats } from "@/services/meter.service";
import { getMeterVisuals } from "@/types/meter";
import { IHouse } from "@/models/house.model";
import React from "react";

export default function Widgets() {
    const { widgets } = useAppearance();

    const [meters, setMeters] = useState<MeterWithStats[]>([]);
    const [house, setHouse] = useState<IHouse | null>(null);

    const [widgetComponents, setWidgetComponents] = useState<{ id: string; type: 'small' | 'large' | string; component: JSX.Element }[]>([]);

    useEffect(() => {
        const fetchMeters = async () => {
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
                {
                    type: 'large',
                    id: 'unit-roommateStatus',
                    component: <RoommateStatusWidget members={results.results.house?.members} />
                }
            ];
            setWidgetComponents(components);
        };
        fetchMeters();
    }, []);

    return (
        <React.Fragment>
            {widgetComponents.filter(f => widgets.includes(f.id)).map((w, index) => (
                <div key={index} className={`${w.type === 'small' ? '' : 'col-span-2'} `}>
                    {w.component}
                </div>
            ))}
        </React.Fragment>
    )
}

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
            whileTap={{ scale: 0.98 }}
            className="bg-surface rounded-[2rem] p-5 border border-white/5 shadow-lg flex flex-col gap-3 relative overflow-hidden"
        >
            <div className="flex justify-between items-start z-10">
                <span className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-40">{title}</span>
                <div className="w-2 h-2 rounded-full shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
            </div>
            <div className="z-10">
                <div className="text-text-primary font-black text-2xl tracking-tighter italic">
                    {value.toFixed(2).toLocaleString()} <span className="text-xs">{unit}</span>
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
    )
}

function OverallStatusWidget({ meters }: { meters: MeterWithStats[] }) {
    return (
        <div className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl mt-2 flex flex-col gap-6">
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
        </div>
    )
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

function RoommateStatusWidget({ members }: { members?: { name: string; colorCode: string; isOwner?: boolean }[] }) {
    function getInitials(name: string): string {
        const parts = name.trim().split(" ");
        if (parts.length === 1) {
            return parts[0].charAt(0).toUpperCase();
        }
        return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }

    return (
        <motion.div whileTap={{ scale: 0.98 }}
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

