"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Mail, Lock, User, UserPlus, Sparkles, Loader2 } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { registerAction } from "@/app/actions/auth"; // Action importálása
import { RegisterInput } from "@/types/auth"; // Típus importálása

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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

export default function RegisterPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Szigorúan típusos state
    const [formData, setFormData] = useState<RegisterInput>({
        name: "",
        email: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await registerAction(formData);

            if (result.success) {
                // Sikeres regisztráció -> irány az onboarding vagy dashboard
                router.push("/onboarding");
                router.refresh();
            } else {
                setError(result.message || "Hiba történt a regisztráció során.");
            }
        } catch (err) {
            setError("Hálózati hiba történt. Kérlek próbáld újra!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen  px-6 pt-12 pb-12 flex flex-col overflow-x-hidden"
        >

            <motion.header variants={itemVariants} className="relative z-10 flex items-center mb-12">
                <Link href="/" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <ArrowLeft className="w-6 h-6 text-text-primary" />
                </Link>
            </motion.header>

            <div className="relative z-10 space-y-8 max-w-sm mx-auto w-full">
                <motion.div variants={itemVariants} className="space-y-2 text-left">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-4">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h1 className="text-4xl font-black text-text-primary tracking-tighter uppercase italic leading-none">
                        Új <span className="text-primary">Fiók</span>
                    </h1>
                    <p className="text-text-primary/40 text-[10px] font-black uppercase tracking-[0.3em]">Start your smart journey</p>
                </motion.div>

                {/* Hibaüzenet megjelenítése */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Teljes név</label>
                        <div className="relative">
                            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Minta Márton"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-primary/5"
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">E-mail cím</label>
                        <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="pelda@email.hu"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-primary/5"
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-text-primary/40 ml-4">Jelszó</label>
                        <div className="relative">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-primary/20" />
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Minimum 8 karakter"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-text-primary font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-primary/5"
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-6 bg-primary text-text-primary rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_40px_rgba(255,59,48,0.2)] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <UserPlus className="w-5 h-5" strokeWidth={3} />
                                    Regisztráció
                                </>
                            )}
                        </button>
                    </motion.div>
                </form>

                <motion.div variants={itemVariants} className="text-center">
                    <Link href="/login" className="group">
                        <span className="text-text-primary/20 text-xs font-bold uppercase tracking-widest transition-colors group-active:text-primary">
                            Van már fiókod? <span className="text-text-primary/60 group-hover:text-text-primary">Bejelentkezés</span>
                        </span>
                    </Link>
                </motion.div>
            </div>
        </motion.div>
    );
}