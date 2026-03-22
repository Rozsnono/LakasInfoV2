"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Mail, Loader2, Palette, MousePointer2 } from "lucide-react";
import { useUser } from "@/contexts/user.context";
import { updateProfileAction } from "@/app/actions/profile";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonalDataSheet({ isOpen, onClose }: Props) {
    const { user, refreshUser } = useUser();

    // Referenciák a rejtett inputokhoz
    const solidInputRef = useRef<HTMLInputElement>(null);
    const gradStartRef = useRef<HTMLInputElement>(null);
    const gradEndRef = useRef<HTMLInputElement>(null);

    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);

    const isInitialGradient = user?.colorCode?.includes("linear-gradient") || false;
    const [mode, setMode] = useState<"solid" | "gradient">(isInitialGradient ? "gradient" : "solid");

    const [solidColor, setSolidColor] = useState(user?.colorCode || "#ff3b30");
    const [gradStart, setGradStart] = useState("#007aff");
    const [gradEnd, setGradEnd] = useState("#af52de");

    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
            if (user.colorCode?.includes("linear-gradient")) {
                setMode("gradient");
                const colors = user.colorCode.match(/#[a-fA-F0-9]{6}/g);
                if (colors && colors.length >= 2) {
                    setGradStart(colors[0]);
                    setGradEnd(colors[1]);
                }
            } else {
                setMode("solid");
                setSolidColor(user.colorCode || "#ff3b30");
            }
        }
    }, [user, isOpen]);

    const finalColorCode = useMemo(() => {
        if (mode === "solid") return solidColor;
        return `linear-gradient(135deg, ${gradStart} 0%, ${gradEnd} 100%)`;
    }, [mode, solidColor, gradStart, gradEnd]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateProfileAction({ name, email, colorCode: finalColorCode });
            if (result.success) {
                await refreshUser();
                onClose();
            } else {
                alert(result.message || "Hiba a mentés során");
            }
        } catch (error) {
            console.error("Save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />

                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[100vh] overflow-y-auto no-scrollbar flex flex-col gap-8"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto shrink-0" />

                        <div className="flex items-center justify-between">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Személyes <span className="text-primary">adatok</span></h3>
                            <div className="w-10" />
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Név</label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">E-mail</label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Profil szín</label>
                                    <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/5 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                                                <button onClick={() => setMode("solid")} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${mode === "solid" ? "bg-white text-black" : "text-white/40"}`}>SOLID</button>
                                                <button onClick={() => setMode("gradient")} className={`px-4 py-1.5 rounded-full text-[10px] font-black transition-all ${mode === "gradient" ? "bg-white text-black" : "text-white/40"}`}>GRADIENT</button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 items-end justify-between">
                                            <div className="flex flex-col items-center justify-center py-4 gap-4">
                                                <motion.button
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => mode === 'solid' ? solidInputRef.current?.click() : null}
                                                    className="w-24 h-24 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
                                                    style={{ background: finalColorCode }}
                                                >
                                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <MousePointer2 className="w-6 h-6 text-white shadow-xl" />
                                                    </div>
                                                </motion.button>
                                            </div>

                                            <input type="color" ref={solidInputRef} value={solidColor} onChange={(e) => setSolidColor(e.target.value)} style={{ display: 'none' }} />
                                            <input type="color" ref={gradStartRef} value={gradStart} onChange={(e) => setGradStart(e.target.value)} style={{ display: 'none' }} />
                                            <input type="color" ref={gradEndRef} value={gradEnd} onChange={(e) => setGradEnd(e.target.value)} style={{ display: 'none' }} />

                                            <div className="space-y-3">
                                                {mode === "solid" ? (
                                                    <motion.button
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => solidInputRef.current?.click()}
                                                        className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
                                                    >
                                                        <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Szín</span>
                                                        <div className="w-10 h-10 rounded-full border-2 border-white/10" style={{ backgroundColor: solidColor }} />
                                                    </motion.button>
                                                ) : (
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <motion.button
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => gradStartRef.current?.click()}
                                                            className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
                                                        >
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Kezdő</span>
                                                            <div className="w-10 h-10 rounded-full border-2 border-white/10" style={{ backgroundColor: gradStart }} />
                                                        </motion.button>
                                                        <motion.button
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => gradEndRef.current?.click()}
                                                            className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-2"
                                                        >
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Végpont</span>
                                                            <div className="w-10 h-10 rounded-full border-2 border-white/10" style={{ backgroundColor: gradEnd }} />
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>



                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-widest text-[11px] shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Változtatások mentése"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}