"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trash2, Calendar, Gauge, Loader2, Eye, AlertTriangle, XCircle } from "lucide-react";
import { deleteReadingAction } from "@/app/actions/meter";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onShowPhoto: (url: string) => void;
    reading: {
        _id: string;
        date: Date;
        value: number;
        difference: number;
        unit: string;
        photoUrl?: string | null;
    } | null;
    meterId: string;
}

export default function ReadingDetailSheet({ isOpen, onClose, onShowPhoto, reading, meterId }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Alaphelyzetbe állítás bezáráskor
    useEffect(() => {
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowConfirm(false);
            setErrorMessage(null);
            setIsDeleting(false);
        }
    }, [isOpen]);

    const handleDelete = async () => {
        if (!reading) return;
        setErrorMessage(null);
        setIsDeleting(true);

        try {
            const result = await deleteReadingAction(reading._id, meterId);
            if (result.success) {
                onClose();
            } else {
                setErrorMessage(result.error || "Hiba történt a törlés során");
                setIsDeleting(false);
                setShowConfirm(false);
            }
        } catch (error) {
            setErrorMessage("Váratlan hiba történt");
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && reading && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-8 pt-4 pb-12 shadow-2xl">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase italic text-center flex-1 pr-10">Mérés <span className="text-primary">részletei</span></h3>
                        </div>

                        <div className="space-y-6">
                            <AnimatePresence>
                                {errorMessage && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                                        <XCircle className="text-red-500 shrink-0" size={18} />
                                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">{errorMessage}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-white/30"><Calendar size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Dátum</span></div>
                                    <p className="text-white font-bold">{reading.date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-white/30"><Gauge size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Állás</span></div>
                                    <p className="text-white font-bold">{reading.value.toLocaleString()} {reading.unit}</p>
                                </div>
                            </div>

                            <div className="bg-primary/10 p-6 rounded-[2rem] border border-primary/20 flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 italic">Fogyasztás</span>
                                    <p className="text-3xl font-black text-white italic">{reading.difference >= 0 ? '+' : ''}{reading.difference.toFixed(2)} <span className="text-sm font-bold opacity-40">{reading.unit}</span></p>
                                </div>
                                {reading.photoUrl && (
                                    <button onClick={() => onShowPhoto(reading.photoUrl!)} className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                        <Eye className="text-white" />
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 min-h-[100px] flex items-center">
                                <AnimatePresence mode="wait">
                                    {!showConfirm ? (
                                        <motion.button
                                            key="del-btn"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => setShowConfirm(true)}
                                            className="w-full py-5 bg-white/5 border border-white/10 text-white/30 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
                                        >
                                            <Trash2 size={16} /> Leolvasás törlése
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            key="confirm-panel"
                                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                                            className="w-full bg-red-500/5 border border-red-500/20 p-5 rounded-[2.5rem] flex flex-col items-center gap-4"
                                        >
                                            <div className="flex items-center gap-2 text-red-500">
                                                <AlertTriangle size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Biztosan törlöd?</span>
                                            </div>
                                            <div className="flex gap-3 w-full">
                                                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] active:scale-95 transition-transform">Mégsem</button>
                                                <button onClick={handleDelete} disabled={isDeleting} className="flex-[1.5] py-4 bg-red-500 text-white rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50">
                                                    {isDeleting ? <Loader2 className="animate-spin" size={14} /> : "Igen, töröld"}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}