"use client";

import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import React from "react";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen p-6  relative overflow-hidden items-center justify-center text-center">
            {/* Középső erős Glow effect a hiba jelzésére */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,_var(--brand-primary)_0%,_transparent_60%)] opacity-20 blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center max-w-sm w-full gap-8"
            >
                {/* Lebegő 404 Szám */}
                <motion.div
                    animate={{ y: [-10, 10, -10] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative flex flex-col items-center"
                >
                    <h1 className="text-[9rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/5 tracking-tighter italic leading-none drop-shadow-2xl">
                        404
                    </h1>
                    {/* Neon Badge */}
                    <div className="absolute -bottom-2 bg-primary text-text-primary text-[10px] font-black uppercase tracking-[0.4em] px-5 py-2 rounded-full border border-primary/50 whitespace-nowrap shadow-[0_0_20px_rgba(255,59,48,0.5)]">
                        Rendszerhiba
                    </div>
                </motion.div>

                {/* Szöveges üzenet */}
                <div className="space-y-4 mt-6">
                    <h2 className="text-4xl font-black italic tracking-tighter uppercase text-text-primary leading-none">
                        Vakvágányra <span className="text-primary text-outline">Futtál</span>
                    </h2>
                    <p className="text-text-primary/40 text-[11px] font-bold uppercase tracking-widest leading-relaxed px-4">
                        Az általad keresett oldal nem található az ökoszisztémában, vagy időközben törlésre került.
                    </p>
                </div>

                {/* Bento stílusú Action Gombok */}
                <div className="flex flex-col w-full gap-4 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.back()}
                        className="w-full py-6 bg-white/5 border border-white/10 text-text-primary rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3 active:bg-white/10 transition-all shadow-xl"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Vissza az előzőre
                    </motion.button>

                    <Link href="/dashboard" className="w-full">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            className="w-full py-6 bg-primary text-text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,59,48,0.3)]"
                        >
                            <Home className="w-5 h-5" />
                            Főoldal
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Lábjegyzet */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 text-text-primary/10 text-[10px] font-bold uppercase tracking-[0.5em]"
            >
                LakasInfo Ecosystem
            </motion.p>
        </div>
    );
}