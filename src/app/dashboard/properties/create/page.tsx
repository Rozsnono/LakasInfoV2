"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Home, MapPin, Loader2, Sparkles, AlertCircle } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { createHouseAction } from "@/app/actions/house";

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

export default function CreateHousePage() {
    const router = useRouter();
    const [houseName, setHouseName] = useState("");
    const [address, setAddress] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await createHouseAction(houseName, address);

            if (result.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(result.message || "Valami hiba történt.");
                setLoading(false);
            }
        } catch (err) {
            setError("Hálózati hiba. Próbáld újra!");
            setLoading(false);
        }
    };

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
                    href="/dashboard/properties"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase italic">
                    Új <span className="text-primary">Háztartás</span>
                </h1>
            </motion.header>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-10 flex-1">

                <motion.div variants={itemVariants} className="space-y-4">
                    <h2 className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] ml-2">Háztartás adatai</h2>

                    {error && (
                        <div className="mb-4 bg-red-500/10 border border-red-500/20 p-4 rounded-[2rem] flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <span className="text-red-500 text-[10px] font-black uppercase tracking-widest leading-tight">
                                {error}
                            </span>
                        </div>
                    )}

                    <form onSubmit={handleCreate} className="flex flex-col gap-6">
                        {/* Háztartás Neve */}
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <Home className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="text"
                                    required
                                    disabled={loading}
                                    value={houseName}
                                    onChange={(e) => setHouseName(e.target.value)}
                                    placeholder="Név (pl. Családi fészek)"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/30"
                                />
                            </div>
                        </div>

                        {/* Pontos Cím */}
                        <div className="flex flex-col gap-2">
                            <div className="relative">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                                <input
                                    type="text"
                                    disabled={loading}
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    placeholder="Pontos cím (opcionális)"
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/30"
                                />
                            </div>
                        </div>

                        {/* Helper Info */}
                        <div className="mt-2 bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 flex items-start gap-4">
                            <Sparkles className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                            <p className="text-primary/50 text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                                A név megadása után egyedi <span className="text-primary">meghívó kódot generálunk</span>, amivel behívhatod a lakótársaidat is.
                            </p>
                        </div>

                        {/* Mentés Gomb */}
                        <button
                            type="submit"
                            disabled={loading || !houseName.trim()}
                            className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Létrehozás és Tovább"
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Footer Branding */}
            <motion.p
                variants={itemVariants}
                className="mt-auto pt-12 text-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]"
            >
                LakasInfo Ecosystem
            </motion.p>
        </motion.div>
    );
}