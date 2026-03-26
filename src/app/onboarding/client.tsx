"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { HousePlus, LogIn, ChevronRight, Sparkles, ArrowLeft } from "lucide-react";
import Link from "@/contexts/router.context";
import { useUser } from "@/contexts/user.context";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
        },
    },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
        },
    },
};

export default function OnboardingClient() {

    const { logout } = useUser();

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen  px-6 flex flex-col overflow-hidden"
        >

            <motion.header variants={itemVariants} className="pt-12 mb-12">
                <button onClick={logout} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
            </motion.header>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-12">
                <motion.div variants={itemVariants} className="space-y-4">
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">
                        Hogyan <span className="text-primary">Tovább?</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">Válassz egy opciót</p>
                </motion.div>

                <div className="flex flex-col gap-4">
                    <motion.div variants={itemVariants}>
                        <Link href="/onboarding/create">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                className="w-full p-8 bg-white/5 rounded-[2.5rem] border border-primary/20 shadow-[0_0_40px_rgba(255,59,48,0.1)] flex items-center justify-between group active:bg-white/10 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                                        <HousePlus className="w-8 h-8 text-white" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-black text-2xl tracking-tight leading-none">Új Ház</span>
                                        <span className="text-primary text-[11px] font-black uppercase tracking-[0.2em] mt-2">Létrehozása</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Join House Card */}
                    <motion.div variants={itemVariants}>
                        <Link href="/onboarding/join">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                className="w-full p-8 bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center justify-between group active:bg-white/5 transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                                        <LogIn className="w-8 h-8 text-white/60" strokeWidth={2.5} />
                                    </div>
                                    <div className="flex flex-col text-left">
                                        <span className="text-white font-black text-2xl tracking-tight leading-none">Csatlakozás</span>
                                        <span className="text-white/20 text-[11px] font-black uppercase tracking-[0.2em] mt-2">Meghívó kóddal</span>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5 text-white/20" />
                                </div>
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>

                {/* Helper Info */}
                <motion.div variants={itemVariants} className="bg-blue-500/5 p-6 rounded-[2rem] border border-blue-500/10 flex items-start gap-4">
                    <Sparkles className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-blue-400/60 text-[11px] font-bold leading-relaxed">
                        Ha már valaki a háztartásodból regisztrált, kérd el tőle a csatlakozási kódot a lakótársak menüpontból.
                    </p>
                </motion.div>
            </div>

            {/* Footer Branding */}
            <motion.p
                variants={itemVariants}
                className="mt-auto mb-8 text-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]"
            >
                LakasInfo Ecosystem
            </motion.p>
        </motion.div>
    );
}