"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Calculator, Info, Zap, Flame, Droplets, ChevronDown, Check } from "lucide-react";
import Link from "@/contexts/router.context";
import { IMeter, IMeterBase } from "@/models/meter.model";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function CalculatorClient({ initialMeters }: { initialMeters: IMeterBase[] }) {
    // Ha nincs választható óra, kezeljük
    const [selectedMeterId, setSelectedMeterId] = useState<string>(initialMeters[0]?._id.toString() || "");
    const [amount, setAmount] = useState<string>("");
    const [isSelectOpen, setIsSelectOpen] = useState(false);

    const selectedMeter = useMemo(() =>
        initialMeters.find(m => m._id.toString() === selectedMeterId),
        [selectedMeterId, initialMeters]);

    const calculateCost = () => {
        if (!selectedMeter) return 0;
        const val = parseFloat(amount) || 0;

        const limit = selectedMeter.tierLimit!;
        const discounted = Math.min(val, limit);
        const market = Math.max(0, val - limit);

        return Math.round(discounted * selectedMeter.basePrice! + market * selectedMeter.marketPrice!);
    };

    const estimatedCost = calculateCost();

    const getIcon = (type: string) => {
        switch (type) {
            case "villany": return <Zap className="w-4 h-4 text-yellow-500" />;
            case "gaz": return <Flame className="w-4 h-4 text-orange-500" />;
            case "viz": return <Droplets className="w-4 h-4 text-blue-500" />;
            default: return <Zap className="w-4 h-4 text-primary" />;
        }
    };

    if (initialMeters.length === 0) {
        return (
            <div className="min-h-screen  flex flex-col items-center justify-center p-8 text-center">
                <Info className="w-12 h-12 text-primary mb-4 opacity-20" />
                <h2 className="text-white font-black uppercase italic mb-2">Nincs beállított ár</h2>
                <p className="text-white/40 text-xs font-bold leading-relaxed mb-8">
                    A kalkulátor használatához előbb állíts be árakat a mérőóráid szerkesztésénél!
                </p>
                <Link href="/dashboard/meters" className="px-8 py-4 bg-white text-black rounded-full font-black uppercase text-[10px] tracking-widest">
                    Mérőórák kezelése
                </Link>
            </div>
        );
    }

    return (
        <motion.div initial="hidden" animate="visible" className="relative min-h-screen px-4 pt-12 pb-12 flex flex-col gap-8">

            <motion.header variants={itemVariants} className="relative flex items-center gap-4">
                <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl">
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic">Rezsi <span className="text-primary text-outline">Kalkulátor</span></h1>
            </motion.header>

            <motion.div variants={itemVariants} className="relative flex flex-col gap-6">
                {/* EGYEDI SELECTOR */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Választott mérőóra</label>
                    <div className="relative">
                        <button
                            onClick={() => setIsSelectOpen(!isSelectOpen)}
                            className="w-full flex items-center justify-between bg-surface border border-white/5 rounded-[1.5rem] py-5 px-6 text-white font-bold shadow-2xl transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                {selectedMeter && getIcon(selectedMeter.type)}
                                <span className="italic">{selectedMeter?.name}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-white/20 transition-transform ${isSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isSelectOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 5 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 bg-surface-elevated border border-white/10 rounded-[2rem] mt-2 overflow-hidden shadow-2xl z-[110] backdrop-blur-xl"
                                >
                                    {initialMeters.map(m => (
                                        <button
                                            key={m._id.toString()}
                                            onClick={() => { setSelectedMeterId(m._id.toString()); setIsSelectOpen(false); }}
                                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0 text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                {getIcon(m.type)}
                                                <span className={`text-sm font-bold ${selectedMeterId === m._id.toString() ? 'text-white' : 'text-white/40'}`}>{m.name}</span>
                                            </div>
                                            {selectedMeterId === m._id.toString() && <Check className="w-4 h-4 text-primary" />}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Havi várható fogyasztás</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0"
                            className="w-full bg-white/5 border border-white/5 rounded-[2rem] py-6 px-8 text-white font-black text-3xl focus:outline-none focus:border-primary/50 transition-colors"
                        />
                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 font-black text-lg uppercase tracking-widest pointer-events-none">
                            {selectedMeter?.unit}
                        </span>
                    </div>
                </div>

                <motion.div variants={itemVariants} className="bg-surface rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                            <Calculator className="w-5 h-5 text-primary" />
                        </div>
                        <span className="text-white/40 font-black uppercase tracking-widest text-[10px]">Számított havi költség</span>
                    </div>

                    <h2 className="text-6xl font-black tracking-tighter text-white italic">
                        {estimatedCost.toLocaleString("hu-HU")}
                        <span className="text-2xl ml-2 text-white/20 font-black uppercase">Ft</span>
                    </h2>

                    <div className="h-px w-full bg-white/5" />

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest text-outline">Rezsiár</span>
                            <span className="text-emerald-400 font-black text-sm">{selectedMeter?.basePrice} Ft / {selectedMeter?.unit}</span>
                        </div>
                        <div className="flex flex-col gap-1 bg-white/5 p-4 rounded-2xl border border-white/5 text-right">
                            <span className="text-white/20 text-[9px] font-black uppercase tracking-widest text-outline">Piaci ár</span>
                            <span className="text-primary font-black text-sm">{selectedMeter?.marketPrice} Ft / {selectedMeter?.unit}</span>
                        </div>
                    </div>

                    <div className="bg-blue-500/10 p-5 rounded-3xl border border-blue-500/10 flex items-start gap-4">
                        <Info className="w-5 h-5 text-blue-400 shrink-0" />
                        <p className="text-blue-400/60 text-[10px] font-bold leading-relaxed uppercase tracking-tight">
                            A számítás a saját beállításaidon alapul: {selectedMeter?.tierLimit} {selectedMeter?.unit} felett piaci áron számolunk.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}