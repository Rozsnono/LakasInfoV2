"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import React from "react";

export default function Loading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen  relative overflow-hidden">
            {/* Háttér Glow effekt, ami finoman pulzál */}
            <motion.div
                animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[radial-gradient(circle,_var(--brand-primary)_0%,_transparent_70%)] blur-3xl pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex flex-col items-center gap-8"
            >
                {/* Középső animált logó/ikon */}
                <div className="relative flex items-center justify-center w-24 h-24">
                    {/* Külső pörgő neon kör */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 rounded-full border-t-2 border-primary/80 border-r-2 border-transparent border-b-2 border-transparent border-l-2 border-transparent opacity-80"
                    />

                    {/* Belső pulzáló Bento-kocka */}
                    <motion.div
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-14 h-14 bg-white/5 rounded-[1.2rem] flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,59,48,0.2)] backdrop-blur-md"
                    >
                        <Zap className="w-6 h-6 text-primary fill-primary/20" />
                    </motion.div>
                </div>

                {/* Szöveges visszajelzés */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-text-primary font-black italic tracking-tighter uppercase text-2xl flex items-center gap-1">
                        Szinkronizálás
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                            className="text-primary"
                        >
                            ...
                        </motion.span>
                    </h2>
                    <p className="text-text-primary/30 text-[10px] font-black uppercase tracking-[0.5em]">
                        Adatok betöltése folyamatban
                    </p>
                </div>
            </motion.div>
        </div>
    );
}