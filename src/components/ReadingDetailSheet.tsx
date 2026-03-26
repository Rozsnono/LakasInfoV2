"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Trash2, Calendar, Gauge, Loader2, Eye, AlertTriangle, XCircle, Wallet, Check } from "lucide-react";
import { deleteReadingAction } from "@/app/actions/meter";
import PremiumBadge from "./PremiumBadge";
import { useUser } from "@/contexts/user.context";
import { updateReadingPaymentAction } from "@/app/actions/reading";
// import { updateReadingPaymentAction } from "@/app/actions/reading"; // Ezt majd neked kell megírnod a backendhez!

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
        isPaid?: boolean;      // ÚJ MEZŐ
        cost?: number;   // ÚJ MEZŐ
    } | null;
    meterId: string;
}

export default function ReadingDetailSheet({ isOpen, onClose, onShowPhoto, reading, meterId }: Props) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { user } = useUser();

    // Fizetéshez tartozó állapotok
    const [isPaid, setIsPaid] = useState(false);
    const [paidAmount, setPaidAmount] = useState<string>("");
    const [isSavingPayment, setIsSavingPayment] = useState(false);

    // Alaphelyzetbe állítás és adatok betöltése bezáráskor/nyitáskor
    useEffect(() => {
        if (isOpen && reading) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsPaid(reading.isPaid || false);
            setPaidAmount(reading.cost ? reading.cost.toString() : "");
        }
        if (!isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowConfirm(false);
            setErrorMessage(null);
            setIsDeleting(false);
        }
    }, [isOpen, reading]);

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

    // Fiktív fizetés mentő függvény (Ide kötheted be a backendet)
    const handleSavePayment = async () => {
        if (!reading) return;
        setIsSavingPayment(true);

        try {

            await updateReadingPaymentAction(reading._id, isPaid, Number(paidAmount));
            setIsSavingPayment(false);

            onClose();
        } catch (error) {
            console.error("Hiba a fizetés mentésekor:", error);
            setIsSavingPayment(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && reading && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />
                    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-8 pt-4 pb-12 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8">
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform">
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic text-center flex-1 pr-10">Mérés <span className="text-primary">részletei</span></h3>
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

                            {/* ALAP ADATOK */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-text-primary/30"><Calendar size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Dátum</span></div>
                                    <p className="text-text-primary font-bold text-sm">{reading.date.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                </div>
                                <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-text-primary/30"><Gauge size={12} /><span className="text-[9px] font-black uppercase tracking-widest">Állás</span></div>
                                    <p className="text-text-primary font-bold">{reading.value.toLocaleString()} {reading.unit}</p>
                                </div>
                            </div>

                            {/* FOGYASZTÁS */}
                            <div className="bg-primary/10 p-6 rounded-[2rem] border border-primary/20 flex justify-between items-center relative">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 italic">Fogyasztás</span>
                                    <p className="text-3xl font-black text-text-primary italic">{reading.difference >= 0 ? '+' : ''}{reading.difference.toFixed(2)} <span className="text-sm font-bold opacity-40">{reading.unit}</span></p>
                                </div>
                                {reading.photoUrl && (
                                    <button onClick={() => onShowPhoto(reading.photoUrl!)} className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                        <Eye className="text-text-primary" />
                                    </button>
                                )}
                            </div>

                            {/* ÚJ: FIZETÉS SZEKCIÓ */}
                            <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative ${isPaid ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/5'}`}>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isPaid ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                                            <Wallet className={`w-6 h-6 ${isPaid ? 'text-emerald-400' : 'text-text-primary/40'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-text-primary font-bold text-[15px] tracking-tight">Kifizetve</span>
                                            <span className="text-text-primary/40 text-[10px] font-black uppercase tracking-widest mt-0.5 italic">Számla státusza</span>
                                        </div>

                                    </div>
                                    <button
                                        onClick={user?.subscriptionPlan == 'pro' ? () => setIsPaid(prev => !prev) : undefined}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${isPaid ? 'bg-emerald-500' : 'bg-white/10'}`}
                                    >
                                        <motion.div animate={{ x: isPaid ? 24 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                                    </button>
                                </div>

                                <PremiumBadge className="w-4 h-4 top-4 right-4" />

                                <AnimatePresence>
                                    {isPaid && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                            <div className="pt-6">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400/60 ml-2 italic">Számla összege</label>
                                                <div className="relative mt-1">
                                                    <input
                                                        type="number"
                                                        value={paidAmount}
                                                        onChange={(e) => setPaidAmount(e.target.value)}
                                                        placeholder="0"
                                                        className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-2xl py-4 px-6 text-emerald-400 font-black text-xl focus:outline-none focus:border-emerald-500/50 transition-colors"
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400/40 uppercase tracking-widest">Ft</span>
                                                </div>
                                                <button
                                                    onClick={handleSavePayment}
                                                    disabled={isSavingPayment}
                                                    className="w-full mt-4 py-4 bg-emerald-500/20 text-emerald-400 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-50"
                                                >
                                                    {isSavingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Státusz mentése</>}
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* TÖRLÉS SZEKCIÓ */}
                            <div className="pt-4 min-h-[100px] flex items-center">
                                <AnimatePresence mode="wait">
                                    {!showConfirm ? (
                                        <motion.button
                                            key="del-btn"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                            onClick={() => setShowConfirm(true)}
                                            className="w-full py-5 bg-white/5 border border-white/10 text-text-primary/30 rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:bg-white/10 transition-colors"
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
                                                <button onClick={() => setShowConfirm(false)} className="flex-1 py-4 bg-white/10 text-text-primary rounded-2xl font-black uppercase tracking-widest text-[9px] active:scale-95 transition-transform">Mégsem</button>
                                                <button onClick={handleDelete} disabled={isDeleting} className="flex-[1.5] py-4 bg-red-500 text-text-primary rounded-2xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50">
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