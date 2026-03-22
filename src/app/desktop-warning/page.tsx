"use client";

import { motion } from "framer-motion";
import { Download, Smartphone, QrCode, Globe } from "lucide-react";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import { getVersionNumber } from "@/lib/versioning";

export default function DesktopWarning() {
    const router = useRouter();

    const handleBypass = () => {
        document.cookie = "bypass_app_check=true; path=/; max-age=31536000";
        router.push("/");
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-6 text-center">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,_var(--brand-primary)_0%,_transparent_60%)] opacity-20 blur-3xl" />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 flex w-full max-w-sm flex-col items-center gap-8"
            >
                <motion.div
                    animate={{ y: [-5, 5, -5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="relative flex flex-col items-center"
                >
                    <div className="relative mb-4 flex h-32 w-32 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-2xl backdrop-blur-md">
                        <Smartphone className="h-16 w-16 text-white drop-shadow-lg" />
                    </div>

                    <div className="absolute -bottom-2 whitespace-nowrap rounded-full border border-primary/50 bg-primary px-5 py-2 text-[10px] font-black uppercase tracking-[0.4em] text-white shadow-[0_0_20px_rgba(255,59,48,0.5)]">
                        Mobil Exkluzív
                    </div>
                </motion.div>

                <div className="mt-6 space-y-4">
                    <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white">
                        Válts <span className="text-outline text-primary">Telefonra</span>
                    </h2>
                    <p className="px-4 text-[11px] font-bold uppercase leading-relaxed tracking-widest text-white/40">
                        A LakasInfo egy natív alkalmazás, amelyet kizárólag mobileszközökre optimalizáltunk. Asztali böngészőből a hozzáférés korlátozott.
                    </p>
                </div>

                <div className="mt-6 flex w-full flex-col gap-4">
                    <a href={`/LakasInfoV${getVersionNumber()}.apk`} download className="w-full">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            className="flex w-full items-center justify-center gap-3 rounded-[2rem] bg-primary py-6 font-black uppercase tracking-[0.2em] text-white shadow-[0_0_30px_rgba(255,59,48,0.3)] transition-all active:scale-95"
                        >
                            <Download className="h-5 w-5" />
                            APK Letöltése
                        </motion.button>
                    </a>

                    <button
                        onClick={handleBypass}
                        className="flex w-full items-center justify-center gap-2 rounded-full py-4 text-[11px] font-black uppercase tracking-widest text-white/50 transition-colors hover:text-white"
                    >
                        <Globe className="h-4 w-4" />
                        Folytatás mégis böngészőből
                    </button>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 text-[10px] font-bold uppercase tracking-[0.5em] text-white/10"
            >
                LakasInfo Ecosystem
            </motion.p>
        </div>
    );
}