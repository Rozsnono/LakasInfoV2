"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Home, MapPin, Loader2, Sparkles } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import React, { useState } from "react";
import { createHouseAction } from "@/app/actions/house";

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
            // Megszólítjuk a backendet
            const result = await createHouseAction(houseName, address);

            if (result.success) {
                // Ha sikerült, repülünk a dashboardra
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
        <div className="flex flex-col min-h-screen p-6  relative overflow-hidden text-white">

            <header className="relative z-10 flex items-center mb-10 pt-6">
                <Link href="/onboarding" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-95 transition-transform border border-white/5 shadow-lg">
                    <ArrowLeft className="w-5 h-5 text-white" />
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 flex-1 flex flex-col"
            >
                <div className="mb-10 space-y-2">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Új <span className="text-primary">Ház</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                        Hozz létre egy új háztartást
                    </p>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-6 bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleCreate} className="flex flex-col gap-6 flex-1 max-w-sm">
                    <div className="flex flex-col gap-2">
                        <label className="text-white/30 text-[10px] font-black uppercase tracking-widest px-4">Háztartás neve</label>
                        <div className="relative">
                            <Home className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                            <input
                                type="text"
                                required
                                disabled={loading}
                                value={houseName}
                                onChange={(e) => setHouseName(e.target.value)}
                                placeholder="pl. Családi fészek"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/5"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-white/30 text-[10px] font-black uppercase tracking-widest px-4">Pontos cím (opcionális)</label>
                        <div className="relative">
                            <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 w-5 h-5" />
                            <input
                                type="text"
                                disabled={loading}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Város, Utca, Házszám"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/5"
                            />
                        </div>
                    </div>

                    {/* Bento Info */}
                    <div className="mt-4 bg-white/5 p-6 rounded-[2rem] border border-white/5 flex items-start gap-4">
                        <Sparkles className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                        <p className="text-white/40 text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                            A név megadása után egyedi meghívó kódot generálunk, amivel behívhatod a lakótársaidat is.
                        </p>
                    </div>

                    <div className="mt-auto pt-6">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="submit"
                            disabled={loading || !houseName}
                            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Létrehozás és Tovább"
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}