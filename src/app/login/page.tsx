"use client";

import React, { useState } from "react";
import { motion, Variants } from "framer-motion";
import { ArrowLeft, Mail, Lock, LogIn, Loader2 } from "lucide-react";
import Link from "@/contexts/router.context";
import { useRouter } from "@/contexts/router.context";
import { loginAction } from "@/app/actions/auth"; // Behozzuk az action-t
import { LoginInput } from "@/types/auth"; // Behozzuk a típust

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

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Szigorúan típusos state
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await loginAction(formData);
      if (result.success) {
        // Sikeres belépés után irány az onboarding oldalra
        // A router.refresh() segít, hogy a szerver oldali komponensek lássák az új sütit
        router.push("/onboarding");
        router.refresh();
      } else {
        setError(result.message || "Hibás e-mail cím vagy jelszó.");
      }
    } catch (err) {
      setError("Valami elromlott a szerveroldalon. Próbáld újra!");
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
      {/* Dekorációs háttér gradiens */}

      <motion.header variants={itemVariants} className="relative z-10 flex items-center mb-12">
        <Link href="/" className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
          <ArrowLeft className="w-6 h-6 text-white" />
        </Link>
      </motion.header>

      <div className="relative z-10 space-y-8 max-w-sm mx-auto w-full">
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Üdv <span className="text-primary">Újra!</span>
          </h1>
          <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">V 2.5 Ecosystem Login</p>
        </motion.div>

        {/* Hibaüzenet Bento-stílusban */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">E-mail cím</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="pelda@email.hu"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/5"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-4">Jelszó</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-5 pl-14 pr-6 text-white font-bold focus:outline-none focus:border-primary/50 transition-colors placeholder:text-white/5"
              />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl active:scale-95 transition-transform flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5" strokeWidth={3} />
                  Bejelentkezés
                </>
              )}
            </button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="text-center">
          <Link href="/register" className="group">
            <span className="text-white/20 text-xs font-bold uppercase tracking-widest transition-colors group-active:text-primary">
              Még nincs fiókod? <span className="text-white/60 group-hover:text-white">Regisztráció</span>
            </span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}