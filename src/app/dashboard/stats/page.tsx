"use client";

import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, ChevronDown, Check, Zap, Flame, Droplets, Activity, Loader2 } from "lucide-react";
import Link from "@/contexts/router.context";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { getDetailedStatsAction } from "@/app/actions/detailed-stats";
import { DetailedStatsData, MeterFilter, CategoryKey } from "@/types/stats";

const METERS = [
    { id: "villany", label: "Villanyóra", icon: <Zap className="w-4 h-4 text-yellow-500" />, color: "#f59e0b" },
    { id: "gaz", label: "Gázóra", icon: <Flame className="w-4 h-4 text-orange-500" />, color: "#ef4444" },
    { id: "viz", label: "Vízóra", icon: <Droplets className="w-4 h-4 text-blue-500" />, color: "#3b82f6" },
];

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function StatsPage() {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedMeters, setSelectedMeters] = useState<string[]>(["all"]);
    const [loading, setLoading] = useState<boolean>(true);
    const [statsData, setStatsData] = useState<DetailedStatsData | null>(null);
    const [categories, setCategories] = useState<CategoryKey[]>([]);
    const [cleanConfig, setCleanConfig] = useState<typeof METERS>([]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const loadData = useCallback(async () => {
        setLoading(true);
        const filterToUse: MeterFilter = selectedMeters.includes("all") || selectedMeters.length !== 1 ? "all" : (selectedMeters[0] as MeterFilter);
        const res = await getDetailedStatsAction(filterToUse, "1y");
        if (res.success && res.value) {
            setStatsData(res.value);
            setCategories(res.value.categoryKeys);
            setCleanConfig(METERS.filter(m => res.value?.categoryKeys.includes(m.id as CategoryKey)));
        }
        setLoading(false);
    }, [selectedMeters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadData();
    }, [loadData]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMeter = (id: string) => {
        if (id === "all") {
            setSelectedMeters(["all"]);
        } else {
            let newSelection = selectedMeters.filter((m) => m !== "all");
            if (newSelection.includes(id)) {
                newSelection = newSelection.filter((m) => m !== id);
                if (newSelection.length === 0) newSelection = ["all"];
            } else {
                newSelection.push(id);
            }
            setSelectedMeters(newSelection);
        }
    };

    const getDropdownLabel = () => {
        if (selectedMeters.includes("all")) return "Összes mérőóra";
        if (selectedMeters.length === 1) return METERS.find((m) => m.id === selectedMeters[0])?.label;
        return `${selectedMeters.length} mérőóra`;
    };

    const categoriesToDraw = useMemo(() => {
        return selectedMeters.includes("all") ? categories : selectedMeters;
    }, [selectedMeters, categories]);

    const paths = useMemo(() => {
        const result: Record<string, string> = {};
        if (!statsData || statsData.chartData.length === 0) return result;

        categoriesToDraw.forEach(cat => {
            const values = statsData.chartData.map(d => {
                if (cat === "villany" || cat === "gaz" || cat === "viz") {
                    return d.breakdown[cat as CategoryKey].consumption;
                }
                return 0;
            });

            const maxVal = Math.max(...values) || 1;

            result[cat] = values.map((val, i) => {
                const x = values.length === 1 ? 150 : (i / (values.length - 1)) * 300;
                const y = 90 - (val / maxVal) * 70;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(" ");
        });

        return result;
    }, [statsData, categoriesToDraw]);

    const trendColor = statsData?.isTrendPositive ? "text-primary" : "text-[#10b981]";
    const trendIcon = statsData?.isTrendPositive ? "▲" : "▼";

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-full  px-4 pt-12 pb-24 flex flex-col gap-6 text-text-primary"
        >

            <motion.header variants={itemVariants} className="relative z-10 flex items-center justify-between mt-2">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard"
                        className="w-10 h-10 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-xl text-white"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Statisz<span className="text-primary text-outline">tikák</span></h1>
                    </div>
                </div>
            </motion.header>

            <motion.div variants={itemVariants} className="relative z-50" ref={dropdownRef}>
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 text-text-primary font-bold text-[17px] bg-surface-elevated/50 py-2.5 px-4 rounded-2xl border border-white/5 active:scale-95 transition-all"
                    >
                        {selectedMeters.includes("all") ? <Activity className="w-4 h-4 text-primary" /> : null}
                        {getDropdownLabel()}
                        <ChevronDown
                            className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                        />
                    </button>

                    <div className="bg-primary/10 px-4 py-2 rounded-xl border border-primary/10">
                        <span className="text-primary font-black text-xs uppercase tracking-widest">Idén</span>
                    </div>
                </div>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute top-full left-0 mt-3 w-64 bg-surface border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden backdrop-blur-xl z-50"
                        >
                            <div className="p-3 flex flex-col gap-1">
                                <button
                                    onClick={() => toggleMeter("all")}
                                    className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${selectedMeters.includes("all") ? "bg-white/10" : "hover:bg-white/5"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Activity className="w-5 h-5 text-primary" />
                                        <span className="font-bold">Összes (Mind)</span>
                                    </div>
                                    {selectedMeters.includes("all") && <Check className="w-5 h-5 text-primary" />}
                                </button>
                                <div className="h-[1px] bg-white/5 my-1 mx-4" />
                                {cleanConfig.map((meter) => (
                                    <button
                                        key={meter.id}
                                        onClick={() => toggleMeter(meter.id)}
                                        className={`flex items-center justify-between p-4 rounded-2xl transition-colors ${selectedMeters.includes(meter.id) ? "bg-white/10" : "hover:bg-white/5"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {meter.icon}
                                            <span className="font-bold">{meter.label}</span>
                                        </div>
                                        <div
                                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedMeters.includes(meter.id) ? "bg-primary border-primary" : "border-white/10"
                                                }`}
                                        >
                                            {selectedMeters.includes(meter.id) && <Check className="w-4 h-4 text-white" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants}>
                <Link href="/dashboard/stats/detailed">
                    <motion.div
                        whileTap={{ scale: 0.98 }}
                        className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-xl flex flex-col gap-4 relative overflow-hidden min-h-[220px]"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-10">
                            <Activity className="w-16 h-16" />
                        </div>
                        {loading ? (
                            <div className="flex flex-1 items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
                            </div>
                        ) : (
                            <>
                                <div>
                                    <span className="text-text-secondary font-bold text-xs uppercase tracking-widest opacity-50">
                                        Teljes fogyasztás
                                    </span>
                                    <div className="flex items-end gap-3 mt-1">
                                        <h2 className="text-2xl font-black">{statsData?.totalConsumption || "0"}</h2>
                                        <span className={`${trendColor} text-sm font-bold mb-1`}>{trendIcon} {statsData?.trend || "0%"}</span>
                                    </div>
                                </div>
                                <div className="flex-1 w-full mt-4 flex items-end">
                                    <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="w-full h-[100px] overflow-visible">
                                        {categoriesToDraw.map((cat) => (
                                            <motion.path
                                                key={cat}
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                                d={paths[cat] || "M 0 80 L 300 80"}
                                                fill="none"
                                                stroke={METERS.find(m => m.id === cat)?.color || "#ffffff"}
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        ))}
                                    </svg>
                                </div>
                            </>
                        )}
                    </motion.div>
                </Link>
            </motion.div>

            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                <div className="bg-surface rounded-3xl p-5 border border-white/5 flex flex-col gap-3">
                    <span className="text-text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">Keret</span>
                    <h3 className="text-xl font-black">78%</h3>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[78%] rounded-full shadow-[0_0_10px_rgba(255,59,48,0.3)]"></div>
                    </div>
                </div>
                <div className="bg-surface rounded-3xl p-5 border border-white/5 flex flex-col gap-3">
                    <span className="text-text-secondary font-bold text-[10px] uppercase tracking-[0.2em]">CO₂ Megtak.</span>
                    <h3 className="text-xl font-black">12.4 kg</h3>
                    <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`h-1 flex-1 rounded-full ${i < 5 ? "bg-[#10b981]" : "bg-white/10"}`} />
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}