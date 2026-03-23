"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Check, Sparkles, Crown, Zap, ShieldCheck } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context"; // Feltételezem ez a router importod
import { updateSubscriptionAction } from "@/app/actions/subscription";
import { PLANS } from "@/lib/subscriptionPlans";

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// Az előfizetési csomagok adatai

export default function SubscriptionPageClient() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter(); // Router inicializálása

    // Fizetés indítás / Frissítés
    const handleUpgrade = async (planId: string) => {
        if (planId === "free") return;
        setIsLoading(true);

        try {
            await updateSubscriptionAction({ subscriptionPlan: "pro", type: billingCycle });

            // Sikeres akció után vár egy picit a loader miatt, majd átirányít
            setTimeout(() => {
                setIsLoading(false);
                router.push("/dashboard"); // Ide beírhatod a kívánt sikeres útvonalat
            }, 1000);
        } catch (error) {
            console.error("Hiba történt a frissítés során", error);
            setIsLoading(false);
            // Itt kezelheted a hibát (pl. toast notification, ha van a rendszeredben)
        }
    };

    return (
        <motion.div initial="hidden" animate="visible" className="relative min-h-screen px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden">

            {/* Fejléc */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link href="/dashboard/profile" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase">Cso<span className="text-primary text-outline">magok</span></h1>
            </motion.header>

            <motion.div variants={itemVariants} className="flex flex-col items-center text-center px-4 mt-2">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-4 shadow-[0_0_30px_rgba(var(--primary),0.15)]">
                    <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-black text-white italic tracking-tight mb-2">Hozd ki a maximumot!</h2>
                <p className="text-white/40 text-xs font-bold leading-relaxed">
                    Válaszd a Pro modellt a korlátlan lehetőségekért, fotós rögzítésért és a részletes jelentésekért.
                </p>
            </motion.div>

            {/* Havi / Éves Kapcsoló (w-full és flex-1) */}
            <motion.div variants={itemVariants} className="w-full z-20 mt-2">
                <div className="bg-surface border border-white/5 p-1.5 rounded-full flex relative w-full">
                    <button
                        onClick={() => setBillingCycle("monthly")}
                        className={`flex-1 relative z-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors flex justify-center items-center ${billingCycle === "monthly" ? "text-black" : "text-white/40 hover:text-white"}`}
                    >
                        Havi
                    </button>
                    <button
                        onClick={() => setBillingCycle("yearly")}
                        className={`flex-1 relative z-10 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors flex justify-center items-center gap-2 ${billingCycle === "yearly" ? "text-black" : "text-white/40 hover:text-white"}`}
                    >
                        Éves
                        {/* Kicsi "2 hónap ingyen" badge */}
                        <span className={`text-[9px] px-2 py-0.5 rounded-full ${billingCycle === "yearly" ? "bg-black/20 text-black" : "bg-primary/20 text-primary"}`}>-16%</span>
                    </button>

                    {/* Mozgó háttér a kapcsolóhoz (50% mínusz a padding) */}
                    <div
                        className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc(50%-6px)] bg-white rounded-full shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
                        style={{ transform: billingCycle === "monthly" ? "translateX(0)" : "translateX(100%)" }}
                    />
                </div>
            </motion.div>

            {/* Kártyák */}
            <div className="flex flex-col gap-6 relative z-10 mt-2">
                {PLANS.map((plan, index) => {
                    const isPro = plan.id === "pro";
                    const price = billingCycle === "monthly" ? plan.priceMonthly : plan.priceYearly;

                    return (
                        <motion.div
                            key={plan.id}
                            variants={itemVariants}
                            className={`relative rounded-[2.5rem] p-6 flex flex-col gap-6 overflow-hidden ${isPro
                                ? "bg-surface border-2 border-primary/50 shadow-[0_0_40px_rgba(var(--primary),0.1)]"
                                : "bg-surface-elevated border border-white/5 shadow-xl"
                                }`}
                        >
                            {/* Pro háttér csillogás */}
                            {isPro && (
                                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-primary/20 blur-3xl rounded-full pointer-events-none" />
                            )}

                            <div className="flex justify-between items-start relative z-10">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        {plan.icon}
                                        <h3 className="text-xl font-black text-white italic tracking-tight">{plan.name}</h3>
                                    </div>
                                    <p className="text-white/40 text-xs font-medium mt-1 pr-4">{plan.description}</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shrink-0 ${isPro ? "bg-primary/20 text-primary border border-primary/20" : "bg-white/10 text-white/60"
                                    }`}>
                                    {plan.badge}
                                </div>
                            </div>

                            <div className="flex items-baseline gap-2 relative z-10">
                                <span className="text-5xl font-black text-white tracking-tighter">
                                    {price === 0 ? "Ingyenes" : price.toLocaleString("hu-HU")}
                                </span>
                                {price !== 0 && (
                                    <span className="text-white/40 text-sm font-bold uppercase tracking-widest">
                                        Ft / {billingCycle === "monthly" ? "hó" : "év"}
                                    </span>
                                )}
                            </div>

                            <div className="w-full h-px bg-white/5 relative z-10" />

                            <div className="flex flex-col gap-4 relative z-10">
                                {plan.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isPro ? "bg-primary/20" : "bg-white/5"
                                            }`}>
                                            <Check className={`w-3 h-3 ${isPro ? "text-primary" : "text-white/40"}`} />
                                        </div>
                                        <span className={`text-sm font-medium ${isPro ? "text-white/90" : "text-white/60"}`}>
                                            {feature}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={!isPro || isLoading}
                                className={`w-full mt-4 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all flex items-center justify-center gap-2 relative z-10 ${isPro
                                    ? "bg-primary text-white shadow-lg shadow-primary/20 active:scale-95"
                                    : "bg-white/5 text-white/40 cursor-default"
                                    }`}
                            >
                                {isLoading && isPro ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isPro && <Zap className="w-4 h-4" />}
                                        {plan.buttonText}
                                    </>
                                )}
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {/* Kis info a lap alján */}
            <motion.p variants={itemVariants} className="text-center text-white/20 text-[10px] font-bold uppercase tracking-widest mt-4">
                A fizetés biztonságos kapcsolaton keresztül történik. Bármikor lemondható.
            </motion.p>
        </motion.div>
    );
}