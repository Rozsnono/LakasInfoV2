"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import {
    ArrowLeft, Search, Zap, Flame,
    Droplets, Camera, ChevronRight, Share2, Plus, X, Loader2
} from "lucide-react";
import Link from "@/contexts/router.context";
import NewReadingSheet from "@/components/NewReadingSheet";
import { IReadingWithInfo, IReadingWithInfoResponse } from "@/services/reading.service";
import { exportFile } from "@/lib/file-export";
import { useAction } from "@/providers/action.provider";
import { getAllReadingsAction } from "@/app/actions/reading";
import { useUser } from "@/contexts/user.context";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const getMeterVisuals = (type?: string) => {
    const t = (type || "").toLowerCase().trim();
    if (t === "villany" || t === "electricity") {
        return { icon: <Zap className="w-5 h-5 text-yellow-500" />, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", badge: "V" };
    }
    if (t === "gaz" || t === "gáz" || t === "gas") {
        return { icon: <Flame className="w-5 h-5 text-orange-500" />, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20", badge: "G" };
    }
    if (t === "viz" || t === "víz" || t === "water") {
        return { icon: <Droplets className="w-5 h-5 text-blue-500" />, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", badge: "W" };
    }
    return { icon: <Zap className="w-5 h-5 text-gray-500" />, color: "text-gray-500", bg: "bg-gray-500/10 border-gray-500/20", badge: "?" };
};

// Eltávolítottuk az initialReadings propot!
export default function AllReadingsClient() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
    const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
    const { user } = useUser();

    // A hook felel mostantól a teljes adatlekérésért
    const { data, isPending, error, execute } = useAction<IReadingWithInfoResponse, [string]>(
        getAllReadingsAction,
        {
            immediate: true,
            initialArgs: [user!.houseId!],
            condition: !!user?.houseId,
        }
    );

    // Szűrés a lekérdezett adatok alapján
    const filteredReadings = useMemo(() => {
        if (!data) return [];

        // Biztonsági ellenőrzés: Megkeressük a tömböt a válaszban.
        // Ha a data maga a tömb, azt használja. Ha objektum (pl. { readings: [...] }), akkor azt.
        const readingsList: IReadingWithInfo[] = data.value as IReadingWithInfo[];

        return readingsList.filter(r =>
            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, data]);

    const handleShare = async (url: string) => {
        await exportFile(url, "meroorafoto.jpg", "image/jpeg", false, () => { });
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-full px-4 pt-12 pb-24 flex flex-col gap-6"
        >

            <motion.header variants={itemVariants} className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="w-10 h-10 rounded-full bg-surface flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-xl text-white"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-black text-text-primary tracking-tight italic uppercase">Rögzí<span className="text-primary">tések</span></h1>
                            <p className="text-text-secondary text-xs font-bold uppercase tracking-widest opacity-60 mt-1">
                                {isPending ? "Betöltés..." : `${filteredReadings.length} összesen`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddSheetOpen(true)}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-2xl active:scale-90 transition-transform"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Keresés mérések között..."
                        className="w-full bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-primary/30 transition-all placeholder:text-text-secondary/40"
                    />
                </div>
            </motion.header>

            <motion.main variants={itemVariants} className=" pb-32 flex flex-col flex-1 z-10">
                <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-xl overflow-hidden min-h-[200px] flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {/* TÖLTÉS ÁLLAPOT */}
                        {isPending ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-20 gap-4"
                            >
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Adatok szinkronizálása...</p>
                            </motion.div>
                        ) : error ? (
                            /* HIBA ÁLLAPOT */
                            <motion.div key="error" variants={itemVariants} className="text-center py-20 px-6">
                                <p className="text-red-400 text-sm font-bold">Hiba történt az adatok betöltésekor.</p>
                                <button onClick={() => execute(user!.houseId!)} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                            </motion.div>
                        ) : filteredReadings.length === 0 ? (
                            /* ÜRES ÁLLAPOT */
                            <motion.div key="empty" variants={itemVariants} className="text-center py-20">
                                <p className="text-white/20 text-sm font-bold uppercase tracking-widest italic">Nincs rögzített adat ebben a listában.</p>
                            </motion.div>
                        ) : (
                            /* ADATOK MEGJELENÍTÉSE */
                            filteredReadings.map((item, index) => {
                                const config = getMeterVisuals(item.type);

                                return (
                                    <motion.div
                                        key={item._id.toString()}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: index * 0.02 }}
                                        className={`flex items-center justify-between p-5 active:bg-white/5 transition-colors cursor-pointer ${index !== filteredReadings.length - 1 ? 'border-b border-white/5' : ''}`}
                                        onClick={() => {
                                            if (item.photoUrl) {
                                                setSelectedPhoto(item.photoUrl);
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${config.bg}`}>
                                                    {config.icon}
                                                </div>
                                                {item.photoUrl && <Camera className="w-3.5 h-3.5 text-primary opacity-80 absolute bottom-0 right-0" />}
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="font-bold text-[17px] tracking-tight text-white">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[14px] font-semibold text-text-secondary opacity-70">{item.value}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex flex-col items-end">
                                                <span className="text-[0.5rem] font-bold text-text-secondary opacity-40 uppercase tracking-widest">{item.dateLabel}</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 opacity-10" />
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>
            </motion.main>

            <AnimatePresence>
                {selectedPhoto && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPhoto(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl cursor-pointer" />
                        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-lg aspect-[3/4] bg-surface-elevated rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                            <div className="absolute top-6 left-6 right-6 flex justify-between z-10">
                                <button onClick={() => setSelectedPhoto(null)} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white active:scale-90 transition-transform"><X className="w-6 h-6" /></button>
                                <button onClick={() => handleShare(selectedPhoto!)} className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg active:scale-90 transition-transform"><Share2 className="w-5 h-5" /></button>
                            </div>
                            <Image src={selectedPhoto} alt="Mérőóra fotó" className="w-full h-full object-cover" width={600} height={800} priority unoptimized />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <NewReadingSheet isOpen={isAddSheetOpen} onClose={() => setIsAddSheetOpen(false)} />
        </motion.div>
    );
}