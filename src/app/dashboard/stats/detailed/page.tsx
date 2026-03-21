"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Zap, Flame, Droplets, BarChart2, LineChart, Activity, Loader2, Calendar } from "lucide-react";
import Link from "@/contexts/router.context";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { getDetailedStatsAction } from "@/app/actions/detailed-stats";
import { DetailedStatsData, MeterFilter, CategoryKey } from "@/types/stats";
import TimeRangeSheet from "@/components/TimeRangeSheet";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

export default function DetailedStatsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<DetailedStatsData | null>(null);
    const [viewMode, setViewMode] = useState<"cost" | "consumption">("consumption");
    const [chartType, setChartType] = useState<"line" | "bar">("line");
    const [filter, setFilter] = useState<MeterFilter>("all");
    const [timeRange, setTimeRange] = useState<string>("3m");
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
    const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [categories, setCategories] = useState<CategoryKey[]>([]);
    const [cleanConfig, setCleanConfig] = useState<Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>>({} as Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>);

    const configs: Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }> = {
        all: { label: "Összesen", color: "var(--brand-primary)", icon: <Activity className="w-5 h-5 text-primary" />, unit: "Unit" },
        villany: { label: "Villany", color: "#f59e0b", icon: <Zap className="w-5 h-5 text-yellow-500" />, unit: "kWh" },
        viz: { label: "Víz", color: "#3b82f6", icon: <Droplets className="w-5 h-5 text-blue-500" />, unit: "m³" },
        gaz: { label: "Gáz", color: "#ef4444", icon: <Flame className="w-5 h-5 text-orange-500" />, unit: "m³" },
    };

    const loadData = useCallback(async () => {
        setLoading(true);
        const res = await getDetailedStatsAction(filter, timeRange, customRange || undefined);
        if (res.success && res.value) setData(res.value);
        const categoryKeys = res.value?.categoryKeys || [];
        setCategories(categoryKeys);
        const configsForKeys = {
            ...{ all: configs.all, },
            ...Object.fromEntries(categoryKeys.map(key => [key, configs[key as MeterFilter]])) as Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>
        }

        setCleanConfig(configsForKeys);

        setLoading(false);
    }, [filter, timeRange, customRange]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadData(); }, [loadData]);

    const maxVal = useMemo(() => {
        if (!data || !data.chartData || data.chartData.length === 0) return 1;
        const allVals: number[] = [];
        data.chartData.forEach(p => {
            if (filter === "all") { categories.forEach(cat => allVals.push(p.breakdown[cat][viewMode])); }
            else { const val = p.breakdown[filter as CategoryKey]?.[viewMode]; if (typeof val === 'number') allVals.push(val); }
        });
        const m = Math.max(...allVals);
        return m > 0 ? m : 1;
    }, [data, filter, viewMode, categories]);

    const getCoords = (idx: number, cat: CategoryKey) => {
        const height = 150;
        if (!data || !data.chartData || data.chartData.length === 0) return { x: 0, y: height };
        const x = 50 + (idx / (data.chartData.length - 1)) * 300;
        const val = data.chartData[idx]?.breakdown[cat]?.[viewMode] || 0;
        const y = height - (val / maxVal) * 120 + 20;
        return { x, y };
    };

    return (
        <motion.div initial="hidden" animate="visible" className="min-h-screen  flex flex-col text-text-primary">

            <motion.header variants={itemVariants} className="p-6 flex justify-between items-center z-20 gap-3">
                <Link href="/dashboard/stats" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl shrink-0"><ArrowLeft className="w-5 h-5" /></Link>

                <button
                    onClick={() => setIsTimeSheetOpen(true)}
                    className="flex-1 bg-surface-elevated px-4 py-2.5 rounded-2xl border border-white/5 shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest truncate">
                        {timeRange === "custom" && customRange ? `${customRange.start.slice(2)} - ${customRange.end.slice(2)}` : timeRange === "3m" ? "3 Hó" : timeRange === "6m" ? "6 Hó" : "1 Év"}
                    </span>
                </button>

                <div className="flex bg-surface-elevated p-1 rounded-full border border-white/5 shrink-0">
                    <button onClick={() => setChartType("line")} className={`w-9 h-9 rounded-full flex items-center justify-center ${chartType === "line" ? "bg-white/10 text-white" : "opacity-30"}`}><LineChart className="w-4 h-4" /></button>
                    <button onClick={() => setChartType("bar")} className={`w-9 h-9 rounded-full flex items-center justify-center ${chartType === "bar" ? "bg-white/10 text-white" : "opacity-30"}`}><BarChart2 className="w-4 h-4" /></button>
                </div>
            </motion.header>

            {loading ? (
                <div className="flex-1 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" /></div>
            ) : (
                <>
                    <motion.div variants={itemVariants} className="px-8 mt-4 flex justify-between items-end">
                        <div>
                            <span className="text-text-secondary font-black text-[10px] uppercase opacity-50">{configs[filter].label} • Állás</span>
                            <h2 className="text-5xl font-black mt-2 tracking-tighter italic">{viewMode === "cost" ? data?.totalCost : data?.totalConsumption}</h2>
                            <div className={`flex items-center gap-2 font-bold mt-3 text-xs uppercase ${data?.isTrendPositive ? "text-primary" : "text-emerald-500"}`}>
                                {data?.isTrendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>{data?.trend} változás</span>
                            </div>
                        </div>
                        <div className="flex bg-surface-elevated p-1 rounded-2xl border border-white/5 mb-2">
                            <button onClick={() => setViewMode("cost")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "cost" ? "bg-primary text-white" : "text-white/20"}`}>Ft</button>
                            <button onClick={() => setViewMode("consumption")} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase ${viewMode === "consumption" ? "bg-primary text-white" : "text-white/20"}`}>Unit</button>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex-1 mt-10 relative px-6 min-h-[300px] flex items-end">
                        <AnimatePresence>
                            {hoveredPoint !== null && data && (
                                <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1, left: getCoords(hoveredPoint, (filter === "all" ? "villany" : filter) as CategoryKey).x, top: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute z-50 -translate-x-1/2 pointer-events-none bg-surface-elevated p-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-md min-w-[50px]">
                                    <div className="text-[10px] font-black text-white/40 uppercase mb-2">{data.chartData[hoveredPoint].label}</div>
                                    <div className="space-y-1.5">
                                        {(filter === "all" ? categories : [filter as CategoryKey]).map(cat => (
                                            <div key={cat} className="flex items-center justify-between gap-4">
                                                <span className="text-xs font-black text-white">
                                                    {viewMode === "cost" ? `${data.chartData[hoveredPoint].breakdown[cat].cost.toLocaleString()} Ft` : `${data.chartData[hoveredPoint].breakdown[cat].consumption.toLocaleString()} ${configs[cat].unit}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <svg viewBox="0 0 400 200" className="w-full h-80 overflow-visible">
                            <AnimatePresence mode="wait">
                                {chartType === "line" ? (
                                    <g key="lines">
                                        {(filter === "all" ? categories : [filter as CategoryKey]).map(cat => {
                                            let path = "";
                                            data?.chartData.forEach((_, i) => {
                                                const { x, y } = getCoords(i, cat);
                                                path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                                            });
                                            return (
                                                <React.Fragment key={cat}>
                                                    <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} d={path} fill="none" stroke={configs[cat].color} strokeWidth={filter === "all" ? "3" : "6"} strokeLinecap="round" />
                                                    {filter !== "all" && data?.chartData.map((_, i) => (
                                                        <motion.circle key={i} initial={{ scale: 0 }} animate={{ scale: hoveredPoint === i ? 1.5 : 1 }} cx={getCoords(i, cat).x} cy={getCoords(i, cat).y} r="6" fill="white" stroke={configs[cat].color} strokeWidth="3" />
                                                    ))}
                                                </React.Fragment>
                                            );
                                        })}
                                    </g>
                                ) : (
                                    <g key="bars">
                                        {data?.chartData.map((_, i) => (
                                            <g key={i}>
                                                {(filter === "all" ? categories : [filter as CategoryKey]).map((cat, cIdx) => {
                                                    const { x, y } = getCoords(i, cat);
                                                    const bWidth = filter === "all" ? 14 : 40;
                                                    const offset = filter === "all" ? (cIdx - 1) * (bWidth + 4) : 0;
                                                    return (
                                                        <motion.rect key={cat} initial={{ height: 0, y: 180 }} animate={{ height: 180 - y, y }} x={x + offset - bWidth / 2} width={bWidth} rx={4} fill={configs[cat].color} style={{ opacity: hoveredPoint === null || hoveredPoint === i ? 1 : 0.4 }} />
                                                    );
                                                })}
                                            </g>
                                        ))}
                                    </g>
                                )}
                            </AnimatePresence>
                            {data?.chartData.map((_, i) => (
                                <rect key={i} x={50 + (i / (data.chartData.length - 1)) * 300 - 15} y={0} width={30} height={200} fill="transparent" onMouseEnter={() => setHoveredPoint(i)} onMouseLeave={() => setHoveredPoint(null)} className="cursor-pointer" />
                            ))}
                        </svg>
                        <div className="absolute -bottom-6 left-0 right-0 flex justify-around px-8 text-white/20 font-black text-[10px] uppercase">
                            {data?.chartData.map(d => <span key={d.label}>{d.label}</span>)}
                        </div>
                    </motion.div>

                    <div className="h-10" />

                    <div className="bg-surface rounded-[3rem] p-8 flex-1 border-t border-white/5 z-10 shadow-2xl">
                        <h3 className="font-black text-xl italic uppercase mb-8">Kategóriák</h3>
                        <div className="flex flex-col gap-6">
                            {(Object.keys(cleanConfig) as MeterFilter[]).map(key => (
                                <button key={key} onClick={() => setFilter(key)} className={`flex items-center justify-between p-4 -mx-4 rounded-[2rem] transition-all ${filter === key ? "bg-white/5 ring-1 ring-white/10" : "opacity-40"}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center">{cleanConfig[key].icon}</div>
                                        <span className="font-black text-lg">{cleanConfig[key].label}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-black text-lg italic block">{filter === key ? (viewMode === "cost" ? data?.totalCost : data?.totalConsumption) : "•••"}</span>
                                        {filter === key && viewMode === "consumption" && key !== "all" && <span className="text-[10px] font-bold text-white/30 uppercase">{cleanConfig[key].unit}</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </>
            )}

            <TimeRangeSheet
                isOpen={isTimeSheetOpen}
                onClose={() => setIsTimeSheetOpen(false)}
                selectedFrequency={timeRange}
                onSelect={(freq, range) => {
                    setTimeRange(freq);
                    if (range) setCustomRange(range);
                    else setCustomRange(null);
                }}
            />
        </motion.div>
    );
}