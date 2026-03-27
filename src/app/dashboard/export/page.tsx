"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, FileText, FileSpreadsheet, Calendar, Check, Download, Loader2, ChevronDown, CheckCircle2, Zap, Flame, Droplets, ChevronRight } from "lucide-react";
import Link from "@/contexts/router.context";
import TimeRangeSheet from "@/components/TimeRangeSheet";
import { IMeter } from "@/models/meter.model"; // Cseréld a helyes útvonalra!
import { exportPDF } from "@/lib/pdf-export";
import { useHouse } from "@/contexts/house.context";
import { useUser } from "@/contexts/user.context";
import PremiumBadge from "@/components/PremiumBadge";
import { exportCsv } from "@/lib/csv-export";
import { useAction } from "@/providers/action.provider";
import { getMetersByHouseAction } from "@/app/actions/meter";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const EXPORT_OPTIONS = [
    { id: "meters", label: "Mérőóra állások és fogyasztás", isPro: false },
    { id: "costs", label: "Költségvetés és kiadások", isPro: true },
];

export default function ExportPageClient() {

    const { house } = useHouse();
    const { user } = useUser();
    // Állapotok
    const [format, setFormat] = useState<"pdf" | "csv">("pdf");
    const [selectedData, setSelectedData] = useState<string[]>(["meters"]);
    const [meters, setMeters] = useState<IMeter[]>([]);

    // Kinyertük az error és execute változókat is
    const { data, isPending, error, execute } = useAction(getMetersByHouseAction, {
        immediate: true,
        initialArgs: [house!._id],
        condition: !!house?._id,
        onSuccess: (result) => {
            setMeters((result.meters as IMeter[])
                .map(m => ({
                    _id: m._id.toString(),
                    name: m.name,
                    type: m.type,
                    unit: m.unit,
                    basePrice: m.basePrice,
                    marketPrice: m.marketPrice,
                    tierLimit: m.tierLimit || 0
                })) as unknown as IMeter[]);
            setSelectedMeters((result.meters as IMeter[]).map(m => m.name));
        }
    })

    // ÚJ ÁLLAPOT: Multi-select a mérőóráknak (Alapból az összes kiválasztva)
    const [selectedMeters, setSelectedMeters] = useState<string[]>([]);

    const [isExporting, setIsExporting] = useState(false);
    const [isFormatSelectOpen, setIsFormatSelectOpen] = useState(false);

    // Időszak választó állapotai
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [frequency, setFrequency] = useState("3m");
    const [customRange, setCustomRange] = useState<{ start: string; end: string } | undefined>(undefined);

    // Kategória kijelölése / törlése
    const toggleDataSelection = (id: string) => {
        setSelectedData(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    // Mérőóra kijelölése / törlése
    const toggleMeterSelection = (id: string) => {
        setSelectedMeters(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const getFrequencyLabel = () => {
        if (frequency === "custom" && customRange) {
            return `${customRange.start} - ${customRange.end}`;
        }
        switch (frequency) {
            case "3m": return "Utolsó 3 hónap";
            case "6m": return "Utolsó 6 hónap";
            case "1y": return "Utolsó 1 év";
            default: return "Válassz időszakot";
        }
    };

    const getMeterIcon = (type: string) => {
        switch (type) {
            case "villany": return <Zap className="w-5 h-5 text-yellow-500" />;
            case "gaz": return <Flame className="w-5 h-5 text-orange-500" />;
            case "viz": return <Droplets className="w-5 h-5 text-blue-500" />;
            default: return <Zap className="w-5 h-5 text-primary" />;
        }
    };

    const handleExport = () => {
        // Biztonsági ellenőrzés
        if (selectedData.length === 0) return;
        if (selectedData.includes("meters") && selectedMeters.length === 0) return;

        const month = {
            start: frequency === "custom" && customRange ? new Date(customRange.start).getMonth() : new Date().getMonth() - (frequency === "3m" ? 3 : frequency === "6m" ? 6 : 12) + 1,
            end: frequency === "custom" && customRange ? new Date(customRange.end).getMonth() : new Date().getMonth() + 1,
        }

        const year = {
            start: frequency === "custom" && customRange ? new Date(customRange.start).getFullYear() : new Date().getFullYear() - (frequency === "1y" ? 1 : 0),
            end: frequency === "custom" && customRange ? new Date(customRange.end).getFullYear() : new Date().getFullYear(),
        }

        setIsExporting(true);

        if (format === "csv") {
            exportCsv({
                house: house!,
                isPending: isExporting,
                setIsPending: setIsExporting,
                onReady: () => { },
                date: {
                    month: month,
                    year: year
                },
                containsOptions: {
                    isContainedMeterValue: selectedData.includes("meters"),
                    isContainedMeterDifference: selectedData.includes("meters"),
                    isContainedReadingDate: true,
                    isContainedPriceInfo: selectedData.includes("costs"),
                    containedMeterTypes: selectedMeters
                }
            })
        }
        else if (format === "pdf") {
            exportPDF({
                house: house!,
                isPending: isExporting,
                setIsPending: setIsExporting,
                onReady: () => { },
                date: {
                    month: month,
                    year: year
                },
                containsOptions: {
                    isContainedMeterValue: selectedData.includes("meters"),
                    isContainedMeterDifference: selectedData.includes("meters"),
                    isContainedReadingDate: true,
                    isContainedPriceInfo: selectedData.includes("costs"),
                    containedMeterTypes: selectedMeters
                }
            });
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" className="relative min-h-screen px-4 pt-12 pb-20 flex flex-col gap-8">

            {/* Fejléc */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link href="/dashboard" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic">Adat <span className="text-primary text-outline">Export</span></h1>
            </motion.header>

            <motion.div variants={itemVariants} className="relative flex flex-col gap-8 flex-1">

                {/* 1. EGYEDI SELECTOR A FORMÁTUMHOZ */}
                <div className="flex flex-col gap-2 ">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Választott Formátum</label>
                    <div className="relative">
                        <button
                            onClick={() => setIsFormatSelectOpen(!isFormatSelectOpen)}
                            className="w-full flex items-center justify-between bg-surface border border-white/5 rounded-[1.5rem] py-5 px-6 text-text-primary font-bold shadow-2xl transition-all active:scale-[0.98]"
                        >
                            <div className="flex items-center gap-3">
                                {format === "pdf" ? <FileText className="w-5 h-5 text-primary" /> : <FileSpreadsheet className="w-5 h-5 text-emerald-400" />}
                                <span className="italic">{format === "pdf" ? "PDF Dokumentum" : "CSV / Excel Táblázat"}</span>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-text-primary/20 transition-transform ${isFormatSelectOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isFormatSelectOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 5 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 bg-surface-elevated border border-white/10 rounded-[2rem] mt-2 overflow-hidden shadow-2xl z-[110] backdrop-blur-xl"
                                >
                                    <button
                                        onClick={() => { setFormat("pdf"); setIsFormatSelectOpen(false); }}
                                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors border-b border-white/5 text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-primary" />
                                            <span className={`text-sm font-bold ${format === "pdf" ? 'text-text-primary' : 'text-text-primary/40'}`}>PDF Dokumentum</span>
                                        </div>
                                        {format === "pdf" && <Check className="w-4 h-4 text-primary" />}
                                    </button>
                                    <button
                                        onClick={() => { setFormat("csv"); setIsFormatSelectOpen(false); }}
                                        className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                                            <span className={`text-sm font-bold ${format === "csv" ? 'text-text-primary' : 'text-text-primary/40'}`}>CSV / Excel Táblázat</span>
                                        </div>
                                        {format === "csv" && <Check className="w-4 h-4 text-emerald-400" />}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 2. IDŐSZAK VÁLASZTÓ */}
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Intervallum</label>
                    <button
                        onClick={() => setIsSheetOpen(true)}
                        className="w-full flex items-center justify-between bg-surface border border-white/5 rounded-[1.5rem] py-5 px-6 shadow-xl transition-all active:scale-[0.98]"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col text-left">
                                <span className="text-text-primary font-black text-sm tracking-tight italic">Időszak beállítása</span>
                                <span className="text-text-primary/40 text-[10px] uppercase tracking-widest font-bold mt-0.5">{getFrequencyLabel()}</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-text-primary/20" />
                    </button>
                </div>

                {/* 3. TARTALOM KIVÁLASZTÁSA */}
                <div className="flex flex-col gap-2 ">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Exportálandó Tartalom</label>
                    <div className="bg-surface rounded-[2.5rem] p-3 border border-white/5 shadow-2xl flex flex-col gap-1 relative overflow-hidden">
                        {EXPORT_OPTIONS.map((opt) => {
                            const isSelected = selectedData.includes(opt.id);
                            return (
                                <button
                                    key={opt.id}
                                    onClick={user?.subscriptionPlan === 'pro' || !opt.isPro ? () => toggleDataSelection(opt.id) : undefined}
                                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${isSelected ? "bg-white/5 border border-white/5" : "bg-transparent border border-transparent"
                                        }`}
                                >
                                    <span className={`font-bold text-sm tracking-tight flex items-center gap-1 ${isSelected ? "text-text-primary" : "text-text-primary/40"}`}>
                                        {opt.label} {opt.isPro && <PremiumBadge className="relative w-4 h-4" />}
                                    </span>
                                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-white/10"
                                        }`}>
                                        {isSelected && <CheckCircle2 className="w-4 h-4 text-text-primary" />}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 4. MÉRŐÓRÁK KIVÁLASZTÁSA */}
                <AnimatePresence>
                    {selectedData.includes("meters") && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginTop: -16 }}
                            animate={{ opacity: 1, height: "auto", marginTop: 0 }}
                            exit={{ opacity: 0, height: 0, marginTop: -16 }}
                            className="flex flex-col gap-2 overflow-hidden"
                        >
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Melyik Mérőórák?</label>
                            <div className="bg-surface rounded-[2.5rem] p-3 border border-white/5 shadow-2xl flex flex-col gap-1 relative min-h-[100px] justify-center">
                                <AnimatePresence mode="wait">
                                    {isPending ? (
                                        /* TÖLTÉS ÁLLAPOT */
                                        <motion.div
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center py-6 gap-3"
                                        >
                                            <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                            <p className="text-text-primary/30 text-[10px] font-bold uppercase tracking-widest">Órák keresése...</p>
                                        </motion.div>
                                    ) : error ? (
                                        /* HIBA ÁLLAPOT */
                                        <motion.div
                                            key="error"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col items-center justify-center py-4"
                                        >
                                            <p className="text-red-400 text-[11px] font-bold uppercase tracking-widest">Hiba a lekérésnél</p>
                                            <button onClick={() => execute(house!._id)} className="mt-2 text-primary text-[10px] font-black uppercase tracking-widest underline">Újra</button>
                                        </motion.div>
                                    ) : meters.length > 0 ? (
                                        /* ADATOK MEGJELENÍTÉSE */
                                        <motion.div
                                            key="content"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex flex-col gap-1"
                                        >
                                            {meters.map((meter) => {
                                                const isSelected = selectedMeters.includes(meter.name);
                                                return (
                                                    <button
                                                        key={meter._id.toString()}
                                                        onClick={() => toggleMeterSelection(meter.name)}
                                                        className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all active:scale-[0.98] ${isSelected ? "bg-white/5 border border-white/5" : "bg-transparent border border-transparent"}`}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/5" : "opacity-40"}`}>
                                                                {getMeterIcon(meter.type)}
                                                            </div>
                                                            <span className={`font-bold text-sm tracking-tight ${isSelected ? "text-text-primary" : "text-text-primary/40"}`}>
                                                                {meter.name}
                                                            </span>
                                                        </div>
                                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-white/10"}`}>
                                                            {isSelected && <CheckCircle2 className="w-4 h-4 text-text-primary" />}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </motion.div>
                                    ) : (
                                        /* ÜRES ÁLLAPOT */
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="p-6 flex items-center justify-center"
                                        >
                                            <span className="text-text-primary/40 text-xs font-bold uppercase tracking-widest text-center">Nincsenek elérhető mérőórák</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

            </motion.div>

            {/* Generálás Gomb */}
            <motion.div variants={itemVariants} className="mt-auto pt-6 z-10">
                <button
                    onClick={handleExport}
                    disabled={isExporting || selectedData.length === 0 || (selectedData.includes("meters") && selectedMeters.length === 0)}
                    className="w-full py-6 bg-white text-black rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-[0_10px_40px_rgba(255,255,255,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                >
                    {isExporting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Generálás...
                        </>
                    ) : (
                        <>
                            <Download className="w-5 h-5" />
                            Dokumentum Letöltése
                        </>
                    )}
                </button>
            </motion.div>

            <TimeRangeSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                selectedFrequency={frequency}
                onSelect={(freq, dates) => {
                    setFrequency(freq);
                    if (dates) setCustomRange(dates);
                }}
            />
        </motion.div>
    );
}