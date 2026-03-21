"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Camera, Zap, Flame, Droplets, ArrowRight, Clock, ChevronLeft, ChevronRight } from "lucide-react";

interface AddReadingSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const METERS = [
    { id: "m1", type: "electricity", name: "Villanyóra", unit: "kWh", color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Zap },
    { id: "m2", type: "gas", name: "Gázóra", unit: "m³", color: "text-orange-500", bg: "bg-orange-500/10", icon: Flame },
    { id: "m3", type: "water", name: "Vízóra", unit: "m³", color: "text-blue-500", bg: "bg-blue-500/10", icon: Droplets },
] as const;

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

export default function AddReadingSheet({ isOpen, onClose }: AddReadingSheetProps) {
    const [step, setStep] = useState<"meter" | "value" | "date">("meter");
    const [selectedMeter, setSelectedMeter] = useState<typeof METERS[number] | null>(null);
    const [value, setValue] = useState("");
    const [photo, setPhoto] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [pickerView, setPickerView] = useState<"date" | "time">("date");
    const [tempDate, setTempDate] = useState(new Date());

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => (new Date(year, month, 1).getDay() + 6) % 7;

    const handleKeypad = (val: string) => {
        if (val === "back") setValue((prev) => prev.slice(0, -1));
        else if (val === ".") {
            if (!value.includes(".") && value.length > 0) setValue((prev) => prev + ".");
        } else if (value.length < 10) setValue((prev) => prev + val);
    };

    const updateTempDate = (updates: Partial<{ year: number; month: number; day: number; hour: number; minute: number }>) => {
        const newDate = new Date(tempDate);
        if (updates.year !== undefined) newDate.setFullYear(updates.year);
        if (updates.month !== undefined) newDate.setMonth(updates.month);
        if (updates.day !== undefined) newDate.setDate(updates.day);
        if (updates.hour !== undefined) newDate.setHours(updates.hour);
        if (updates.minute !== undefined) newDate.setMinutes(updates.minute);
        setTempDate(newDate);
    };

    const handleDateConfirm = () => {
        setSelectedDate(new Date(tempDate));
        setStep("value");
    };

    const resetAndClose = () => {
        setStep("meter");
        setSelectedMeter(null);
        setValue("");
        setPhoto(false);
        onClose();
    };

    const renderMeterStep = () => (
        <motion.div key="meter" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-3 px-2">
            {METERS.map((m) => (
                <button
                    key={m.id}
                    onClick={() => { setSelectedMeter(m); setStep("value"); }}
                    className="flex items-center justify-between p-6 rounded-[2.5rem] bg-white/5 border border-white/5 active:bg-white/10 transition-all group"
                >
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${m.bg}`}>
                            <m.icon className={`w-7 h-7 ${m.color}`} />
                        </div>
                        <span className="font-black text-xl text-white">{m.name}</span>
                    </div>
                    <ArrowRight className="w-6 h-6 text-white opacity-20 group-hover:opacity-100 transition-opacity" />
                </button>
            ))}
        </motion.div>
    );

    const renderValueStep = () => (
        <motion.div key="value" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col gap-6 px-2">
            <div className=" rounded-[3rem] py-12 px-6 flex flex-col items-center border border-white/5 shadow-inner">
                <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black tracking-tighter text-white">{value || "0"}</span>
                    <span className="text-2xl font-black text-white/20 uppercase">{selectedMeter?.unit}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setPhoto(!photo)} className={`flex items-center gap-4 px-6 py-5 rounded-3xl border transition-all ${photo ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'}`}>
                    <Camera className={`w-5 h-5 ${photo ? 'text-primary' : 'text-white/40'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${photo ? 'text-primary' : 'text-white/40'}`}>{photo ? "Fotó kész" : "Fotó"}</span>
                </button>
                <button onClick={() => { setTempDate(new Date(selectedDate)); setStep("date"); }} className="flex items-center gap-4 px-6 py-5 rounded-3xl border border-white/10 bg-white/5 active:bg-white/10">
                    <Clock className="w-5 h-5 text-primary" />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-black text-white uppercase tracking-tight">{selectedDate.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[9px] font-bold text-white/40 uppercase">{selectedDate.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "back"].map((key) => (
                    <button key={key} onClick={() => handleKeypad(key)} className="h-16 rounded-2xl bg-white/5 flex items-center justify-center text-xl font-black text-white active:bg-primary transition-all">
                        {key === "back" ? <ChevronLeft className="w-6 h-6" /> : key}
                    </button>
                ))}
            </div>
            <button disabled={!value} onClick={resetAndClose} className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-lg uppercase tracking-[0.2em] shadow-xl active:scale-95 disabled:opacity-20 transition-all mt-2">Mentés</button>
        </motion.div>
    );

    const renderDateStep = () => {
        const year = tempDate.getFullYear();
        const month = tempDate.getMonth();
        const totalDays = daysInMonth(year, month);
        const startOffset = firstDayOfMonth(year, month);
        const days = [];
        for (let i = 0; i < startOffset; i += 1) days.push(<div key={`empty-${i}`} className="h-10 w-10" />);
        for (let d = 1; d <= totalDays; (d as number) += 1) {
            const isSelected = tempDate.getDate() === d && tempDate.getMonth() === month;
            days.push(
                <button
                    key={d}
                    onClick={() => updateTempDate({ day: d })}
                    className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${isSelected ? "bg-primary text-white scale-110" : "text-white/40 hover:bg-white/5"}`}
                >
                    {d}
                </button>
            );
        }

        return (
            <motion.div key="date" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="flex flex-col px-2">
                <div className="flex bg-white/5 p-1 rounded-2xl mb-8 self-center">
                    <button onClick={() => setPickerView("date")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pickerView === "date" ? "bg-white text-black" : "text-white/40"}`}>Dátum</button>
                    <button onClick={() => setPickerView("time")} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pickerView === "time" ? "bg-white text-black" : "text-white/40"}`}>Idő</button>
                </div>
                <div className="min-h-[300px]">
                    {pickerView === "date" ? (
                        <div className="flex flex-col gap-6">
                            <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl">
                                <button onClick={() => updateTempDate({ month: month - 1 })} className="p-2 text-white/40"><ChevronLeft size={20} /></button>
                                <span className="text-white font-black uppercase tracking-widest text-xs">{new Intl.DateTimeFormat("hu-HU", { month: "long", year: "numeric" }).format(tempDate)}</span>
                                <button onClick={() => updateTempDate({ month: month + 1 })} className="p-2 text-white/40"><ChevronRight size={20} /></button>
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((day) => (
                                    <div key={day} className="text-[10px] font-black text-white/20 text-center mb-2 uppercase">{day}</div>
                                ))}
                                {days}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center pt-8 gap-8">
                            <div className="flex items-center gap-6">
                                <input type="number" value={tempDate.getHours().toString().padStart(2, '0')} onChange={(e) => updateTempDate({ hour: Math.min(23, Math.max(0, parseInt(e.target.value, 10) || 0)) })} className="w-24 bg-white/5 border border-white/5 rounded-[2rem] py-8 text-center text-5xl font-black text-white focus:outline-none focus:border-primary/50" />
                                <span className="text-4xl font-black text-white/10">:</span>
                                <input type="number" value={tempDate.getMinutes().toString().padStart(2, '0')} onChange={(e) => updateTempDate({ minute: Math.min(59, Math.max(0, parseInt(e.target.value, 10) || 0)) })} className="w-24 bg-white/5 border border-white/5 rounded-[2rem] py-8 text-center text-5xl font-black text-white focus:outline-none focus:border-primary/50" />
                            </div>
                            <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Óra : Perc</span>
                        </div>
                    )}
                </div>
                <button onClick={handleDateConfirm} className="w-full mt-8 py-6 bg-white text-background rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Időpont rögzítése</button>
            </motion.div>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={resetAndClose} className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150]" />
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
                                onClick={step === "meter" ? resetAndClose : () => setStep(step === "date" ? "value" : "meter")}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                {step === "meter" ? <X className="w-5 h-5 text-white" /> : <ChevronLeft className="w-6 h-6 text-white" />}
                            </button>
                            <h3 className="text-xl font-black tracking-tight text-white uppercase">
                                {step === "meter" ? "Mérőóra" : step === "value" ? "Mérés" : "Időpont"}
                            </h3>
                            <div className="w-10" />
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <AnimatePresence mode="wait">
                                {step === "meter" ? renderMeterStep() : step === "value" ? renderValueStep() : renderDateStep()}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}