"use client";

import React, { useState, Fragment, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, Zap, Flame, Droplets, TrendingUp, TrendingDown,
    MoreVertical, Edit2, Trash2, Camera, X, Share2, Calendar, Gauge, Eye, Loader2,
    Share
} from "lucide-react";
import Image from "next/image";
import Link from "@/contexts/router.context";
import { useHouse } from "@/contexts/house.context";
import ReadingDetailSheet from "@/components/ReadingDetailSheet";

// --- INTERFÉSZEK ---
interface Reading {
    _id: string;
    date: string;
    value: number;
    difference: number;
    cost: number;
    photoUrl?: string | null;
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
        case "villany": return { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", hex: "#eab308" };
        case "gaz": return { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", hex: "#f97316" };
        case "viz": return { icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", hex: "#3b82f6" };
        default: return { icon: Zap, color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/20", hex: "#6b7280" };
    }
};

export default function MeterDetailClient({ meter }: MeterDetailProps) {
    const { house } = useHouse();
    const [selectedReading, setSelectedReading] = useState<Reading | null>(null);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const visuals = getVisuals(meter.type);
    const Icon = visuals.icon;

    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const clean = dateStr.trim().replace(/\s/g, "").replace(/\.$/, "").replace(/\./g, "-");
        const d = new Date(clean);
        return isNaN(d.getTime()) ? new Date() : d;
    };

    const monthlyDataPoints = useMemo(() => {
        if (!meter.readings || meter.readings.length === 0) return [];
        const groups = new Map<string, Reading>();
        const allSorted = [...meter.readings].sort((a, b) =>
            parseDate(a.date).getTime() - parseDate(b.date).getTime()
        );
        allSorted.forEach(reading => {
            const d = parseDate(reading.date);
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            groups.set(key, reading);
        });
        return Array.from(groups.values()).sort((a, b) => parseDate(a.date).getTime() - parseDate(b.date).getTime()).slice(-6);
    }, [meter.readings]);

    const width = 300;
    const height = 60;
    const padding = 20;

    const values = monthlyDataPoints.map(r => r.value);
    const maxVal = Math.max(...values, 1);
    const minValRaw = Math.min(...values);
    const minVal = minValRaw > 0 ? minValRaw * 0.995 : 0;
    const range = (maxVal - minVal) || 10;

    const points = monthlyDataPoints.map((r, i) => {
        const x = monthlyDataPoints.length > 1 ? (i * (width / (monthlyDataPoints.length - 1))) : width / 2;
        const y = height - ((r.value - minVal) / range) * height + padding;
        const d = parseDate(r.date);
        return { x, y, value: r.value, date: r.date, monthLabel: d.toLocaleDateString('hu-HU', { month: 'long', year: 'numeric' }) };
    });

    const generateGraphPath = () => {
        if (points.length === 0) return "";
        if (points.length === 1) return `M 0 ${points[0].y} L 300 ${points[0].y}`;
        return `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    };

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="relative min-h-full  px-4 pt-12 pb-24 flex flex-col gap-6">

            {/* HEADER */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center justify-between text-white">
                <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-lg active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-xl font-black tracking-tight uppercase italic truncate px-4">{meter.name}</h1>
                <div className="w-10" />
            </motion.header>

            {/* FŐ ÉRTÉK */}
            <motion.div variants={itemVariants} className="relative z-10 flex flex-col items-center mt-4">
                <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center mb-6 border border-white/10 shadow-2xl ${visuals.bg}`}>
                    <Icon className={`w-12 h-12 ${visuals.color}`} />
                </div>
                <span className="text-white/50 font-black text-[10px] uppercase tracking-[0.2em]">Aktuális mérőállás</span>
                <div className="flex items-baseline gap-2 mt-2 text-white">
                    <h2 className="text-6xl font-black tracking-tighter italic">{meter.currentValue.toLocaleString()}</h2>
                    <span className="text-white/40 font-black text-xl uppercase">{meter.unit}</span>
                </div>
            </motion.div>

            {/* GRAFIKON KÁRTYA */}
            <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex flex-col gap-6 relative z-10 overflow-visible">
                <div className="flex justify-between items-center">
                    <span className="text-white/40 font-black text-[10px] uppercase tracking-widest italic">Havi mérőállás trend</span>
                    <div className={`flex items-center gap-1 font-black text-xs ${meter.trendPercentage <= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                        {meter.trendPercentage <= 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {Math.abs(meter.trendPercentage)}%
                    </div>
                </div>

                <div className="h-32 w-full relative mt-4">
                    <AnimatePresence>
                        {hoveredIndex !== null && points[hoveredIndex] && (
                            <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} style={{ left: `${(points[hoveredIndex].x / width) * 100}%`, top: points[hoveredIndex].y - 55 }} className="absolute z-[100] -translate-x-1/2 pointer-events-none bg-zinc-800 border border-white/10 px-3 py-2 rounded-xl shadow-2xl flex flex-col items-center min-w-[120px]">
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter mb-0.5">{points[hoveredIndex].monthLabel}</span>
                                <span className="text-xs font-black text-white leading-none">{points[hoveredIndex].value.toLocaleString()} {meter.unit}</span>
                                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-r border-b border-white/10 rotate-45" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <svg viewBox={`0 0 ${width} 100`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
                        <path d={generateGraphPath()} fill="none" stroke={visuals.hex} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        {points.map((p, i) => (
                            <g key={`point-group-${i}`}>
                                <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? "6" : "4"} fill={hoveredIndex === i ? "#fff" : visuals.hex} stroke={visuals.hex} strokeWidth={hoveredIndex === i ? "4" : "0"} className="transition-all duration-200" />
                                <circle cx={p.x} cy={p.y} r="25" fill="transparent" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)} onTouchStart={() => setHoveredIndex(i)} className="cursor-pointer" />
                            </g>
                        ))}
                    </svg>
                </div>
            </motion.div>

            {/* RÖGZÍTÉSEK LISTA */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4 relative z-10">
                <h3 className="text-white font-black text-lg tracking-tight uppercase italic px-2">Rögzítések</h3>
                <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
                    {meter.readings.length === 0 ? (
                        <div className="p-12 text-center text-white/20 text-[10px] font-black uppercase tracking-[0.2em]">Nincs rögzített adat</div>
                    ) : (
                        [...meter.readings].map((item, index) => (
                            <button
                                key={item._id}
                                onClick={() => setSelectedReading(item)}
                                className={`flex flex-col p-6 text-left transition-all active:bg-white/5 ${index !== meter.readings.length - 1 ? 'border-b border-white/5' : ''} group`}
                            >
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-black text-[15px] tracking-tight">{item.date}</span>
                                        {item.photoUrl && (
                                            <div className="bg-primary/10 w-8 h-8 rounded-xl flex items-center justify-center border border-primary/20">
                                                <Camera className="w-4 h-4 text-primary" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end text-white">
                                        <span className="font-black text-lg italic">{item.value.toLocaleString()}</span>
                                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{meter.unit}</span>
                                    </div>
                                </div>

                                {/* ÚJ: ALSÓ SOR A KÖLTSÉGGEL ÉS FOGYASZTÁSSAL */}
                                <div className="flex justify-between items-center w-full mt-3">
                                    <span className="text-white/40 text-[11px] font-bold uppercase tracking-wider">
                                        {item.cost.toLocaleString()} Ft
                                    </span>
                                    <span className={`text-[11px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border border-white/5 bg-white/5 ${item.difference > 0 ? 'text-white' : 'text-emerald-400'}`}>
                                        {item.difference > 0 ? "+" : ""}{item.difference} {meter.unit}
                                    </span>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </motion.div>

            {/* --- SHEET KOMPONENS MEGHÍVÁSA --- */}
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

            {/* FOTÓ MODAL */}
            <AnimatePresence>
                {selectedPhoto && (
                    <Fragment key="photo-modal">
                        {/* Háttér homályosítás */}
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPhoto(null)} className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl" />

                        {/* Modal tartalom */}
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
                            <div className="relative w-full max-w-lg aspect-[3/4] bg-surface-elevated rounded-[3rem] overflow-hidden shadow-2xl border border-white/10 pointer-events-auto">

                                {/* BEZÁRÁS GOMB */}
                                <button onClick={() => setSelectedPhoto(null)} className="absolute top-6 left-6 z-10 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform">
                                    <X size={24} />
                                </button>

                                {/* MEGOSZTÁS GOMB BASE64 KEZELÉSSEL */}
                                <button
                                    onClick={async () => {
                                        try {
                                            // 1. Base64 átalakítása valódi fájllá a fetch API segítségével
                                            const response = await fetch(selectedPhoto);
                                            const blob = await response.blob();
                                            const file = new File([blob], "kiválasztott_foto.jpg", { type: blob.type });

                                            // 2. Ellenőrizzük, hogy a böngésző tud-e fájlt megosztani
                                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                                await navigator.share({
                                                    title: 'Nézd meg ezt a fotót!',
                                                    files: [file]
                                                });
                                            } else {
                                                // Fallback: Ha asztali gépen vagyunk vagy nem támogatott a fájl megosztás,
                                                // akkor automatikusan letöltjük a képet a felhasználónak.
                                                const link = document.createElement("a");
                                                link.href = selectedPhoto;
                                                link.download = "letoltott_foto.jpg";
                                                document.body.appendChild(link);
                                                link.click();
                                                document.body.removeChild(link);
                                            }
                                        } catch (err) {
                                            console.log('Hiba történt a megosztáskor', err);
                                        }
                                    }}
                                    className="absolute top-6 right-6 z-10 w-12 h-12 rounded-2xl bg-black/50 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"
                                >
                                    <Share size={22} className="ml-[-2px]" />
                                </button>

                                {/* KÉP */}
                                <Image src={selectedPhoto} alt="Fotó" className="w-full h-full object-cover" width={600} height={800} />
                            </div>
                        </motion.div>
                    </Fragment>
                )}
            </AnimatePresence>
        </motion.div>
    );
}