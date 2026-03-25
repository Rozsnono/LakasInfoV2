"use client";

import React, { useState, Fragment, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, Zap, Flame, Droplets, TrendingUp, TrendingDown,
    Camera, X, Share,
} from "lucide-react";
import Image from "next/image";
import Link from "@/contexts/router.context";
import { useHouse } from "@/contexts/house.context";
import ReadingDetailSheet from "@/components/ReadingDetailSheet";
import { exportFile } from "@/lib/file-export";
import { useUser } from "@/contexts/user.context";

interface Reading {
    _id: string;
    date: Date;
    value: number;
    difference: number;
    cost: number;
    photoUrl?: string | null;
    isPaid?: boolean;
}

interface MeterDetailProps {
    meter: {
        id: string;
        name: string;
        type: string;
        unit: string;
        currentValue: number;
        status: "optimal" | "warning" | "danger";
        trendPercentage: number;
        readings: Reading[];
    };
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const getVisuals = (type: string) => {
    switch (type) {
        case "villany": return { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", hex: "#eab308", high: "#ea5708" };
        case "gaz": return { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", hex: "#f97316", high: "#f93c16" };
        case "viz": return { icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", hex: "#3b82f6", high: "#4624cf" };
        default: return { icon: Zap, color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/20", hex: "#6b7280", high: "#333944" };
    }
};

export default function MeterDetailClient({ meter }: MeterDetailProps) {
    const { house } = useHouse();
    const { user } = useUser();
    const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const visuals = getVisuals(meter.type);
    const Icon = visuals.icon;

    const monthlyDataPoints = useMemo(() => {
        if (!meter.readings || meter.readings.length === 0) return [];
        const groups = new Map<string, Reading>();
        [...meter.readings].forEach(reading => {
            const d = reading.date;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            groups.set(key, reading);
        });
        return Array.from(groups.values()).sort((a, b) => a.date.getTime() - b.date.getTime()).slice(-12);
    }, [meter.readings]);

    const width = 300;
    const height = 60;
    const padding = 20;

    const values = monthlyDataPoints.map(r => r.difference);
    const maxVal = Math.max(...values, 1);
    const minValRaw = Math.min(...values);
    const minVal = minValRaw > 0 ? minValRaw * 0.995 : 0;
    const range = (maxVal - minVal) || 10;

    const averageValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    const averageY = height - ((averageValue - minVal) / range) * height + padding;

    const barWidth = monthlyDataPoints.length > 0 ? Math.min(16, (width / monthlyDataPoints.length) * 0.6) : 0;
    const spacing = monthlyDataPoints.length > 0 ? width / monthlyDataPoints.length : 0;

    const points = monthlyDataPoints.map((r, i) => {
        const x = (i * spacing) + (spacing / 2);
        const y = height - ((r.difference - minVal) / range) * height + padding;
        const barHeight = Math.max(4, (height + padding) - y);
        const finalY = (height + padding) - barHeight;
        const d = r.date;
        return {
            x,
            y: finalY,
            barHeight,
            value: r.difference,
            date: r.date,
            monthLabel: d.toLocaleDateString("hu-HU", { month: "long", year: "numeric" })
        };
    });

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="relative flex min-h-full flex-col gap-6 px-4 pb-24 pt-12">
            <motion.header variants={itemVariants} className="relative z-10 flex items-center justify-between text-white">
                <Link href="/dashboard/meters" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-surface-elevated shadow-lg transition-transform active:scale-90">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="truncate px-4 text-xl font-black uppercase italic tracking-tight">{meter.name}</h1>
                <div className="w-10" />
            </motion.header>

            <motion.div variants={itemVariants} className="relative z-10 mt-4 flex flex-col items-center">
                <div className={`mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] border shadow-2xl ${visuals.bg}`}>
                    <Icon className={`h-12 w-12 ${visuals.color}`} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Aktuális mérőállás</span>
                <div className="mt-2 flex items-baseline gap-2 text-white">
                    <h2 className="text-6xl font-black italic tracking-tighter">{meter.currentValue.toLocaleString()}</h2>
                    <span className="text-xl font-black uppercase text-white/40">{meter.unit}</span>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative z-10 flex flex-col gap-6 overflow-visible rounded-[2.5rem] border border-white/5 bg-surface p-6 shadow-2xl">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase italic tracking-widest text-white/40">Évi mérőállás trend</span>
                    <div className={`flex items-center gap-1 text-xs font-black ${meter.trendPercentage <= 0 ? "text-emerald-400" : "text-red-500"}`}>
                        {meter.trendPercentage <= 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                        {Math.abs(meter.trendPercentage)}%
                    </div>
                </div>

                <div className="relative mt-4 h-32 w-full">
                    <AnimatePresence>
                        {hoveredIndex !== null && points[hoveredIndex] && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} style={{ left: `${(points[hoveredIndex].x / width) * 100}%`, top: points[hoveredIndex].y - 55 }} className="pointer-events-none absolute z-[100] flex min-w-[120px] -translate-x-1/2 flex-col items-center rounded-xl border border-white/10 bg-zinc-800 px-3 py-2 shadow-2xl">
                                <span className="mb-0.5 text-[9px] font-black uppercase tracking-tighter text-white/40">{points[hoveredIndex].monthLabel}</span>
                                <span className="text-xs font-black leading-none text-white">{points[hoveredIndex].value.toLocaleString()} {meter.unit}</span>
                                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/10 bg-zinc-800" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <svg viewBox={`0 0 ${width} 100`} preserveAspectRatio="none" className="h-full w-full overflow-visible">
                        {points.length > 0 && (
                            <line
                                x1="0"
                                y1={averageY}
                                x2={width}
                                y2={averageY}
                                stroke="rgba(255, 255, 255, 0.4)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        )}
                        {points.map((p, i) => (
                            <g key={`point-group-${i}`}>
                                <rect
                                    x={p.x - barWidth / 2}
                                    y={p.y}
                                    width={barWidth}
                                    height={p.barHeight}
                                    fill={hoveredIndex === i ? "#ffffff" : (p.value > averageValue ? visuals.high : visuals.hex)}
                                    rx="4"
                                    className="transition-all duration-300 ease-out"
                                />
                                <rect
                                    x={p.x - spacing / 2}
                                    y="0"
                                    width={spacing}
                                    height="100"
                                    fill="transparent"
                                    onMouseEnter={() => setHoveredIndex(i)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    onTouchStart={() => setHoveredIndex(i)}
                                    className="cursor-pointer"
                                />
                            </g>
                        ))}
                    </svg>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative z-10 flex flex-col gap-4">
                <h3 className="px-2 text-lg font-black uppercase italic tracking-tight text-white">Rögzítések</h3>
                <div className="flex flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-surface shadow-2xl">
                    {meter.readings.length === 0 ? (
                        <div className="p-12 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Nincs rögzített adat</div>
                    ) : (
                        [...meter.readings].map((item, index) => (
                            <button
                                key={item._id}
                                onClick={() => setSelectedReading(item)}
                                className={`group flex flex-col p-6 text-left transition-all active:bg-white/5 ${index !== meter.readings.length - 1 ? "border-b border-white/5" : ""}`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[15px] font-black tracking-tight text-white">{item.date.toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" })}</span>
                                        {item.photoUrl && (
                                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                                                <Camera className="h-4 w-4 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end text-white">
                                        <span className="text-lg font-black italic">{item.value.toLocaleString()}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{meter.unit}</span>
                                    </div>
                                </div>
                                <div className="mt-3 flex w-full items-center justify-between">
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${!item.isPaid ? "text-red-400 font-bolder" : "line-through text-white/40"}`}>
                                        {user?.subscriptionPlan === 'pro' &&
                                            `${item.cost.toLocaleString()} Ft`
                                        }
                                    </span>
                                    <span className={`rounded-lg border border-white/5 bg-white/5 px-2 py-1 text-[11px] font-black uppercase tracking-widest ${item.difference > 0 ? "text-white" : "text-emerald-400"}`}>
                                        {item.difference > 0 ? "+" : ""}{item.difference.toFixed(2)} {meter.unit}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>

            <ReadingDetailSheet
                isOpen={!!selectedReading}
                onClose={() => setSelectedReading(null)}
                onShowPhoto={(url) => {
                    setSelectedPhoto(url);
                    setSelectedReading(null);
                }}
                reading={selectedReading ? { ...selectedReading, unit: meter.unit } : null}
                meterId={meter.id}
            />

            <AnimatePresence>
                {selectedPhoto && (
                    <Fragment key="photo-modal">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPhoto(null)} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="pointer-events-none fixed inset-0 z-[201] flex items-center justify-center p-4">
                            <div className="pointer-events-auto relative aspect-[3/4] w-full max-w-lg overflow-hidden rounded-[3rem] border border-white/10 bg-surface-elevated shadow-2xl">
                                <button onClick={() => setSelectedPhoto(null)} className="absolute left-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-black/50 text-white backdrop-blur-md transition-transform active:scale-90">
                                    <X size={24} />
                                </button>
                                <button
                                    onClick={async () => { await exportFile(selectedPhoto, "image/jpeg", `reading_photo_${selectedReading?._id}.jpg`, false, () => { }) }}
                                    className="absolute right-6 top-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary/80 text-white backdrop-blur-md transition-transform active:scale-90 hover:bg-primary"
                                >
                                    <Share size={22} className="ml-[-2px]" />
                                </button>
                                <Image src={selectedPhoto} alt="Fotó" className="h-full w-full object-cover" width={600} height={800} />
                            </div>
                        </motion.div>
                    </Fragment>
                )}
            </AnimatePresence>
        </motion.div>
    );
}