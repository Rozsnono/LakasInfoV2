"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Camera,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Zap,
    Flame,
    Droplets,
    Check,
    Sparkles,
    Loader2,
    Clock,
    Image as ImageIcon,
    Gem
} from "lucide-react";
import { useHouse } from "@/contexts/house.context";
import { recordReadingAction, getMetersForHouseAction, analyzeMeterPhotoAction } from "@/app/actions/meter";
import WebCameraScanner from "./CameraScanner";
import { useUser } from "@/contexts/user.context";

interface NewReadingSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: { y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
    exit: { y: "100%", transition: { duration: 0.3 } },
};

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const getMeterVisuals = (type: string) => {
    switch (type) {
        case "villany": return { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" };
        case "gaz": return { icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" };
        case "viz": return { icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" };
        default: return { icon: Zap, color: "text-gray-500", bg: "bg-gray-500/10" };
    }
};

interface SimplifiedMeter {
    id: string;
    name: string;
    type: string;
    unit: string;
}

export default function NewReadingSheet({ isOpen, onClose }: NewReadingSheetProps) {
    const { house } = useHouse();
    const { user } = useUser();
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const [isWebcamOpen, setIsWebcamOpen] = useState(false);
    const [step, setStep] = useState<"main" | "date">("main");
    const [pickerView, setPickerView] = useState<"date" | "time">("date");
    const [meters, setMeters] = useState<SimplifiedMeter[]>([]);
    const [selectedMeterId, setSelectedMeterId] = useState<string>("");
    const [value, setValue] = useState("");
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [tempDate, setTempDate] = useState(new Date());
    const [isLoadingMeters, setIsLoadingMeters] = useState(false);
    const [isScanningAI, setIsScanningAI] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const activeMeter = meters.find((m) => m.id === selectedMeterId) || null;
    const visuals = activeMeter ? getMeterVisuals(activeMeter.type) : null;

    useEffect(() => {
        if (isOpen && house) {
            const fetchMeters = async () => {
                setIsLoadingMeters(true);
                setError(null);
                const result = await getMetersForHouseAction(house._id);
                if (result.success && result.meters) {
                    setMeters(result.meters);
                    if (result.meters.length > 0) setSelectedMeterId(result.meters[0].id);
                } else {
                    setError("Nem sikerült lekérni a mérőórákat.");
                }
                setIsLoadingMeters(false);
            };
            fetchMeters();
        } else if (!isOpen) {
            setValue("");
            setSelectedDate(new Date());
            setStep("main");
            setError(null);
            setIsWebcamOpen(false);
        }
    }, [isOpen, house]);

    const processImage = async (imageSource: string | File) => {
        setIsScanningAI(true);
        setError(null);
        setIsWebcamOpen(false);

        let base64 = "";
        if (typeof imageSource === "string") {
            base64 = imageSource;
        } else {
            const reader = new FileReader();
            base64 = await new Promise((resolve) => {
                reader.readAsDataURL(imageSource);
                reader.onloadend = () => resolve(reader.result as string);
            });
        }

        try {
            const aiResult = await analyzeMeterPhotoAction(base64);
            if (aiResult.success) {
                setValue(aiResult.value!.toString());
                setPhotoUrl(base64);
            } else {
                setError(aiResult.error || "Hiba az AI leolvasásnál.");
            }
        } catch (err) {
            setError("Váratlan hiba történt.");
        } finally {
            setIsScanningAI(false);
        }
    };

    const handleSave = async () => {
        if (!selectedMeterId || !value) return;
        setIsSaving(true);
        const result = await recordReadingAction(selectedMeterId, Number(value), photoUrl, selectedDate.toISOString());
        if (result.success) onClose();
        else setError(result.error || "Hiba a mentésnél.");
        setIsSaving(false);
    };

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => (new Date(year, month, 1).getDay() + 6) % 7;
    const updateTempDate = (updates: Partial<{ month: number; day: number; hour: number; minute: number }>) => {
        const newDate = new Date(tempDate);
        if (updates.month !== undefined) newDate.setMonth(updates.month);
        if (updates.day !== undefined) newDate.setDate(updates.day);
        if (updates.hour !== undefined) newDate.setHours(updates.hour);
        if (updates.minute !== undefined) newDate.setMinutes(updates.minute);
        setTempDate(newDate);
    };

    return (
        <AnimatePresence>
            {isWebcamOpen && (
                <WebCameraScanner
                    key="web-camera-scanner"
                    onCapture={(base64) => processImage(base64)}
                    onClose={() => setIsWebcamOpen(false)}
                />
            )}

            {isOpen && (
                <Fragment key="reading-sheet-wrapper">
                    <motion.div
                        key="reading-sheet-overlay"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={onClose}
                        className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        key="reading-sheet-container"
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <AnimatePresence mode="wait">
                            {step === "main" ? (
                                <motion.div
                                    key="main-step-content"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col flex-1"
                                >
                                    <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"><ChevronLeft className="w-6 h-6 text-text-primary" /></button>
                                        <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Új <span className="text-primary">Óraállás</span></h3>
                                        <div className="w-10" />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-6 px-2 scrollbar-hide pb-20">
                                        <input type="file" accept="image/*" ref={galleryInputRef} onChange={(e) => e.target.files?.[0] && processImage(e.target.files[0])} className="hidden" />

                                        <div className="space-y-3">
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onClick={(user?.subscriptionPlan === "pro" || user?.subscriptionPlan === "enterprise") ? () => setIsWebcamOpen(true) : () => setError("A mérőóra állás leolvasásához Pro előfizetés szükséges!")}
                                                className="w-full p-6 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/20 rounded-[2.5rem] flex items-center gap-5 relative overflow-hidden group relative"
                                            >
                                                <div className="absolute top-0 right-0 p-4 opacity-10 group-active:scale-110 transition-transform"><Sparkles className="w-12 h-12 text-indigo-400" /></div>
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg">
                                                    {isScanningAI ? <Loader2 className="animate-spin text-text-primary w-6 h-6" /> : <Camera className="text-text-primary w-6 h-6" />}
                                                </div>
                                                <div className="flex flex-col text-left">
                                                    <span className="text-text-primary font-black text-[17px] tracking-tight italic uppercase">Fotózás és AI</span>
                                                    <span className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest italic tracking-wider">Mérőóra beolvasása</span>
                                                </div>
                                                {
                                                    user?.subscriptionPlan !== "pro" && (
                                                        <motion.div className="absolute top-4 right-4">
                                                            <Gem className="text-yellow-500/50 h-6 w-6"></Gem>
                                                        </motion.div>
                                                    )
                                                }
                                            </motion.button>
                                        </div>

                                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</div>}

                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Mérőóra</label>
                                            <div className="relative z-[60]">
                                                <button onClick={() => setIsSelectOpen(!isSelectOpen)} disabled={isLoadingMeters || meters.length === 0} className="w-full flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-text-primary font-bold transition-all active:scale-[0.98] disabled:opacity-50">
                                                    <div className="flex items-center gap-3">
                                                        {isLoadingMeters ? <Loader2 className="w-4 h-4 animate-spin opacity-50" /> : visuals && activeMeter ? <><visuals.icon className={`w-4 h-4 ${visuals.color}`} /><span className="truncate">{activeMeter.name}</span></> : <span className="opacity-40 text-sm">Nincs mérőóra</span>}
                                                    </div>
                                                    <ChevronDown className={`w-4 h-4 text-text-primary/20 transition-transform duration-300 ${isSelectOpen ? "rotate-180" : ""}`} />
                                                </button>
                                                <AnimatePresence>{isSelectOpen && (
                                                    <motion.div
                                                        key="meter-select-dropdown"
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 4 }}
                                                        exit={{ opacity: 0, y: 10 }}
                                                        className="absolute top-full left-0 right-0 bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[70] backdrop-blur-xl"
                                                    >
                                                        {meters.map((m) => {
                                                            const vis = getMeterVisuals(m.type);
                                                            return (
                                                                <button key={m.id} onClick={() => { setSelectedMeterId(m.id); setIsSelectOpen(false); }} className={`w-full flex items-center justify-between p-5 transition-colors ${selectedMeterId === m.id ? "bg-white/10" : "hover:bg-white/5"}`}><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl ${vis.bg} flex items-center justify-center`}><vis.icon className={`w-5 h-5 ${vis.color}`} /></div><span className="text-sm font-bold text-text-primary">{m.name}</span></div>{selectedMeterId === m.id && <Check className="w-4 h-4 text-primary" />}</button>
                                                            );
                                                        })}
                                                    </motion.div>
                                                )}</AnimatePresence>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Időpont</label>
                                                <button onClick={() => { setTempDate(new Date(selectedDate)); setStep("date"); }} className="w-full flex items-center h-15 justify-between bg-white/5 border border-white/5 rounded-2xl py-4 px-4 text-text-primary font-bold active:scale-[0.98]">
                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                        <Clock className="w-4 h-4 text-primary shrink-0" />
                                                        <span className="text-[11px] truncate">{selectedDate.toLocaleDateString('hu-HU', { month: 'short', day: 'numeric' })} {selectedDate.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </button>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Állás ({activeMeter?.unit})</label>
                                                <div className="relative">
                                                    <input type="number" value={value} onChange={(e) => setValue(e.target.value)} placeholder="0" className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-5 text-text-primary font-black text-xl focus:outline-none focus:border-primary/50 transition-colors" />
                                                </div>
                                            </div>
                                        </div>

                                        <button onClick={handleSave} disabled={!value || isSaving || meters.length === 0} className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center">
                                            {isSaving ? <Loader2 className="animate-spin" /> : "Rögzítés mentése"}
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="date-step-content"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="flex flex-col flex-1 px-2"
                                >
                                    <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                                        <button onClick={() => setStep("main")} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"><ChevronLeft className="w-6 h-6 text-text-primary" /></button>
                                        <h3 className="text-xl font-black text-text-primary uppercase italic">Időpont</h3>
                                        <div className="w-10" />
                                    </div>

                                    <div className="flex bg-white/5 p-1 rounded-2xl mb-8 self-center">
                                        <button onClick={() => setPickerView("date")} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pickerView === "date" ? "bg-white text-black" : "text-text-primary/40"}`}>Dátum</button>
                                        <button onClick={() => setPickerView("time")} className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${pickerView === "time" ? "bg-white text-black" : "text-text-primary/40"}`}>Idő</button>
                                    </div>

                                    <div className="flex-1 min-h-[320px]">
                                        {pickerView === "date" ? (
                                            <div className="flex flex-col gap-6">
                                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-2xl">
                                                    <button onClick={() => updateTempDate({ month: tempDate.getMonth() - 1 })} className="p-2 text-text-primary/40"><ChevronLeft size={20} /></button>
                                                    <span className="text-text-primary font-black uppercase tracking-widest text-xs">{new Intl.DateTimeFormat("hu-HU", { month: "long", year: "numeric" }).format(tempDate)}</span>
                                                    <button onClick={() => updateTempDate({ month: tempDate.getMonth() + 1 })} className="p-2 text-text-primary/40"><ChevronRight size={20} /></button>
                                                </div>
                                                <div className="grid grid-cols-7 gap-1 justify-items-center">
                                                    {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((day) => (<div key={day} className="text-[10px] font-black text-text-primary/20 text-center mb-2 uppercase">{day}</div>))}
                                                    {Array.from({ length: firstDayOfMonth(tempDate.getFullYear(), tempDate.getMonth()) }).map((_, i) => <div key={`e-${i}`} className="h-10 w-10" />)}
                                                    {Array.from({ length: daysInMonth(tempDate.getFullYear(), tempDate.getMonth()) }).map((_, i) => {
                                                        const d = i + 1;
                                                        const isSelected = tempDate.getDate() === d;
                                                        return (
                                                            <button key={`day-${d}`} onClick={() => updateTempDate({ day: d })} className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-black transition-all ${isSelected ? "bg-primary text-text-primary scale-110 shadow-lg" : "text-text-primary/40 hover:bg-white/5"}`}>{d}</button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-8 gap-8">
                                                <div className="flex items-center gap-6">
                                                    <input type="number" value={tempDate.getHours().toString().padStart(2, '0')} onChange={(e) => updateTempDate({ hour: parseInt(e.target.value) || 0 })} className="w-24 bg-white/5 border border-white/5 rounded-[2rem] py-8 text-center text-5xl font-black text-text-primary focus:outline-none focus:border-primary/50" />
                                                    <span className="text-4xl font-black text-text-primary/10">:</span>
                                                    <input type="number" value={tempDate.getMinutes().toString().padStart(2, '0')} onChange={(e) => updateTempDate({ minute: parseInt(e.target.value) || 0 })} className="w-24 bg-white/5 border border-white/5 rounded-[2rem] py-8 text-center text-5xl font-black text-text-primary focus:outline-none focus:border-primary/50" />
                                                </div>
                                                <span className="text-[10px] font-black text-text-primary/20 uppercase tracking-[0.5em]">Óra : Perc</span>
                                            </div>
                                        )}
                                    </div>

                                    <button onClick={() => { setSelectedDate(new Date(tempDate)); setStep("main"); }} className="w-full mt-8 py-6 bg-white text-background rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all shadow-xl">Időpont jóváhagyása</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </Fragment>
            )}
        </AnimatePresence>
    );
}