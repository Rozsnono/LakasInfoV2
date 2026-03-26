"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Monitor, Moon, Sun, Check, Sparkles, Image as ImageIcon, ChevronRight } from "lucide-react";
import Link from "@/contexts/router.context";
import { useAppearance } from "@/contexts/appearance.context";
import WallpaperSheet from "@/components/WallpaperSheet";

const COLORS = [
    { id: "red", hex: "#ff3b30" },
    { id: "blue", hex: "#007aff" },
    { id: "green", hex: "#34c759" },
    { id: "purple", hex: "#af52de" },
    { id: "orange", hex: "#ff9500" },
];

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function AppearancePage() {
    const { theme, setTheme, accent, setAccent, animations, setAnimations, wallpaper, setWallpaper } = useAppearance();

    // Háttérkezelés állapotai
    const [isWallpaperOpen, setIsWallpaperOpen] = useState(false);

    return (
        <motion.div initial="hidden" animate="visible" className="relative min-h-screen  px-4 pt-12 pb-24 flex flex-col gap-8">

            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase italic">Megjele<span style={{ color: accent }}>nés</span></h1>
            </motion.header>

            {/* HÁTTÉRKÉP SZEKCIÓ */}
            <motion.div variants={itemVariants} className="relative z-10 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Alkalmazás háttere</label>
                <button
                    onClick={() => setIsWallpaperOpen(true)}
                    className="w-full bg-surface rounded-[2.5rem] p-4 border border-white/5 shadow-2xl flex items-center justify-between group active:scale-[0.98] transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 overflow-hidden">
                            {/* Itt egy kis előnézet a hátérről */}
                            <div className="w-full h-full opacity-80" style={{ background: `var(--app-wallpaper) center/cover no-repeat` }} />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-text-primary font-bold text-base">Háttér kiválasztása</span>
                            <span className="text-text-primary/30 text-[10px] font-black uppercase tracking-widest">Átmenetek és színek</span>
                        </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-text-primary/20 group-hover:text-text-primary transition-colors" />
                </button>
            </motion.div>

            {/* VIZUÁLIS TÉMA */}
            <motion.div variants={itemVariants} className="relative z-10 space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Vizuális téma</label>
                <div className="grid grid-cols-3 gap-3">
                    <ThemeButton active={theme === "system"} onClick={() => setTheme("system")} icon={<Monitor className="w-5 h-5" />} label="Rendszer" accent={accent} />
                    <ThemeButton active={theme === "dark"} onClick={() => setTheme("dark")} icon={<Moon className="w-5 h-5" />} label="Sötét" accent={accent} />
                    <ThemeButton active={theme === "light"} onClick={() => setTheme("light")} icon={<Sun className="w-5 h-5" />} label="Világos" accent={accent} />
                </div>
            </motion.div>

            {/* KIEMELŐ SZÍN */}
            <motion.div variants={itemVariants} className="relative z-10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Kiemelő szín</label>
                <div className="bg-surface rounded-[2.5rem] p-6 border border-white/5 shadow-2xl flex items-center justify-between">
                    {COLORS.map((color) => (
                        <button
                            key={color.id}
                            onClick={() => setAccent(color.hex)}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-75 relative"
                            style={{ backgroundColor: color.hex }}
                        >
                            {accent === color.hex && <Check className="w-6 h-6 text-text-primary" strokeWidth={4} />}
                        </button>
                    ))}
                </div>
            </motion.div>

            {/* INTERAKCIÓK */}
            <motion.div variants={itemVariants} className="relative z-10 space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Interakciók</label>
                <div className="bg-surface rounded-[2.5rem] p-7 border border-white/5 shadow-2xl flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <Sparkles className="w-6 h-6" style={{ color: accent }} />
                        <span className="text-text-primary font-bold text-[17px]">Animációk</span>
                    </div>
                    <button
                        onClick={() => setAnimations(!animations)}
                        className="w-14 h-8 rounded-full p-1 transition-all relative"
                        style={{ backgroundColor: animations ? accent : "rgba(255,255,255,0.1)" }}
                    >
                        <motion.div animate={{ x: animations ? 24 : 0 }} className="w-6 h-6 bg-white rounded-full" />
                    </button>
                </div>
            </motion.div>

            {/* WALLPAPER SHEET MEGHÍVÁSA */}
            <WallpaperSheet
                isOpen={isWallpaperOpen}
                onClose={() => setIsWallpaperOpen(false)}
            />
        </motion.div>
    );
}

function ThemeButton({ active, onClick, icon, label, accent }: Readonly<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    accent: string;
}>) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-4 p-6 rounded-[2rem] border transition-all ${active ? "bg-white/10" : "bg-surface border-white/5 opacity-40"}`}
            style={{ borderColor: active ? accent : "" }}
        >
            <div style={{ color: active ? accent : "white" }}>{icon}</div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">{label}</span>
        </button>
    );
}