"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Check, Play } from "lucide-react";
import { useAppearance, WALLPAPERS, CATEGORIES } from "@/contexts/appearance.context";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function WallpaperSheet({ isOpen, onClose }: Props) {
    const { wallpaper: currentWallpaper, setWallpaper } = useAppearance();
    const [activeCat, setActiveCat] = useState("Világító");

    // Szűrés a Contextből jövő adatok alapján
    const filteredWallpapers = useMemo(() => {
        if (activeCat === "Összes") return WALLPAPERS;
        return WALLPAPERS.filter(wp => wp.category === activeCat);
    }, [activeCat]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150]"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-[#121212] border-t border-white/10 rounded-t-[3.5rem] z-[151] px-6 pt-4 pb-10 shadow-2xl max-h-[92vh] flex flex-col"
                    >
                        {/* Húzóka */}
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 shrink-0" />

                        {/* FEJLÉC */}
                        <div className="flex items-center justify-between mb-10 px-1 shrink-0">
                            <button
                                onClick={onClose}
                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <X className="w-6 h-6 text-white" />
                            </button>

                            <h3 className="text-2xl font-black tracking-tighter text-white uppercase italic text-center">
                                Hát<span className="text-[#34c759]">tér</span>
                            </h3>
                            <div className="w-10"></div>
                        </div>

                        {/* KATEGÓRIÁK */}
                        <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide shrink-0">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCat(cat)}
                                    className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeCat === cat
                                            ? "bg-white text-black shadow-xl"
                                            : "bg-white/5 text-white/30"
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* WALLPAPER RÁCS */}
                        <div className="grid grid-cols-3 gap-x-4 gap-y-10 overflow-y-auto pr-1 pb-10 scrollbar-hide">
                            <AnimatePresence mode="popLayout">
                                {filteredWallpapers.map((wp) => (
                                    <motion.button
                                        key={wp.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileTap={{ scale: 0.92 }}
                                        onClick={() => setWallpaper(wp.id)} // Közvetlenül a contextet frissíti
                                        className="aspect-[3/4.5] rounded-[2.2rem] relative overflow-hidden border-2 transition-all shadow-2xl bg-no-repeat bg-cover group"
                                        style={{
                                            background: wp.css,
                                            borderColor: currentWallpaper === wp.id ? "white" : "transparent",
                                        }}
                                    >
                                        {/* ANIMÁCIÓ JELZŐ IKON */}
                                        {wp.animated && (
                                            <div className="absolute bottom-3 right-3 w-6 h-6 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                                <Play className="w-3 h-3 text-white ml-0.5" fill="currentColor" />
                                            </div>
                                        )}

                                        {/* KIVÁLASZTOTT ÁLLAPOT */}
                                        {currentWallpaper === wp.id && (
                                            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl">
                                                    <Check className="text-black w-6 h-6" strokeWidth={4} />
                                                </div>
                                            </div>
                                        )}
                                    </motion.button>
                                ))}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}