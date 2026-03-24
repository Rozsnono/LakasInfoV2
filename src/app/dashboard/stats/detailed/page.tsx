"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Zap, Flame, Droplets, BarChart2, LineChart, Activity, Loader2, Calendar } from "lucide-react";
import Link from "@/contexts/router.context";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { getDetailedStatsAction } from "@/app/actions/detailed-stats";
import { DetailedStatsData, MeterFilter, CategoryKey } from "@/types/stats";
import TimeRangeSheet from "@/components/TimeRangeSheet";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
};

const METERS = [
    { id: "villany", label: "Villanyóra", icon: <Zap className="w-4 h-4 text-yellow-500" />, color: "#f59e0b" },
    { id: "gaz", label: "Gázóra", icon: <Flame className="w-4 h-4 text-orange-500" />, color: "#ef4444" },
    { id: "viz", label: "Vízóra", icon: <Droplets className="w-4 h-4 text-blue-500" />, color: "#3b82f6" },
];

export default function DetailedStatsPage() {
    const [loading, setLoading] = useState<boolean>(true);
    const [data, setData] = useState<DetailedStatsData | null>(null);

    // Nézet állapotok
    const [viewMode, setViewMode] = useState<"cost" | "difference">("difference");
    const [chartType, setChartType] = useState<"line" | "bar">("line");
    const [filter, setFilter] = useState<MeterFilter>("all");

    // Időszak állapotok
    const [timeRange, setTimeRange] = useState<string>("6m");
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | null>(null);
    const [isTimeSheetOpen, setIsTimeSheetOpen] = useState(false);

    // Interakció
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [categories, setCategories] = useState<CategoryKey[]>([]);
    const [cleanConfig, setCleanConfig] = useState<Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>>({} as Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>);

    const configs: Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }> = {
        all: { label: "Összesen", color: "#10b981", icon: <Activity className="w-5 h-5 text-emerald-500" />, unit: "Unit" }, // Smaragdzöld az összesítettnek
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
            all: configs.all,
            ...Object.fromEntries(categoryKeys.map(key => [key, configs[key as MeterFilter]]))
        } as Record<MeterFilter, { label: string; color: string; icon: React.ReactNode; unit: string }>;

        setCleanConfig(configsForKeys);
        setLoading(false);
    }, [filter, timeRange, customRange]);

    // eslint-disable-next-line react-hooks/set-state-in-effect
    useEffect(() => { loadData(); }, [loadData]);

    const maxVal = useMemo(() => {
        if (!data || !data.chartData || data.chartData.length === 0) return 1;
        const allVals: number[] = [];
        data.chartData.forEach(p => {
            if (filter === "all") {
                categories.forEach(cat => allVals.push(p.breakdown[cat]?.[viewMode] || 0));
            } else {
                const val = p.breakdown[filter as CategoryKey]?.[viewMode];
                if (typeof val === 'number') allVals.push(val);
            }
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

    // A kijelölt konfiguráció színe (Glow effektusokhoz)
    const activeColor = cleanConfig[filter]?.color || "#ffffff";

    return (
        <motion.div initial="hidden" animate="visible" className="min-h-screen flex flex-col text-text-primary overflow-x-hidden">

            {/* FEJLÉC */}
            <motion.header variants={itemVariants} className="p-6 flex justify-between items-center z-20 pt-12">
                <Link href="/dashboard/stats" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl shrink-0 active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
                <h1 className="text-xl font-black tracking-tight text-white uppercase italic text-center flex-1 pr-10">Részletes <span className="text-primary">ELEMZÉS</span></h1>
            </motion.header>

            {/* VEZÉRLŐPULT (Lebegő Kártya) */}
            <motion.div variants={itemVariants} className="px-6 relative z-30">
                <div className="p-2 rounded-3xl flex items-center justify-between gap-2 ">
                    {/* Dátum Választó */}
                    <button
                        onClick={() => setIsTimeSheetOpen(true)}
                        className="flex-1 bg-black/50 hover:bg-white/10 py-3 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-black uppercase tracking-widest truncate text-white">
                            {timeRange === "custom" && customRange ? `${customRange.start.slice(2)} - ${customRange.end.slice(2)}` : timeRange === "3m" ? "3 Hó" : timeRange === "6m" ? "6 Hó" : "1 Év"}
                        </span>
                    </button>

                    {/* Grafikon Típus Választó */}
                    <div className="flex bg-black/50 p-1 rounded-2xl border border-white/5 shrink-0">
                        <button onClick={() => setChartType("line")} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${chartType === "line" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"}`}><LineChart className="w-4 h-4" /></button>
                        <button onClick={() => setChartType("bar")} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${chartType === "bar" ? "bg-white/10 text-white shadow-md" : "text-white/40 hover:text-white/80"}`}><BarChart2 className="w-4 h-4" /></button>
                    </div>
                </div>
            </motion.div>

            {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Adatok elemzése...</span>
                </div>
            ) : (
                <>
                    {/* FŐ ADATOK */}
                    <motion.div variants={itemVariants} className="px-8 mt-8 flex justify-between items-end relative z-10">
                        <div>
                            <span className="text-text-secondary font-black text-[10px] uppercase tracking-widest opacity-50 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeColor, boxShadow: `0 0 10px ${activeColor}` }} />
                                {cleanConfig[filter]?.label} • {viewMode === "cost" ? "Költség" : "Fogyasztás"}
                            </span>
                            <h2 className="text-4xl font-black mt-2 tracking-tighter italic text-white drop-shadow-lg">
                                {viewMode === "cost" ? data?.totalCost : data?.totalConsumption}
                            </h2>
                            <div className={`flex items-center gap-2 font-bold mt-3 text-xs uppercase ${data?.isTrendPositive ? "text-red-500" : "text-emerald-500"}`}>
                                {/* Logika: Ha költség/fogyasztás csökken az JÓ (Zöld/Lefelé nyíl). Ha nő, az ROSSZ (Piros/Felfelé nyíl) */}
                                {data?.isTrendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                <span>{data?.trend} {data?.isTrendPositive ? "Növekedés" : "Megtakarítás"}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* GRAFIKON */}
                    <motion.div variants={itemVariants} className="flex-1 mt-6 relative px-4 min-h-[300px] flex items-end">

                        {/* TOOLTIP LEBEGŐ KÁRTYA */}
                        <AnimatePresence>
                            {hoveredPoint !== null && data && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, left: getCoords(hoveredPoint, (filter === "all" ? "villany" : filter) as CategoryKey).x, top: -20 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="absolute z-50 -translate-x-1/2 pointer-events-none bg-surface-elevated p-4 rounded-3xl border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl min-w-[120px]"
                                >
                                    <div className="text-[10px] font-black text-white/40 uppercase mb-3 text-center">{data.chartData[hoveredPoint].label}</div>
                                    <div className="space-y-2">
                                        {(filter === "all" ? categories : [filter as CategoryKey]).map(cat => (
                                            <div key={cat} className="flex items-center justify-between gap-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cleanConfig[cat]?.color }} />
                                                    <span className="text-[10px] font-bold text-white/60">{cleanConfig[cat]?.label}</span>
                                                </div>
                                                <span className="text-xs font-black text-white">
                                                    {viewMode === "cost" ? `${data.chartData[hoveredPoint].breakdown[cat].cost.toLocaleString()} Ft` : `${data.chartData[hoveredPoint].breakdown[cat].consumption.toLocaleString()} ${cleanConfig[cat]?.unit}`}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <svg viewBox="0 0 400 200" className="w-full h-[320px] overflow-visible">
                            {/* Gradiens Definiálása a Line Chart-hoz */}
                            <defs>
                                {(filter === "all" ? categories : [filter as CategoryKey]).map(cat => (
                                    <linearGradient key={`grad-${cat}`} id={`grad-${cat}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={cleanConfig[cat]?.color || "#ffffff"} stopOpacity="0.4" />
                                        <stop offset="100%" stopColor={cleanConfig[cat]?.color || "#ffffff"} stopOpacity="0" />
                                    </linearGradient>
                                ))}
                            </defs>

                            {/* Célkereszt (Szaggatott vonal a Tooltiphez) */}
                            <AnimatePresence>
                                {hoveredPoint !== null && chartType === "line" && (
                                    <motion.line
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 0.3 }}
                                        exit={{ opacity: 0 }}
                                        x1={getCoords(hoveredPoint, (filter === "all" ? "villany" : filter) as CategoryKey).x}
                                        y1={0}
                                        x2={getCoords(hoveredPoint, (filter === "all" ? "villany" : filter) as CategoryKey).x}
                                        y2={180}
                                        stroke="white"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                )}
                            </AnimatePresence>

                            <AnimatePresence mode="wait">
                                {chartType === "line" ? (
                                    <g key="lines">
                                        {(filter === "all" ? categories : [filter as CategoryKey]).map(cat => {
                                            let path = "";
                                            data?.chartData.forEach((_, i) => {
                                                const { x, y } = getCoords(i, cat);
                                                path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
                                            });

                                            // Kitöltés (Gradiens) kiszámítása
                                            const lastX = getCoords((data?.chartData.length || 1) - 1, cat).x;
                                            const fillPath = `${path} L ${lastX} 180 L 50 180 Z`;

                                            return (
                                                <React.Fragment key={cat}>
                                                    {/* Átmenetes Kitöltés */}
                                                    <motion.path
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                                        d={fillPath}
                                                        fill={`url(#grad-${cat})`}
                                                    />
                                                    {/* Fő Vonal */}
                                                    <motion.path
                                                        initial={{ pathLength: 0 }}
                                                        animate={{ pathLength: 1 }}
                                                        transition={{ duration: 1.5, ease: "easeInOut" }}
                                                        d={path}
                                                        fill="none"
                                                        stroke={cleanConfig[cat]?.color}
                                                        strokeWidth={filter === "all" ? "3" : "5"}
                                                        strokeLinecap="round"
                                                        className="drop-shadow-[0_5px_10px_rgba(0,0,0,0.5)]"
                                                    />
                                                    {/* Pontok (Körök) */}
                                                    {filter !== "all" && data?.chartData.map((_, i) => (
                                                        <motion.circle
                                                            key={i}
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: hoveredPoint === i ? 1.5 : 1 }}
                                                            cx={getCoords(i, cat).x}
                                                            cy={getCoords(i, cat).y}
                                                            r="6"
                                                            fill="#121212"
                                                            stroke={cleanConfig[cat]?.color}
                                                            strokeWidth="3"
                                                            className="drop-shadow-lg"
                                                        />
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
                                                        <motion.rect
                                                            key={cat}
                                                            initial={{ height: 0, y: 180 }}
                                                            animate={{ height: 180 - y, y }}
                                                            x={x + offset - bWidth / 2}
                                                            width={bWidth}
                                                            rx={6}
                                                            fill={cleanConfig[cat]?.color}
                                                            style={{ opacity: hoveredPoint === null || hoveredPoint === i ? 1 : 0.3 }}
                                                            className="drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]"
                                                        />
                                                    );
                                                })}
                                            </g>
                                        ))}
                                    </g>
                                )}
                            </AnimatePresence>

                            {/* Láthatatlan Kattintási Zónák a Tooltiphez */}
                            {data?.chartData.map((_, i) => (
                                <rect
                                    key={`hover-${i}`}
                                    x={50 + (i / (data.chartData.length - 1)) * 300 - 20}
                                    y={0}
                                    width={40}
                                    height={200}
                                    fill="transparent"
                                    onTouchStart={() => setHoveredPoint(i)}
                                    onMouseEnter={() => setHoveredPoint(i)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    className="cursor-pointer"
                                />
                            ))}
                        </svg>

                        {/* Hónap Feliratok (X tengely) */}
                        <div className="absolute -bottom-2 left-0 right-0 flex justify-around px-8 text-white/30 font-black text-[10px] uppercase tracking-widest">
                            {data?.chartData.map(d => <span key={d.label}>{d.label}</span>)}
                        </div>
                    </motion.div>

                    {/* KATEGÓRIÁK LISTÁJA */}
                    <div className="bg-surface rounded-[3rem] px-6 py-8 flex-1 border-t border-white/5 z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] mt-10">
                        <h3 className="font-black text-xl italic uppercase mb-6 pl-2 text-white">Kategóriák</h3>
                        <div className="flex flex-col gap-4">
                            {(Object.keys(cleanConfig) as MeterFilter[]).map(key => {
                                const isActive = filter === key;
                                const color = cleanConfig[key].color;

                                return (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className="relative w-full text-left transition-all active:scale-[0.98] group"
                                    >
                                        {/* Ha aktív, szép színes keretet és ragyogást kap */}
                                        <div
                                            className={`absolute inset-0 rounded-[2rem] transition-all duration-500 ${isActive ? "opacity-10" : "opacity-0 group-hover:opacity-5"}`}
                                            style={{ backgroundColor: color }}
                                        />
                                        <div
                                            className={`relative flex items-center justify-between p-4 rounded-[2rem] border transition-all duration-300 ${isActive ? "bg-white/5 shadow-xl" : "bg-transparent border-transparent opacity-60 hover:opacity-100"
                                                }`}
                                            style={{ borderColor: isActive ? `${color}40` : 'transparent' }}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner"
                                                    style={{ backgroundColor: isActive ? `${color}20` : "rgba(255,255,255,0.05)" }}
                                                >
                                                    {cleanConfig[key].icon}
                                                </div>
                                                <span className="font-black text-lg text-white">{cleanConfig[key].label}</span>
                                            </div>
                                            <div className="text-right flex flex-col justify-center h-full">
                                                <span className="font-black italic text-white text-lg leading-none">
                                                    {isActive ? (viewMode === "cost" ? data?.totalCost : data?.totalConsumption) : "•••"}
                                                </span>
                                                {isActive && viewMode === "difference" && key !== "all" && (
                                                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
                                                        {cleanConfig[key].unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
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