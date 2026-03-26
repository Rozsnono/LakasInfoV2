"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Bell, Zap, Droplets, CheckCircle, ChevronLeft,
    AlertTriangle, Info, Loader2, CheckCheck
} from "lucide-react";
import {
    getNotificationsAction,
    markAsReadAction,
    markAllAsReadAction
} from "@/app/actions/notification";

interface NotificationsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

interface NotificationData {
    _id: string;
    title: string;
    message: string;
    type: "info" | "warning" | "danger";
    isRead: boolean;
    createdAt: string;
}

const sheetVariants: Variants = {
    hidden: { y: "100%" },
    visible: {
        y: 0,
        transition: { type: "spring", damping: 25, stiffness: 200 },
    },
    exit: {
        y: "100%",
        transition: { duration: 0.3 },
    },
};

export default function NotificationsSheet({ isOpen, onClose }: NotificationsSheetProps) {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Adatok betöltése
    const loadNotifications = async () => {
        setIsLoading(true);
        const res = await getNotificationsAction();
        if (res.success) {
            setNotifications(res.notifications);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadNotifications();
        }
    }, [isOpen]);

    // Egy értesítés olvasottnak jelölése
    const handleMarkAsRead = async (id: string) => {
        // Optimista frissítés a UI-on
        setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
        await markAsReadAction(id);
    };

    // Összes olvasottnak jelölése
    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markAllAsReadAction();
    };

    // Ikon és szín választó a típus alapján
    const getNotificationVisuals = (type: string) => {
        switch (type) {
            case "danger":
                return { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, color: "text-red-500" };
            case "warning":
                return { icon: <Zap className="w-5 h-5 text-yellow-500" />, color: "text-yellow-500" };
            default:
                return { icon: <Info className="w-5 h-5 text-blue-500" />, color: "text-blue-500" };
        }
    };

    // Dátum formázó (pl. Ma, 10:20)
    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
            return `Ma, ${date.toLocaleTimeString('hu-HU', { hour: '2-digit', minute: '2-digit' })}`;
        }
        return date.toLocaleDateString('hu-HU', { month: 'long', day: 'numeric' });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-surface/80 backdrop-blur-md z-[150]"
                    />
                    <motion.div
                        variants={sheetVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="fixed bottom-0 left-0 right-0 bg-surface border-t border-white/10 rounded-t-[3rem] z-[151] px-6 pt-4 pb-12 shadow-2xl max-h-[85vh] flex flex-col"
                    >
                        <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8 shrink-0" />

                        <div className="flex items-center justify-between mb-8 px-2 shrink-0">
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center active:scale-90 transition-transform"
                            >
                                <ChevronLeft className="w-6 h-6 text-text-primary" />
                            </button>

                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-black tracking-tight text-text-primary uppercase italic">Értesít<span className="text-primary">ések</span></h3>
                            </div>

                            <button
                                onClick={handleMarkAllRead}
                                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center active:scale-90 transition-transform"
                                title="Összes olvasott"
                            >
                                <CheckCheck className="w-5 h-5 text-primary" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-hide">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <span className="text-[10px] font-black text-text-primary/20 uppercase tracking-[0.2em]">Betöltés...</span>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                    <CheckCircle size={48} className="mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">Minden rendben!<br />Nincs új értesítés.</p>
                                </div>
                            ) : (
                                notifications.map((notif) => {
                                    const { icon } = getNotificationVisuals(notif.type);
                                    return (
                                        <NotificationItem
                                            key={notif._id}
                                            icon={icon}
                                            title={notif.title}
                                            desc={notif.message}
                                            time={formatTime(notif.createdAt)}
                                            isUnread={!notif.isRead}
                                            onClick={() => handleMarkAsRead(notif._id)}
                                        />
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

interface NotificationItemProps {
    icon: React.ReactNode;
    title: string;
    desc: string;
    time: string;
    isUnread?: boolean;
    onClick: () => void;
}

function NotificationItem({ icon, title, desc, time, isUnread, onClick }: NotificationItemProps) {
    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`w-full p-6 rounded-[2.5rem] border flex gap-5 text-left transition-all relative group ${isUnread
                    ? "bg-white/[0.07] border-white/10 shadow-lg"
                    : "bg-transparent border-white/5 opacity-60"
                }`}
        >
            {isUnread && (
                <div className="absolute top-6 right-6 w-2 h-2 bg-primary rounded-full shadow-[0_0_12px_rgba(255,59,48,0.6)]" />
            )}

            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border border-white/5 group-active:scale-90 transition-transform shadow-inner ${isUnread ? "bg-surface-elevated" : "bg-white/5"
                }`}>
                {icon}
            </div>

            <div className="flex flex-col gap-1 pr-4">
                <span className={`font-black text-[17px] tracking-tight leading-tight ${isUnread ? "text-text-primary" : "text-text-primary/70"
                    }`}>{title}</span>
                <p className="text-text-primary/40 text-sm font-semibold leading-snug">{desc}</p>
                <span className="text-[10px] font-black uppercase tracking-widest text-text-primary/20 mt-2">{time}</span>
            </div>
        </motion.button>
    );
}