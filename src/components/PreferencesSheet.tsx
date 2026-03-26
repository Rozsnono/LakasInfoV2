"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Calendar, Check, ChevronRight, ChevronLeft } from "lucide-react";

interface PreferencesSheetProps {
    isOpen: boolean;
    onClose: () => void;
    selectedFrequency: string;
    onSelect: (freq: string, customDates?: { start: string; end: string }) => void;
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

export default function PreferencesSheet({ isOpen, onClose, selectedFrequency, onSelect }: PreferencesSheetProps) {
    const [showCustom, setShowCustom] = useState(selectedFrequency === "custom");
    const [currentStep, setCurrentStep] = useState<"start" | "end">("start");
    const [startData, setStartData] = useState({ year: 2026, month: 2 });
    const [endData, setEndData] = useState({ year: 2026, month: 5 });

    const months = ["Jan", "Feb", "Már", "Ápr", "Máj", "Jún", "Júl", "Aug", "Szep", "Okt", "Nov", "Dec"];
    const options = [
        { id: "month", label: "Ebben a hónapban", sub: "2026. Március" },
        { id: "quarter", label: "Ebben a negyedévben", sub: "2026. Q1 (Jan - Már)" },
        { id: "year", label: "Ebben az évben", sub: "2026 teljes év" },
    ];

    const getAbs = (y: number, m: number) => y * 12 + m;
    const startAbs = getAbs(startData.year, startData.month);
    const endAbs = getAbs(endData.year, endData.month);
    const rangeMin = Math.min(startAbs, endAbs);
    const rangeMax = Math.max(startAbs, endAbs);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                            <button
                                onClick={showCustom ? () => setShowCustom(false) : onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                {showCustom ? <ChevronLeft className="w-6 h-6 text-text-primary" /> : <X className="w-5 h-5 text-text-primary" />}
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-text-primary uppercase">Időszak</h3>
                            <div className="w-10" />
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 px-2 scrollbar-hide pb-10">
                            {!showCustom && (
                                <div className="space-y-3">
                                    {options.map((opt) => (
                                        <motion.button
                                            key={opt.id}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                onSelect(opt.id);
                                                onClose();
                                            }}
                                            className={`w-full flex items-center justify-between p-6 rounded-[2.5rem] border transition-all active:bg-white/10 ${selectedFrequency === opt.id ? "bg-primary/10 border-primary/20" : "bg-white/5 border-white/5"
                                                }`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner ${selectedFrequency === opt.id ? "bg-primary text-text-primary" : "bg-surface-elevated text-text-primary/40"
                                                    }`}>
                                                    <Calendar className="w-6 h-6" />
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-text-primary font-black text-[17px] tracking-tight">{opt.label}</span>
                                                    <span className="text-text-primary/30 text-[11px] font-bold uppercase tracking-wider mt-1">{opt.sub}</span>
                                                </div>
                                            </div>
                                            {selectedFrequency === opt.id && <Check className="w-5 h-5 text-primary" />}
                                        </motion.button>
                                    ))}

                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setShowCustom(true)}
                                        className="w-full flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/5 active:bg-white/10"
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center shrink-0 border border-white/5 text-text-primary/40">
                                                <Calendar className="w-6 h-6" />
                                            </div>
                                            <div className="flex flex-col text-left">
                                                <span className="text-text-primary font-black text-[17px] tracking-tight">Egyedi hónapok</span>
                                                <span className="text-text-primary/30 text-[11px] font-bold uppercase tracking-wider mt-1">Intervallum választás</span>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-text-primary/20" />
                                    </motion.button>
                                </div>
                            )}

                            <AnimatePresence mode="wait">
                                {showCustom && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-8"
                                    >
                                        <div className="flex bg-white/5 p-1 rounded-2xl self-center max-w-[240px] mx-auto">
                                            <button
                                                onClick={() => setCurrentStep("start")}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === "start" ? "bg-white text-black" : "text-text-primary/40"
                                                    }`}
                                            >
                                                Ettől
                                            </button>
                                            <button
                                                onClick={() => setCurrentStep("end")}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${currentStep === "end" ? "bg-white text-black" : "text-text-primary/40"
                                                    }`}
                                            >
                                                Eddig
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between px-4">
                                            <button
                                                onClick={() => {
                                                    if (currentStep === "start") setStartData((p) => ({ ...p, year: p.year - 1 }));
                                                    else setEndData((p) => ({ ...p, year: p.year - 1 }));
                                                }}
                                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                                            </button>
                                            <span className="text-4xl font-black text-text-primary tracking-tighter">
                                                {currentStep === "start" ? startData.year : endData.year}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    if (currentStep === "start") setStartData((p) => ({ ...p, year: p.year + 1 }));
                                                    else setEndData((p) => ({ ...p, year: p.year + 1 }));
                                                }}
                                                className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                                            >
                                                <ChevronRight className="w-6 h-6 text-text-primary" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 gap-3 px-2">
                                            {months.map((m, i) => {
                                                const currentYear = currentStep === "start" ? startData.year : endData.year;
                                                const currentAbs = getAbs(currentYear, i);
                                                const isEnd = currentAbs === endAbs;
                                                const isStart = currentAbs === startAbs;
                                                const isInRange = currentAbs > rangeMin && currentAbs < rangeMax;

                                                return (
                                                    <button
                                                        key={m}
                                                        onClick={() => {
                                                            if (currentStep === "start") {
                                                                setStartData((p) => ({ ...p, month: i }));
                                                                setCurrentStep("end");
                                                            } else {
                                                                setEndData((p) => ({ ...p, month: i }));
                                                            }
                                                        }}
                                                        className={`py-6 rounded-3xl font-black text-sm transition-all active:scale-95 ${isStart || isEnd
                                                                ? "bg-primary text-text-primary shadow-xl shadow-primary/20"
                                                                : isInRange
                                                                    ? "bg-primary/20 text-primary border border-primary/10"
                                                                    : "bg-white/5 text-text-primary/40 border border-white/5"
                                                            }`}
                                                    >
                                                        {m}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        <button
                                            onClick={() => {
                                                onSelect("custom", {
                                                    start: `${startData.year}.${(startData.month + 1).toString().padStart(2, "0")}`,
                                                    end: `${endData.year}.${(endData.month + 1).toString().padStart(2, "0")}`,
                                                });
                                                onClose();
                                            }}
                                            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform"
                                        >
                                            Alkalmazás
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}