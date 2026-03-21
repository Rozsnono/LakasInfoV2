"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import { UserPlus, LogIn, ChevronRight, Sparkles } from "lucide-react";
import Link from "@/contexts/router.context";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
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

export default function OnboardingPage() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="relative min-h-screen  px-6 flex flex-col justify-center overflow-hidden"
    >
      {/* Brand Background Glow */}

      <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-12">
        {/* Logo Section */}
        <motion.div variants={itemVariants} className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
            <Sparkles className="w-10 h-10 text-primary" strokeWidth={2.5} />
          </div>
          <h1 className="text-6xl font-black mb-4 tracking-tighter text-white uppercase italic">
            Lakas<span className="text-primary">Info</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em]">
            Egy intelligens Otthonért
          </p>
        </motion.div>

        {/* Action Section */}
        <div className="flex flex-col gap-4">
          {/* Create User Button */}
          <motion.div variants={itemVariants}>
            <Link href="/register">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full p-7 bg-white/5 rounded-[2.5rem] border border-primary/20 shadow-[0_0_40px_rgba(255,59,48,0.1)] flex items-center justify-between group active:bg-white/10 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(255,59,48,0.4)]">
                    <UserPlus className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-black text-xl tracking-tight leading-none">Felhasználó</span>
                    <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-2">Létrehozása</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </div>
              </motion.button>
            </Link>
          </motion.div>

          {/* Login Button */}
          <motion.div variants={itemVariants}>
            <Link href="/login">
              <motion.button
                whileTap={{ scale: 0.97 }}
                className="w-full p-7 bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl flex items-center justify-between group active:bg-white/5 transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <LogIn className="w-7 h-7 text-white/60" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-white font-black text-xl tracking-tight leading-none">Bejelentkezés</span>
                    <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Már van fiókom</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-active:translate-x-1 transition-transform">
                  <ChevronRight className="w-5 h-5 text-white/20" />
                </div>
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-2 mt-4">
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
            © 2026 LakasInfo • Minden jog fenntartva
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}