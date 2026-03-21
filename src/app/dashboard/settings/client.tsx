"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Home, MapPin, Save, Trash2, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { updateHouseAction, deleteHouseAction } from "@/app/actions/house";

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

export default function HouseSettingsClient({ initialHouse }: SettingsClientProps) {
    const router = useRouter();
    const [houseName, setHouseName] = useState(initialHouse.name);
    const [address, setAddress] = useState(initialHouse.address || "");

    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const handleSave = async () => {
        if (!houseName.trim()) return;
        setIsSaving(true);
        setStatus(null);

        const result = await updateHouseAction(initialHouse._id, houseName, address);

        if (result.success) {
            setStatus({ type: 'success', msg: result.message });
            setTimeout(() => setStatus(null), 3000);
        } else {
            setStatus({ type: 'error', msg: result.message || "Hiba történt" });
        }
        setIsSaving(false);
    };

    const handleDelete = async () => {
        const confirmDelete = confirm("Biztosan törölni szeretnéd a háztartást? Minden adat (mérések, fotók) véglegesen elveszik!");
        if (!confirmDelete) return;

        setIsDeleting(true);
        const result = await deleteHouseAction(initialHouse._id);

        if (result.success) {
            router.push("/onboarding");
        } else {
            alert(result.message);
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen  px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
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

            <motion.div variants={itemVariants} className="relative z-10 space-y-6">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Háztartás neve</label>
                    <div className="relative">
                        <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input
                            type="text"
                            value={houseName}
                            onChange={(e) => setHouseName(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Pl. Otthon"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-4">Pontos cím</label>
                    <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors"
                            placeholder="Város, utca, házszám"
                        />
                    </div>
                </div>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`p-4 rounded-2xl border text-xs font-bold uppercase tracking-widest text-center ${status.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'
                            }`}
                    >
                        {status.msg}
                    </motion.div>
                )}

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" strokeWidth={3} />}
                    Mentés
                </button>
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
                        <h3 className="text-white font-black text-lg tracking-tight uppercase italic">Veszélyes <span className="text-primary">zóna</span></h3>
                    </div>

                    <p className="text-white/40 text-xs font-bold leading-relaxed">
                        A háztartás törlésével az összes lakótárs hozzáférése megszűnik, és minden rögzített mérési adat véglegesen törlődik. Ez a művelet nem vonható vissza.
                    </p>

                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-[10px] border border-red-500/20 active:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isDeleting && <Loader2 className="w-3 h-3 animate-spin" />}
                        Háztartás végleges törlése
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}