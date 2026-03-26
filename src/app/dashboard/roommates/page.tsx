"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    ArrowLeft, UserPlus, ShieldAlert, Crown,
    User, Trash2, Loader2, Key
} from "lucide-react";
import Link from "@/contexts/router.context";
import { getRoommatesAction, removeRoommateAction } from "@/app/actions/house";
import InviteCodeSheet from "@/components/RoommateCodeSheet";
import { useAction } from "@/providers/action.provider";
import { useUser } from "@/contexts/user.context";

interface Member {
    id: string;
    name: string;
    role: string;
    isMe: boolean;
    init: string;
}

enum Role {
    owner = "Tulajdonos",
    member = "Lakótárs",
    guest = "Bérlő",
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function RoommatesClient() {

    const { user } = useUser();
    const [isSheetOpen, setIsSheetOpen] = useState<'members' | 'guests' | ''>('');
    const [copied, setCopied] = useState(false);
    const [members, setMembers] = useState<Member[]>([]);
    const [isOwner, setIsOwner] = useState<boolean>(false);
    const [memberInviteCode, setMemberInviteCode] = useState<string>("");
    const [guestInviteCode, setGuestInviteCode] = useState<string>("");
    const [removingId, setRemovingId] = useState<string | null>(null);

    const { isPending, error, execute } = useAction(
        getRoommatesAction,
        {
            immediate: true,
            onSuccess: (data) => {
                setMembers(data.members);
                setIsOwner(data.members.some((m: Member) => m.id === data.house.ownerId && m.id === data.currentUserId));
                setMemberInviteCode(data.house.inviteCodes.members?.toString() || "");
                setGuestInviteCode(data.house.inviteCodes.guests?.toString() || "");
            }
        }
    );

    const handleCopy = async (type: "members" | "guests") => {
        await navigator.clipboard.writeText(type === "members" ? memberInviteCode : guestInviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRemove = async (memberId: string) => {
        if (!confirm("Biztosan eltávolítod ezt a lakótársat?")) return;
        setRemovingId(memberId);
        const res = await removeRoommateAction(memberId);
        if (res.success) {
            setMembers(prev => prev.filter(m => m.id !== memberId));
        }
        setRemovingId(null);
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative min-h-screen px-4 pt-12 pb-24 flex flex-col gap-8 overflow-x-hidden"
        >
            <motion.header variants={itemVariants} className="relative z-10 flex items-center gap-4">
                <Link
                    href="/dashboard"
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5 text-text-primary" />
                </Link>
                <h1 className="text-3xl font-black text-text-primary tracking-tight uppercase italic">
                    Lakó<span className="text-primary">társak</span>
                </h1>
            </motion.header>

            {/* MEGHÍVÓ GOMBOK */}
            {!isPending && (
                <motion.div variants={itemVariants} className="relative z-10 flex items-center gap-4">
                    {
                        user?.houseRole === 'owner' && (
                            <React.Fragment>
                                <button
                                    onClick={() => setIsSheetOpen("members")}
                                    className="flex-1 py-5 px-2 bg-white text-black rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-2xl"
                                >
                                    <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                                    <span className="font-black uppercase tracking-widest text-[10px] text-center">Lakótárs<br />meghívása</span>
                                </button>

                                <button
                                    onClick={() => setIsSheetOpen("guests")} // Ezt később átírhatod, ha lesz külön Bérlő Sheet
                                    className="flex-1 py-5 px-2 bg-primary text-text-primary rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                                >
                                    <Key className="w-6 h-6" strokeWidth={2.5} />
                                    <span className="font-black uppercase tracking-widest text-[10px] text-center">Bérlő<br />meghívása</span>
                                </button>
                            </React.Fragment>
                        )
                    }

                    {
                        user?.houseRole === 'member' && (
                            <React.Fragment>
                                <button
                                    onClick={() => setIsSheetOpen("members")}
                                    className="flex-1 py-5 px-2 bg-white text-black rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-2xl"
                                >
                                    <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                                    <span className="font-black uppercase tracking-widest text-[10px] text-center">Lakótárs<br />meghívása</span>
                                </button>
                            </React.Fragment>
                        )
                    }

                    {
                        user?.houseRole === 'guest' && (
                            <button
                                onClick={() => setIsSheetOpen("guests")}
                                className="flex-1 py-5 px-2 bg-primary text-text-primary rounded-[2rem] flex flex-col items-center justify-center gap-2 active:scale-95 transition-transform shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                            >
                                <UserPlus className="w-6 h-6" strokeWidth={2.5} />
                                <span className="font-black uppercase tracking-widest text-[10px] text-center">Bérlőtárs<br />meghívása</span>
                            </button>
                        )
                    }

                </motion.div>
            )}

            <motion.div variants={itemVariants} className="relative z-10 space-y-4">
                <div className="flex items-center justify-between px-4">
                    <h3 className="text-text-primary/40 font-black text-[10px] uppercase tracking-[0.2em]">
                        {isPending ? "Betöltés..." : `Aktív tagok (${members.length})`}
                    </h3>
                </div>

                <div className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden min-h-[150px] flex flex-col">
                    <AnimatePresence mode="popLayout">
                        {/* TÖLTÉS ÁLLAPOT */}
                        {isPending ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-16 gap-4 m-auto"
                            >
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-text-primary/40 text-xs font-bold uppercase tracking-widest">Tagok betöltése...</p>
                            </motion.div>
                        ) : error ? (
                            /* HIBA ÁLLAPOT */
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 px-6 m-auto">
                                <p className="text-red-400 text-sm font-bold">Hiba történt az adatok betöltésekor.</p>
                                <button onClick={() => execute()} className="mt-4 text-primary text-xs font-bold uppercase tracking-widest underline">Újrapróbálkozás</button>
                            </motion.div>
                        ) : members.length === 0 ? (
                            /* ÜRES ÁLLAPOT (Bár elméletben legalább 1 ember, a tulaj mindig benne van) */
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-16 m-auto">
                                <p className="text-text-primary/20 text-sm font-bold uppercase tracking-widest italic">Nincsenek aktív lakótársak.</p>
                            </motion.div>
                        ) : (
                            /* ADATOK MEGJELENÍTÉSE */
                            <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="divide-y divide-white/5">
                                {members.map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-6 group transition-colors">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-14 h-14 rounded-2xl ${user.role === 'owner' ? 'bg-primary' : 'bg-surface-elevated'} flex items-center justify-center text-text-primary font-black text-xl shadow-inner relative border border-white/5`}>
                                                {user.init}
                                                {user.role === 'owner' && (
                                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-surface rounded-full flex items-center justify-center border-2 border-background shadow-lg">
                                                        <Crown className="w-3.5 h-3.5 text-yellow-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-text-primary font-black text-[17px] tracking-tight">
                                                    {user.name} {user.isMe && <span className="text-text-primary/20 font-bold ml-1">(Te)</span>}
                                                </span>
                                                <div className="flex items-center gap-1.5 mt-1">
                                                    {user.role === 'owner' ? <Crown className="w-3 h-3 text-yellow-500/50" /> : <User className="w-3 h-3 text-text-primary/20" />}
                                                    <span className="text-text-primary/40 text-[11px] font-black uppercase tracking-wider">{Role[user.role as keyof typeof Role]}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isOwner && !user.isMe && (
                                            <button
                                                onClick={() => handleRemove(user.id)}
                                                disabled={removingId === user.id}
                                                className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-500/40 active:bg-red-500 active:text-text-primary transition-all"
                                            >
                                                {removingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-auto">
                <div className="bg-orange-500/10 p-6 rounded-[2rem] flex items-start gap-4 border border-orange-500/20 shadow-xl">
                    <ShieldAlert className="w-6 h-6 text-orange-500 shrink-0" />
                    <p className="text-orange-500/70 text-[11px] font-bold leading-relaxed uppercase tracking-tight">
                        A lakótársak és bérlők láthatják a méréseket és újakat rögzíthetnek, de az órák paramétereit és a ház alapadatait nem módosíthatják.
                    </p>
                </div>
            </motion.div>

            <InviteCodeSheet
                isOpen={isSheetOpen !== ''}
                onClose={() => setIsSheetOpen('')}
                inviteCode={isSheetOpen === "members" ? memberInviteCode : guestInviteCode}
                copied={copied}
                onCopy={() => handleCopy(isSheetOpen as "members" | "guests")}
            />
        </motion.div>
    );
}