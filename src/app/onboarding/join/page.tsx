"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import React, { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { joinHouseAction } from "@/app/actions/house";

export default function JoinHousePage() {
    const router = useRouter();
    const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/[^0-9]/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value.substring(value.length - 1);
        setCode(newCode);

        // Automatikus ugrás a következőre
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        const fullCode = code.join("");

        if (fullCode.length !== 6) return;

        setLoading(true);
        setError(null);

        try {
            // Meghívjuk a backend akciót
            const result = await joinHouseAction(fullCode);

            if (result.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(result.message || "Érvénytelen kód. Ellenőrizd és próbáld újra!");
                setLoading(false);
                // Opcionális: Rezgő visszajelzés mobilokon
                if (navigator.vibrate) navigator.vibrate(200);
            }
        } catch (err) {
            setError("Hálózati hiba történt a csatlakozás során.");
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
                className="relative z-10 flex-1 flex flex-col max-w-sm mx-auto w-full"
            >
                <div className="mb-10 space-y-2 text-left">
                    <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
                        Csatla<span className="text-primary">kozás</span>
                    </h1>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed">
                        Add meg a kódot
                    </p>
                </div>

                {/* Hibaüzenet megjelenítése */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6 flex items-center gap-3 bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleJoin} className="flex flex-col gap-8 flex-1">
                    {/* OTP Bemenetek - Ha hiba van, megrázkódik (shake) */}
                    <motion.div
                        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                        className="flex justify-between gap-2 mt-4"
                    >
                        {code.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={1}
                                disabled={loading}
                                value={digit}
                                onChange={(e) => handleChange(index, e)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-16 bg-white/5 border ${error ? 'border-primary/50' : 'border-white/10'} rounded-2xl text-center text-white text-3xl font-black focus:outline-none focus:border-primary transition-all shadow-xl disabled:opacity-50`}
                            />
                        ))}
                    </motion.div>

                    <div className="mt-auto pt-6 pb-8">
                        <motion.button
                            whileTap={{ scale: 0.96 }}
                            type="submit"
                            disabled={code.join("").length !== 6 || loading}
                            className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-20"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                "Belépés a háztartásba"
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}