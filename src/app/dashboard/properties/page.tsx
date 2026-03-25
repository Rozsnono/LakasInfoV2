"use client";

import React from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { HousePlus, LogIn, ChevronRight, ArrowLeft, Home, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import Link, { useRouter } from "@/contexts/router.context";
import { getUserHousesAction, selectHouseAction } from "@/app/actions/house";
import { useHouse } from "@/contexts/house.context";
import { useAction } from "@/providers/action.provider";

interface House {
    _id: string;
    name: string;
    address?: string;
    isActive?: boolean;
}

interface HouseManagerClientProps {
    success: boolean;
    hasHouse: boolean;
    houses?: House[];
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
};

export default function HouseManagerClient() {
    const router = useRouter();
    const { house } = useHouse();

    const { data, isPending, error, execute } = useAction<HouseManagerClientProps, []>(getUserHousesAction, {
        immediate: true
    });

    const selectHouse = async (houseId: string) => {
        const result = await selectHouseAction(houseId);

        if (result.success) {
            router.push("/dashboard");
            router.refresh();
        }
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
        >
            {/* Fejléc */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                    Otthon<span className="text-primary">aim</span>
                </h1>
            </motion.header>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-10">

                {/* Meglévő Otthonok Listája */}
                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">
                        {isPending ? "Betöltés..." : "Saját háztartások"}
                    </h2>

                    <div className="flex flex-col gap-3 min-h-[120px] justify-center relative">
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
                                    <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Háztartások keresése</p>
                                </motion.div>
                            ) : error ? (
                                /* HIBA ÁLLAPOT */
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center p-6 border border-red-500/20 bg-red-500/10 rounded-[2rem]"
                                >
                                    <p className="text-red-400 text-[11px] font-bold">Hiba történt a betöltéskor.</p>
                                    <button onClick={() => execute()} className="mt-3 text-primary text-[10px] font-black uppercase tracking-widest underline">Újra</button>
                                </motion.div>
                            ) : data?.houses && data.houses.length > 0 ? (
                                /* ADATOK MEGJELENÍTÉSE */
                                <motion.div
                                    key="content"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col gap-3"
                                >
                                    {data.houses.map((_house) => (
                                        <motion.button
                                            key={_house._id}
                                            onClick={() => selectHouse(_house._id)}
                                            whileTap={{ scale: 0.98 }}
                                            className={`w-full p-5 rounded-[2rem] border transition-all flex items-center gap-4 group text-left ${_house._id === house?._id
                                                ? "bg-white/10 border-white/20 shadow-xl"
                                                : "bg-surface border-white/5 shadow-lg active:bg-white/5"
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${_house._id === house?._id ? "bg-primary text-white" : "bg-white/5 text-white/40"
                                                }`}>
                                                <Home className="w-6 h-6" strokeWidth={_house._id === house?._id ? 2.5 : 2} />
                                            </div>

                                            <div className="flex flex-col flex-1 overflow-hidden">
                                                <span className="text-white font-black text-lg tracking-tight truncate">
                                                    {_house.name}
                                                </span>
                                                <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5 truncate">
                                                    <MapPin className="w-3 h-3 shrink-0" />
                                                    {_house.address || "Nincs megadva cím"}
                                                </span>
                                            </div>

                                            <div className="shrink-0">
                                                {_house._id === house?._id ? (
                                                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={3} />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                                                        <ChevronRight className="w-4 h-4 text-white/30" />
                                                    </div>
                                                )}
                                            </div>
                                        </motion.button>
                                    ))}
                                </motion.div>
                            ) : (
                                /* ÜRES ÁLLAPOT */
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center p-8 border border-dashed border-white/10 rounded-[2rem]"
                                >
                                    <span className="text-white/30 text-xs font-bold uppercase tracking-widest">Még nincs háztartásod</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* Elválasztó */}
                <motion.div variants={itemVariants} className="flex items-center gap-4">
                    <div className="h-px bg-white/5 flex-1" />
                    <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Műveletek</span>
                    <div className="h-px bg-white/5 flex-1" />
                </motion.div>

                {/* Akció Gombok (Új / Csatlakozás) */}
                <div className="flex flex-col gap-4">
                    <motion.div variants={itemVariants}>
                        <Link href="/dashboard/properties/create">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                className="w-full p-6 bg-white/5 rounded-[2.5rem] border border-primary/20 shadow-[0_0_30px_rgba(255,59,48,0.1)] flex items-center justify-between group active:bg-white/10 transition-all relative overflow-hidden"
                            >
                                <div className="flex items-center gap-5 relative z-10">
                                    <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                                        <HousePlus className="w-7 h-7 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-black text-xl tracking-tight leading-none">Új Ház</span>
                                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Létrehozása</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform relative z-10">
                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Link href="/dashboard/properties/join">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                className="w-full p-6 bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center justify-between group active:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                        <LogIn className="w-7 h-7 text-white/60" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-black text-xl tracking-tight leading-none">Csatlakozás</span>
                                        <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-1.5">Meghívó kóddal</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>

            <motion.p
                variants={itemVariants}
                className="mt-auto pt-12 text-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]"
            >
                LakasInfo Ecosystem
            </motion.p>
        </motion.div>
    );
}