"use client";

import React, { useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, MapPin, Save, Trash2, ShieldAlert, Loader2, X, Check } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { updateHouseAction, deleteHouseAction, getUserHouseAction } from "@/app/actions/house";
import { useAction } from "@/providers/action.provider";

interface SettingsClientProps {
    initialHouse: {
        _id: string;
        name: string;
        address?: string;
    };
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08 }
    }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
    }
};

export default function HouseSettingsClient() {
    const router = useRouter();
    const [houseName, setHouseName] = useState("");
    const [address, setAddress] = useState("");
    const [houseId, setHouseId] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const { isPending, error, execute } = useAction(
        getUserHouseAction,
        {
            immediate: true,
            onSuccess: (data) => {
                setHouseName(data.house.name);
                setHouseId(data.house._id);
                setAddress(data.house.address || "");
            }
        }
    );

    const handleSave = async () => {
        if (!houseName.trim()) return;
        setIsSaving(true);
        setStatus(null);

        const result = await updateHouseAction(houseId, houseName, address);

        if (result.success) {
            setStatus({ type: 'success', msg: result.message });
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus({ type: 'error', msg: result.message || "Hiba történt" });
        }
        setIsSaving(false);
    };

    const handleConfirmDelete = async () => {
        setIsDeleting(true);
        const result = await deleteHouseAction(houseId);

        if (result.success) {
            router.push("/onboarding");
        } else {
            setStatus({ type: 'error', msg: result.message || "Hiba a törlés során" });
            setIsDeleting(false);
            setIsConfirmingDelete(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
        >

            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase italic">Beállí<span className="text-primary">tások</span></h1>
            </motion.header>

            <motion.div variants={itemVariants} className="relative z-10 min-h-[300px] flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    {isPending ? (
                        /* TÖLTÉS ÁLLAPOT */
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-10 gap-4"
                        >
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-text-primary/40 text-xs font-bold uppercase tracking-widest">Adatok betöltése...</p>
                        </motion.div>
                    ) : error ? (
                        /* HIBA ÁLLAPOT */
                        <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-center py-10 px-6 bg-red-500/10 border border-red-500/20 rounded-[2.5rem]"
                        >
                            <p className="text-red-400 text-sm font-bold">Hiba történt az adatok betöltésekor.</p>
                            <button onClick={() => execute()} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                        </motion.div>
                    ) : (
                        /* ŰRLAP ÁLLAPOT */
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Háztartás neve</label>
                                <div className="relative">
                                    <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input
                                        type="text"
                                        value={houseName}
                                        onChange={(e) => setHouseName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Pl. Otthon"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-primary/40 ml-4">Pontos cím</label>
                                <div className="relative">
                                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors"
                                        placeholder="Város, utca, házszám"
                                    />
                                </div>
                            </div>

                            <AnimatePresence>
                                {status && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest text-center ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                                            }`}
                                    >
                                        {status.msg}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" strokeWidth={3} />}
                                Mentés
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-auto pt-10 relative z-10">
                <div className="bg-surface rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <ShieldAlert className="w-24 h-24 text-red-500" />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/10">
                            <Trash2 className="w-6 h-6 text-red-500" />
                        </div>
                        <h3 className="text-text-primary font-black text-lg tracking-tight uppercase italic">Veszélyes <span className="text-primary">zóna</span></h3>
                    </div>

                    <p className="text-text-primary/40 text-xs font-bold leading-relaxed">
                        A háztartás törlésével az összes lakótárs hozzáférése megszűnik, és minden rögzített mérési adat véglegesen törlődik. Ez a művelet nem vonható vissza.
                    </p>

                    {/* Változó Gomb Szekció */}
                    <AnimatePresence mode="wait">
                        {!isConfirmingDelete ? (
                            <motion.button
                                key="delete-btn"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                onClick={() => setIsConfirmingDelete(true)}
                                className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 active:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                Háztartás végleges törlése
                            </motion.button>
                        ) : (
                            <motion.div
                                key="confirm-btns"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex gap-3"
                            >
                                <button
                                    onClick={() => setIsConfirmingDelete(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-5 bg-white/5 text-text-primary/60 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-white/5 active:bg-white/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    <X className="w-4 h-4" />
                                    Mégsem
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-5 bg-red-500 text-text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                    Biztosan!
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </motion.div>
    );
}