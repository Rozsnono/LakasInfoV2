"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, Save, Gauge, ChevronDown, Layers,
    BellRing, Trash2, Check, Zap, Flame, Droplets, Loader2, Info, Archive
} from "lucide-react";
import Link from "@/contexts/router.context";
import { useParams, useSearchParams } from "next/navigation";
import { getMeterByIdAction, updateMeterAction, deleteMeterAction } from "@/app/actions/meter";
import { redirect } from "next/navigation";
import { useUser } from "@/contexts/user.context";
import PremiumBadge from "@/components/PremiumBadge";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const METER_TYPES = [
    { id: "villany", label: "Villanyóra", unit: "kWh", icon: Zap, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { id: "gaz", label: "Gázóra", unit: "m³", icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    { id: "viz", label: "Vízóra", unit: "m³", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
];

export default function EditMeterPage() {
    const params = useParams();
    const { user } = useUser();
    const searchParams = useSearchParams();
    const alertSectionRef = useRef<HTMLDivElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [meterName, setMeterName] = useState("");
    const [meterType, setMeterType] = useState("villany");
    const [isTiered, setIsTiered] = useState(false);
    const [isSelectOpen, setIsSelectOpen] = useState(false);
    const [hasAlert, setHasAlert] = useState<boolean>(false);
    const [alertLimit, setAlertLimit] = useState("");
    const [tierLimit, setTierLimit] = useState("");
    const [priceTier1, setPriceTier1] = useState("");
    const [priceTier2, setPriceTier2] = useState("");
    const [highlightAlert, setHighlightAlert] = useState(false);

    // ÚJ: Archivált (inaktív) állapot
    const [isArchived, setIsArchived] = useState(false);

    const selectedType = METER_TYPES.find((t) => t.id === meterType) || METER_TYPES[0];
    const unit = selectedType.unit;

    useEffect(() => {
        async function loadMeterData() {
            if (!params.id) return;
            const res = await getMeterByIdAction(params.id as string);

            if (res.success && res.meter) {
                const m = res.meter;
                setMeterName(m.name);
                setMeterType(m.type);
                setIsTiered(m.isTiered);
                setTierLimit(m.tierLimit?.toString() || "");
                setPriceTier1(m.isTiered ? m.basePrice?.toString() : m.flatPrice?.toString() || "");
                setPriceTier2(m.marketPrice?.toString() || "");
                setAlertLimit(m.alertLimit?.toString() || "");
                setHasAlert(!!m.alertLimit);

                // Feltételezzük, hogy az adatbázisban "isActive" (vagy isArchived) mezőként van tárolva.
                // Ha az isActive false, akkor az óra archivált.
                setIsArchived(m.isActive === false);
            }
            setIsLoading(false);
        }
        loadMeterData();
    }, [params.id]);

    useEffect(() => {
        if (!isLoading && searchParams.get("focus") === "alert") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasAlert(true);
            setTimeout(() => {
                alertSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                setHighlightAlert(true);
                setTimeout(() => setHighlightAlert(false), 2000);
            }, 400);
        }
    }, [isLoading, searchParams]);

    const handleSave = async () => {
        setIsSaving(true);
        const res = await updateMeterAction(params.id as string, {
            name: meterName,
            type: meterType,
            isTiered,
            tierLimit,
            hasAlert,
            alertLimit,
            priceTier1,
            priceTier2,
            isArchived: isArchived
        });

        if (res.success) {
            redirect(`/dashboard/meters/${params.id}`);
        } else {
            alert("Hiba történt a mentés során.");
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Biztosan törlöd? Minden adat elveszik!")) return;
        setIsDeleting(true);
        const res = await deleteMeterAction(params.id as string);
        if (res.success) redirect("/dashboard");
        else setIsDeleting(false);
    };

    if (isLoading) return <div className="min-h-screen  flex items-center justify-center"><Loader2 className="w-10 h-10 text-primary animate-spin" /></div>;

    return (
        <motion.div initial="hidden" animate="visible" variants={containerVariants} className="relative min-h-screen  px-4 pt-12 pb-12 flex flex-col gap-6 overflow-x-hidden">

            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link href={`/dashboard/meters/${params.id}`} className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl">
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <div className="flex flex-col">
                    <h1 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Beállít<span className="text-primary">ások</span></h1>
                    <span className="text-[10px] font-black text-text-primary/40 uppercase tracking-widest">{meterName}</span>
                </div>
            </motion.header>

            {/* NÉV */}
            <motion.div variants={itemVariants} className="relative z-10 flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4 italic">Mérőóra neve</label>
                <div className="relative">
                    <Gauge className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                    <input type="text" value={meterName} onChange={(e) => setMeterName(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50" />
                </div>
            </motion.div>

            {/* TÍPUS */}
            <motion.div variants={itemVariants} className="relative z-[60] flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4 italic">Típus</label>
                <div className="relative">
                    <button onClick={() => setIsSelectOpen(!isSelectOpen)} className="w-full flex items-center justify-between bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-text-primary font-bold transition-all active:scale-[0.98]">
                        <div className="flex items-center gap-3">
                            <selectedType.icon className={`w-4 h-4 ${selectedType.color}`} />
                            <span>{selectedType.label}</span>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-text-primary/20 transition-transform duration-300 ${isSelectOpen ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                        {isSelectOpen && (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 4 }} exit={{ opacity: 0, y: 10 }} className="absolute top-full left-0 right-0 bg-surface-elevated border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[70] backdrop-blur-xl">
                                {METER_TYPES.map((type) => (
                                    <button key={type.id} onClick={() => { setMeterType(type.id as unknown as string); setIsSelectOpen(false); }} className={`w-full flex items-center justify-between p-5 transition-colors ${meterType === type.id ? "bg-white/10" : "hover:bg-white/5"}`}><div className="flex items-center gap-4"><div className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center`}><type.icon className={`w-5 h-5 ${type.color}`} /></div><span className="text-sm font-bold text-text-primary">{type.label}</span></div>{meterType === type.id && <Check className="w-4 h-4 text-primary" />}</button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* ÁRAZÁS SZEKCIÓ */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-lg relative">
                    <PremiumBadge className="w-4 h-4 top-4 right-4" />
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-white/5"><Layers className="w-6 h-6 text-text-primary" /></div>
                        <div className="flex flex-col"><span className="text-text-primary font-bold text-[15px] tracking-tight">Sávos árazás</span><span className="text-text-primary/40 text-[10px] font-black uppercase tracking-widest mt-0.5 italic">Rezsicsökkentett keret</span></div>
                    </div>
                    <button onClick={user?.subscriptionPlan == 'pro' ? () => setIsTiered(!isTiered) : undefined} className={`w-12 h-7 rounded-full transition-colors relative ${isTiered ? 'bg-primary' : 'bg-white/10'}`}><motion.div animate={{ x: isTiered ? 24 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" /></button>
                </div>

                <AnimatePresence>
                    <motion.div className="space-y-4 px-1">
                        {/* Ha SÁVOS, akkor kell a LIMIT mező */}
                        {isTiered && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-primary/60 ml-4 italic flex items-center gap-2">
                                    Kedvezményes keret <Info size={10} />
                                </label>
                                <div className="relative">
                                    <input type="number" value={tierLimit} onChange={(e) => setTierLimit(e.target.value)} placeholder="pl. 210" className="w-full bg-primary/5 border border-primary/20 rounded-2xl py-4 px-6 text-text-primary font-black text-xl focus:outline-none focus:border-primary/50" />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-text-primary/20 uppercase tracking-widest">{unit} / hó</span>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400/40 ml-4 italic">{isTiered ? 'Kedvezményes ár' : 'Egységár'}</label>
                                <div className="relative">
                                    <input type="number" value={priceTier1} onChange={(e) => setPriceTier1(e.target.value)} className="w-full bg-emerald-500/5 border border-emerald-500/10 rounded-2xl py-4 px-6 text-emerald-400 font-bold focus:outline-none" />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-400/20 uppercase tracking-widest">Ft</span>
                                </div>
                            </div>
                            {isTiered && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-primary/40 ml-4 italic">Piaci ár</label>
                                    <div className="relative">
                                        <input type="number" value={priceTier2} onChange={(e) => setPriceTier2(e.target.value)} className="w-full bg-primary/5 border border-primary/10 rounded-2xl py-4 px-6 text-primary font-bold focus:outline-none" />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-primary/20 uppercase tracking-widest">Ft</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* RIASZTÁS SZEKCIÓ */}
            <motion.div variants={itemVariants} ref={alertSectionRef} className={`flex flex-col gap-4 p-1 rounded-[2.5rem] transition-all duration-1000 ${highlightAlert ? 'bg-orange-500/10 ring-2 ring-orange-500/20' : 'bg-transparent'}`}>
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-white/5"><BellRing className="w-6 h-6 text-text-primary" /></div>
                        <div className="flex flex-col text-left"><span className="text-text-primary font-bold text-[15px] tracking-tight">Riasztás</span><span className="text-text-primary/40 text-[10px] font-black uppercase tracking-widest mt-0.5 italic">Figyelmeztetés limitnél</span></div>
                    </div>
                    <button onClick={() => setHasAlert(!hasAlert)} className={`w-12 h-7 rounded-full transition-colors relative ${hasAlert ? 'bg-primary' : 'bg-white/10'}`}><motion.div animate={{ x: hasAlert ? 24 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" /></button>
                </div>
                <AnimatePresence>
                    {hasAlert && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden px-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4 italic">Riasztási küszöb</label>
                            <div className="relative">
                                <input type="number" value={alertLimit} onChange={(e) => setAlertLimit(e.target.value)} className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 px-6 text-primary font-black text-xl focus:outline-none" />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-xs font-black text-text-primary/20 uppercase tracking-widest">{unit} / hó</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* ARCHIVÁLÁS / INAKTÍV SZEKCIÓ */}
            <motion.div variants={itemVariants} className="flex flex-col gap-4">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-lg">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-surface-elevated flex items-center justify-center border border-white/5">
                            <Archive className="w-6 h-6 text-text-primary/40" />
                        </div>
                        <div className="flex flex-col text-left">
                            <span className="text-text-primary font-bold text-[15px] tracking-tight">Archiválás</span>
                            <span className="text-text-primary/40 text-[10px] font-black uppercase tracking-widest mt-0.5 italic">Inaktív, nem használt óra</span>
                        </div>
                    </div>
                    {/* Ha be van kapcsolva, akkor narancssárgás/pirosas színt is adhatunk neki, de a primary is tökéletes */}
                    <button onClick={() => setIsArchived(!isArchived)} className={`w-12 h-7 rounded-full transition-colors relative ${isArchived ? 'bg-primary' : 'bg-white/10'}`}>
                        <motion.div animate={{ x: isArchived ? 24 : 4 }} className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg" />
                    </button>
                </div>
            </motion.div>

            {/* GOMBOK */}
            <motion.div variants={itemVariants} className="mt-4 space-y-4 relative z-10">
                <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Mentés</>}
                </button>
                <button onClick={handleDelete} disabled={isDeleting} className="w-full py-6 bg-red-500/5 border border-red-500/10 text-red-500 rounded-[2rem] font-black uppercase tracking-[0.1em] text-xs active:bg-red-500/10 flex items-center justify-center gap-3 disabled:opacity-50">
                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> Mérőóra végleges törlése</>}
                </button>
            </motion.div>
        </motion.div>
    );
}