"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, UserPlus, ShieldAlert, Crown,
    User, MoreVertical, Copy, Check, Trash2, Loader2
} from "lucide-react";
import Link from "@/contexts/router.context";
import { removeRoommateAction } from "@/app/actions/house";

interface Member {
    id: string;
    name: string;
    role: string;
    isMe: boolean;
    init: string;
    image?: string;
}

interface RoommatesClientProps {
    initialMembers: Member[];
    inviteCode: string;
    isOwner: boolean;
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function RoommatesClient({ initialMembers, inviteCode, isOwner }: RoommatesClientProps) {
    const [showCode, setShowCode] = useState(false);
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState(initialMembers);
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm("Biztosan eltávolítod ezt a lakótársat?")) return;

        setRemovingId(memberId);
        const res = await removeRoommateAction(memberId);
        if (res.success) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
        } else {
            alert(res.message);
        }
        setRemovingId(null);
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen  px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
        >

            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase italic">Lakó<span className="text-primary">társak</span></h1>
            </motion.header>

            {isOwner && (
                <motion.div variants={itemVariants} className="relative z-10 space-y-4">
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className="w-full py-6 px-6 bg-white text-black rounded-[2rem] flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-2xl font-black uppercase tracking-widest text-sm"
                    >
                        <UserPlus className="w-5 h-5" strokeWidth={3} />
                        Új lakótárs meghívása
                    </button>

                    <AnimatePresence>
                        {showCode && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, scale: 0.95 }}
                                animate={{ opacity: 1, height: "auto", scale: 1 }}
                                exit={{ opacity: 0, height: 0, scale: 0.95 }}
                                className="bg-surface rounded-[2.5rem] p-8 border border-white/5 shadow-2xl flex flex-col items-center text-center gap-4 overflow-hidden"
                            >
                                <span className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Csatlakozási kód</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-5xl font-black text-primary tracking-[0.15em]">{inviteCode}</span>
                                    <button
                                        onClick={handleCopy}
                                        className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center active:scale-90 transition-all"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-white/40" />}
                                    </button>
                                </div>
                                <p className="text-white/30 text-xs font-bold leading-relaxed px-4">
                                    Oszd meg ezt a 6 jegyű kódot. Aki ezzel regisztrál, azonnal látni fogja a háztartás mérőóráit.
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <motion.div variants={itemVariants} className="relative z-10 space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-white/40 font-black text-[10px] uppercase tracking-[0.2em]">Aktív tagok ({members.length})</h3>
                </div>

                <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden divide-y divide-white/5">
                    {members.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-6 active:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl ${user.role === 'Tulajdonos' ? 'bg-primary' : 'bg-surface-elevated'} flex items-center justify-center text-white font-black text-xl shadow-inner relative group-active:scale-90 transition-transform border border-white/5`}>
                                    {user.init}
                                    {user.role === 'Tulajdonos' && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                                            <Crown className="w-3.5 h-3.5 text-yellow-500" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black text-[17px] tracking-tight">
                                        {user.name} {user.isMe && <span className="text-white/20 font-bold ml-1">(Te)</span>}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        {user.role === 'Tulajdonos' ? <Crown className="w-3 h-3 text-yellow-500/50" /> : <User className="w-3 h-3 text-white/20" />}
                                        <span className="text-white/40 text-[11px] font-black uppercase tracking-wider">{user.role}</span>
                                    </div>
                                </div>
                            </div>

                            {isOwner && !user.isMe && (
                                <button
                                    onClick={() => handleRemove(user.id)}
                                    disabled={removingId === user.id}
                                    className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/20 transition-all"
                                >
                                    {removingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-auto">
                <div className="bg-orange-500/10 p-6 rounded-[2rem] flex items-start gap-4 border border-orange-500/20 shadow-xl">
                    <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0" />
                    <p className="text-orange-500/70 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                        A lakótársak láthatják a méréseket és újakat rögzíthetnek, de az órák paramétereit és a ház alapadatait nem módosíthatják.
                    </p>
                </div>
            </motion.div>
        </motion.div>
    );
}