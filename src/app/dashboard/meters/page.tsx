"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import {
    Zap,
    Flame,
    Droplets,
    Plus,
    History,
    MoreVertical,
    AlertCircle,
    ArrowLeft,
    Check,
    Loader2,
    Archive
} from "lucide-react";
import React, { useState } from "react";
import Link from "@/contexts/router.context";
import AddMeterSheet from "@/components/AddMeterSheet";
import MeterOptionsSheet from "@/components/MeterOptionsSheet";
import { MeterWithStats } from "@/services/meter.service";
import { useAction } from "@/providers/action.provider";
import { useHouse } from "@/contexts/house.context";
import { getMetersAndLastReadingForHouseAction } from "@/app/actions/meter";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

// Segédfüggvény az ikonokhoz
const getMeterVisuals = (type: string) => {
    switch (type) {
        case "villany": return { icon: <Zap className="w-6 h-6 text-yellow-500" />, color: "bg-yellow-500/10 border-yellow-500/20" };
        case "gaz": return { icon: <Flame className="w-6 h-6 text-orange-500" />, color: "bg-orange-500/10 border-orange-500/20" };
        case "viz": return { icon: <Droplets className="w-6 h-6 text-blue-500" />, color: "bg-blue-500/10 border-blue-500/20" };
        default: return { icon: <Zap className="w-6 h-6 text-gray-500" />, color: "bg-gray-500/10 border-gray-500/20" };
    }
};

export default function MetersClient() {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [meters, setMeters] = useState<MeterWithStats[]>([]);
    const [selectedMeter, setSelectedMeter] = useState<{ id: string; name: string } | null>(null);
    const { house } = useHouse();

    const { isPending, error, execute } = useAction(getMetersAndLastReadingForHouseAction, {
        immediate: true,
        initialArgs: [house!._id.toString()],
        condition: !!house?._id,
        onSuccess: (freshMeters) => { setMeters(freshMeters.meters as unknown as MeterWithStats[]); },
    });

    // Rendezzük a mérőórákat: az aktívak elöl, az archiváltak hátul
    const sortedMeters = [...meters].sort((a, b) => {
        if (a.isArchived === b.isArchived) return 0;
        return a.isArchived ? 1 : -1;
    });

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-full px-4 pt-12 pb-6 flex flex-col gap-6"
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
                        <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Mérő<span className="text-primary text-outline">órák</span></h1>
                        <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                            {isPending ? "Betöltés..." : `${meters.length} eszköz`}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                >
                    <Plus className="w-6 h-6" strokeWidth={3} />
                </button>
            </motion.header>

            <div className="relative z-10 flex flex-col gap-4 mt-2 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                    {isPending ? (
                        /* TÖLTÉS ÁLLAPOT */
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 gap-4"
                        >
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Mérőórák betöltése...</p>
                        </motion.div>
                    ) : error ? (
                        /* HIBA ÁLLAPOT */
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-16 px-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem]"
                        >
                            <p className="text-red-400 text-sm font-bold">Hiba történt az adatok betöltésekor.</p>
                            <button onClick={() => execute(house!._id.toString())} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                        </motion.div>
                    ) : sortedMeters.length === 0 ? (
                        /* ÜRES ÁLLAPOT */
                        <motion.div
                            key="empty"
                            variants={itemVariants}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-12"
                        >
                            <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Még nincsenek mérőórák.</p>
                            <p className="text-white/20 text-[10px] mt-2 font-black uppercase tracking-widest">Kattints a + ikonra a hozzáadáshoz.</p>
                        </motion.div>
                    ) : (
                        /* ADATOK MEGJELENÍTÉSE */
                        sortedMeters.map((meter) => {
                            const visual = getMeterVisuals(meter.type);
                            const isArchived = meter.isArchived;

                            // Dátum formázása
                            const lastReadDate = meter.lastReadingDate
                                ? new Date(meter.lastReadingDate).toLocaleDateString('hu-HU', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                : 'Nincs adat';

                            return (
                                <motion.div
                                    key={meter._id.toString()}
                                    variants={itemVariants}
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    // Ha archivált, halványítjuk a kártyát
                                    className={`bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex flex-col gap-5 relative overflow-hidden group transition-all ${isArchived ? 'grayscale-[30%]' : ''}`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${visual.color}`}>
                                                {visual.icon}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-black text-xl tracking-tight leading-none italic">{meter.name}</span>
                                                    {/* Archivált plecsni */}

                                                </div>
                                                <span className="text-text-secondary text-[11px] font-bold uppercase tracking-wider mt-2 opacity-50">{lastReadDate}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setSelectedMeter({ id: meter._id.toString(), name: meter.name });
                                            }}
                                            className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-white/20 active:bg-white/10 active:text-white transition-all"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="flex items-end justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-text-secondary text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-40">Jelenlegi állás</span>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-4xl font-black text-white tracking-tighter">{meter.lastReadingValue.toLocaleString()}</span>
                                                <span className="text-white/20 font-black text-sm uppercase">{meter.unit}</span>
                                            </div>
                                        </div>

                                        {!isArchived && (
                                            <div className="flex flex-col items-end gap-2">
                                                {meter.stats.isOverLimit ? (
                                                    <div className="flex items-center gap-2 text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : meter.stats.consumption > (meter.tierLimit || 999999) * 0.8 ? (
                                                    <div className="flex items-center gap-2 text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-500/20">
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                                        <Check className="w-3.5 h-3.5" />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {isArchived && (
                                            <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-full text-white/50 border border-white/5">
                                                <Archive className="w-3 h-3" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Archivált</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px w-full bg-white/5"></div>

                                    {/* Linkelés a dinamikus [id] oldalra */}
                                    <Link href={`/dashboard/meters/${meter._id.toString()}`}>
                                        <motion.div
                                            whileTap={{ scale: 0.98 }}
                                            className="flex items-center justify-between w-full py-2 group active:opacity-70 transition-all"
                                        >
                                            <div className="flex items-center gap-3 text-text-secondary group-hover:text-white transition-colors">
                                                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                                                    <History className="w-4 h-4 opacity-40" />
                                                </div>
                                                <span className="text-xs font-bold uppercase tracking-widest opacity-60">Előzmények</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-black text-sm tracking-tight">
                                                    {meter.stats.consumption > 0 ? "+" : ""}{meter.stats.consumption.toFixed(2)} {meter.unit}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            );
                        })
                    )}
                </AnimatePresence>
            </div>

            {/* Modalok */}
            <AddMeterSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
            <MeterOptionsSheet
                isOpen={!!selectedMeter}
                onClose={() => setSelectedMeter(null)}
                meterId={selectedMeter?.id || ""}
                meterName={selectedMeter?.name || ""}
            />
        </motion.div>
    );
}