"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Gauge, ChevronDown, Coins, Layers, ChevronLeft, Zap, Flame, Droplets, Check, Loader2, AlertCircle } from "lucide-react";
import { createMeterAction, CreateMeterInput } from "@/app/actions/meter";
import { useHouse } from "@/contexts/house.context"; // Importáljuk a Hook-ot
import { useUser } from "@/contexts/user.context";
import PremiumBadge from "./PremiumBadge";

interface AddMeterSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
        y: "100%",
        transition: { duration: 0.3 },
    },
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const METER_TYPES = [
    { id: "villany", label: "Villanyóra", unit: "kWh", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "gaz", label: "Gázóra", unit: "m³", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "viz", label: "Vízóra", unit: "m³", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
] as const;

export default function AddMeterSheet({ isOpen, onClose }: AddMeterSheetProps) {
    // Kinyerjük a házat a globális állapotból
    const { house } = useHouse();
    const { user } = useUser();

    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        type: "villany" as "villany" | "gaz" | "viz",
        initialValue: "",
        isTiered: false,
        tierLimit: "",
        basePrice: "",
        marketPrice: "",
    });

    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: "",
                type: "villany",
                initialValue: "",
                isTiered: false,
                tierLimit: "",
                basePrice: "",
                marketPrice: "",
            });
            setError(null);
            setIsSelectOpen(false);
        }
    }, [isOpen]);

    const selectedType = METER_TYPES.find((t) => t.id === formData.type) || METER_TYPES[0];
    const unit = selectedType.unit;

    // --- MENTÉS LOGIKA ---
    const handleSave = async () => {
        if (!formData.name) {
            setError("Kérlek, add meg a mérőóra nevét!");
            return;
        }

        // Védőháló: Ha valamilyen oknál fogva nincs house context, ne menjünk tovább
        if (!house) {
            setError("Hiba: Nem található aktív ház!");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const meterData: CreateMeterInput = {
                name: formData.name,
                type: formData.type,
                unit: unit,
                houseId: house._id, // Itt használjuk a Context-ből jövő ID-t!
                initialValue: formData.initialValue ? Number(formData.initialValue) : 0,
                isTiered: formData.isTiered,
                tierLimit: formData.tierLimit ? Number(formData.tierLimit) : undefined,
                basePrice: formData.basePrice ? Number(formData.basePrice) : undefined,
                marketPrice: formData.marketPrice ? Number(formData.marketPrice) : undefined,
                flatPrice: !formData.isTiered && formData.basePrice ? Number(formData.basePrice) : undefined
            };

            const result = await createMeterAction(meterData);

            if (result.success) {
                onClose();
            } else {
                setError(result.error || "Hiba történt a mentés során.");
            }
        } catch (err) {
            setError("Hálózati hiba történt.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={loading ? undefined : onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-6 px-2 shrink-0">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-50"
                            >
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Új <span className="text-primary">Mérőóra</span></h3>
                            <div className="w-10" />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mb-4 flex items-center gap-3 bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest shrink-0"
                            >
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Mérőóra neve</label>
                                <div className="relative">
                                    <Gauge className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input
                                        type="text"
                                        disabled={loading}
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="pl. Nappali villanyóra"
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Típus</label>
                                    <div className="relative z-[60]">
                                        <button
                                            disabled={loading}
                                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                                            className="w-full h-14 flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl px-6 text-text-primary font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                                        >
                                            <span className="truncate">{selectedType.label}</span>
                                            <ChevronDown className={`w-4 h-4 text-text-primary/20 transition-transform duration-300 ${isSelectOpen ? "rotate-180" : ""}`} />
                                        </button>

                                        <AnimatePresence>
                                            {isSelectOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 4 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[70] backdrop-blur-xl"
                                                >
                                                    {METER_TYPES.map((type) => (
                                                        <button
                                                            key={type.id}
                                                            onClick={() => {
                                                                setFormData({ ...formData, type: type.id });
                                                                setIsSelectOpen(false);
                                                            }}
                                                            className={`w-full flex items-center justify-between p-4 transition-colors ${formData.type === type.id ? "bg-white/10" : "hover:bg-white/5"}`}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-8 h-8 rounded-lg ${type.bg} flex items-center justify-center`}>
                                                                    <type.icon className={`w-4 h-4 ${type.color}`} />
                                                                </div>
                                                                <span className="text-sm font-bold text-text-primary">{type.label}</span>
                                                            </div>
                                                            {formData.type === type.id && <Check className="w-4 h-4 text-primary" />}
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Kezdeti állás</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            disabled={loading}
                                            value={formData.initialValue}
                                            onChange={(e) => setFormData({ ...formData, initialValue: e.target.value })}
                                            placeholder="0"
                                            className="w-full h-14 bg-white/5 border border-white/5 rounded-2xl pl-6 pr-12 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-primary/20 uppercase tracking-widest pointer-events-none">
                                            {unit}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 relative">
                                <div className="flex items-center gap-4 ">
                                    <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-white/5 shadow-inner">
                                        <Layers className="w-6 h-6 text-text-primary" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-text-primary font-bold text-[15px] tracking-tight">Sávos árazás</span>
                                        <span className="text-text-primary/40 text-[10px] font-bold uppercase tracking-widest mt-0.5">Limit feletti ár</span>
                                    </div>
                                    <PremiumBadge className="w-4 h-4 text-yellow-400 top-3 right-4" />
                                </div>
                                <button
                                    disabled={loading}
                                    onClick={user?.subscriptionPlan === 'pro' ? () => setFormData({ ...formData, isTiered: !formData.isTiered }) : undefined}
                                    className={`w-12 h-7 rounded-full transition-colors relative ${formData.isTiered ? "bg-primary" : "bg-white/10"}`}
                                >
                                    <motion.div
                                        animate={{ x: formData.isTiered ? 24 : 4 }}
                                        className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                                    />
                                </button>
                            </div>

                            <AnimatePresence>
                                {formData.isTiered && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 overflow-hidden"
                                    >
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Kedvezményes keret</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    disabled={loading}
                                                    value={formData.tierLimit}
                                                    onChange={(e) => setFormData({ ...formData, tierLimit: e.target.value })}
                                                    placeholder={formData.type === "villany" ? "210" : "144"}
                                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-text-primary font-bold focus:outline-none focus:border-primary/50"
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-text-primary/20 uppercase tracking-widest pointer-events-none">
                                                    {unit}/hó
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400/40 ml-4">Alap ár</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        disabled={loading}
                                                        value={formData.basePrice}
                                                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                                        placeholder={formData.type === "villany" ? "36" : "102"}
                                                        className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl py-4 px-6 text-emerald-400 font-bold focus:outline-none"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400/20 uppercase tracking-widest">Ft</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4">Piaci ár</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        disabled={loading}
                                                        value={formData.marketPrice}
                                                        onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                                                        placeholder={formData.type === "villany" ? "70" : "747"}
                                                        className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-4 px-6 text-primary font-bold focus:outline-none"
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary/20 uppercase tracking-widest">Ft</span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="bg-blue-500/5 p-6 rounded-3xl border border-blue-500/10 flex items-start gap-4">
                                <Coins className="w-6 h-6 text-blue-400 shrink-0" />
                                <p className="text-[10px] uppercase tracking-widest text-blue-400/60 leading-relaxed font-black">
                                    Az árak megadása nem kötelező. A rendszer alapértelmezetten a hatályos kormányrendelet szerinti rezsiárakkal számol.
                                </p>
                            </div>

                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform shrink-0 mt-4 flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mérőóra mentése"}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}