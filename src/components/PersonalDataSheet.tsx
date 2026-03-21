"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, User, Mail, Loader2 } from "lucide-react";
import { useUser } from "@/contexts/user.context"; // A korábban gyártott contextünk
import { updateProfileAction } from "@/app/actions/profile"; // Ezt az action-t meg kell írnod

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function PersonalDataSheet({ isOpen, onClose }: Props) {
    const { user, refreshUser } = useUser();

    // Lokális state az inputoknak
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [isSaving, setIsSaving] = useState(false);

    // Ha időközben változik a user (pl. betöltődik), frissítsük a mezőket
    useEffect(() => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    }, [user, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateProfileAction({ name, email });

            if (result.success) {
                await refreshUser(); // Frissítjük a globális állapotot
                onClose(); // Bezárjuk a fület
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
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />

                        <div className="flex items-center justify-between mb-8">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight uppercase italic">Személyes <span className="text-primary">adatok</span></h3>

                            <div className="w-10" />
                        </div>

                        <div className="space-y-4">
                            {/* NÉV MEZŐ */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Név</label>
                                <div className="relative">
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            {/* EMAIL MEZŐ */}
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">E-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50"
                                    />
                                </div>
                            </div>

                            {/* MENTÉS GOMB */}
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-5 bg-white text-black rounded-3xl font-black uppercase tracking-widest text-xs mt-6 shadow-xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Mentés folyamatban...
                                    </>
                                ) : "Mentés"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}