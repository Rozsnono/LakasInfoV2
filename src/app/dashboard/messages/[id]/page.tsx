"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ArrowLeft, Send, Loader2, Info, MessageSquare, ChevronDown } from "lucide-react";
import Link from "@/contexts/router.context";
import { useParams } from "next/navigation";
import { useUser } from "@/contexts/user.context";
import { useAction } from "@/providers/action.provider";
import { getMessageByIdAction, sendMessageAction } from "@/app/actions/message";
import MessageInfoSheet from "@/components/MessageInfoSheet"; // A te importod!
import { IMessageDetailDTO } from "@/models/message.modal";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export default function ChatRoomClient() {
    const { id: chatId } = useParams() as { id: string };
    const { user } = useUser();

    const [newMessage, setNewMessage] = useState("");
    const [isSending, setIsSending] = useState(false);

    // --- ÚJ ÁLLAPOT AZ INFO SHEETHEZ ---
    const [isInfoSheetOpen, setIsInfoSheetOpen] = useState(false);

    // --- ÁLLAPOTOK A GÖRGETÉSHEZ ---
    const [showScrollButton, setShowScrollButton] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevMsgCount = useRef(0);
    const isInitialLoad = useRef(true);

    const { data, isPending, error, execute: refreshChat } = useAction(
        getMessageByIdAction,
        {
            immediate: true,
            initialArgs: [chatId],
            condition: !!chatId && !!user?._id,
            repeatDelay: 3000,
        }
    );

    const chatDetails = useMemo(() => {
        if (!data?.success || !data.value) return null;
        return data.value;
    }, [data]);

    const messages = useMemo(() => {
        return chatDetails?.messages || [];
    }, [chatDetails]);

    const isGroupChat = (chatDetails?.members?.length || 0) > 2;

    // --- GÖRGETÉS LOGIKA ---
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    };

    const handleScroll = () => {
        if (!chatContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
        setShowScrollButton(!isNearBottom);
    };

    useEffect(() => {
        const currentCount = messages.length;

        if (isInitialLoad.current && currentCount > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView();
                isInitialLoad.current = false;
            }, 100);
        }
        else if (currentCount > prevMsgCount.current) {
            if (!showScrollButton) {
                setTimeout(() => scrollToBottom(), 50);
            }
        }

        prevMsgCount.current = currentCount;
    }, [messages, showScrollButton]);

    // --- ÜZENET KÜLDÉSE ---
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            await sendMessageAction(chatId, newMessage.trim());
            setNewMessage("");
            await refreshChat(chatId);
            setTimeout(() => scrollToBottom(), 50);
        } catch (error) {
            console.error("Hiba az üzenet küldésekor:", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative h-[100dvh] px-4 pt-12 pb-6 flex flex-col gap-6 overflow-hidden"
        >

            {/* Fejléc */}
            <motion.header variants={itemVariants} className="relative z-10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/messages" className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform">
                        <ArrowLeft className="w-5 h-5 text-text-primary" />
                    </Link>
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-black text-text-primary tracking-tight uppercase italic leading-none">
                            {chatDetails ? 'Beszélgetés' : "Betöltés..."}
                        </h1>
                        <span className="text-primary text-[10px] font-bold uppercase tracking-widest mt-1">
                            {isGroupChat ? "Közös Beszélgetés" : "Privát Beszélgetés"}
                        </span>
                    </div>
                </div>

                {/* ---> INFO GOMB BEKÖTÉSE <--- */}
                <button
                    onClick={() => setIsInfoSheetOpen(true)}
                    className="w-10 h-10 rounded-full bg-surface-elevated flex items-center justify-center border border-white/5 shadow-xl active:scale-90 transition-transform"
                >
                    <Info className="w-5 h-5 text-text-primary/60" />
                </button>
            </motion.header>

            {/* Chat Doboz */}
            <motion.main variants={itemVariants} className="bg-surface rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col overflow-hidden relative flex-1">

                <div
                    ref={chatContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 overflow-y-auto no-scrollbar p-4 flex flex-col"
                >
                    <AnimatePresence mode="popLayout">
                        {isPending && !data ? (
                            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-4">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-text-primary/40 text-[10px] font-bold uppercase tracking-widest">Szinkronizálás...</p>
                            </motion.div>
                        ) : error ? (
                            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                                <p className="text-red-400 text-sm font-bold">Hiba az üzenetek lekérésekor.</p>
                                <button onClick={() => refreshChat(chatId)} className="text-primary text-[10px] font-black uppercase tracking-widest underline">Újra</button>
                            </motion.div>
                        ) : messages.length === 0 ? (
                            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full gap-3 opacity-30">
                                <MessageSquare className="w-10 h-10 text-text-primary/50" />
                                <span className="text-text-primary text-[10px] font-black uppercase tracking-widest text-center">Nincsenek üzenetek.<br />Kezdj el gépelni!</span>
                            </motion.div>
                        ) : (
                            messages.map((msg: typeof messages[0], index: number) => {
                                const prevMsg = index > 0 ? messages[index - 1] : null;
                                const nextMsg = index < messages.length - 1 ? messages[index + 1] : null;

                                const isPrevSameSender = prevMsg && prevMsg.isMe === msg.isMe && prevMsg.sender?._id === msg.sender?._id;
                                const isNextSameSender = nextMsg && nextMsg.isMe === msg.isMe && nextMsg.sender?._id === msg.sender?._id;

                                const isFirstInGroup = !isPrevSameSender;
                                const isLastInGroup = !isNextSameSender;

                                const showSenderName = isGroupChat && !msg.isMe && isFirstInGroup;
                                const showAvatar = isGroupChat && !msg.isMe && isLastInGroup;
                                const showTimestamp = isLastInGroup;

                                const marginBottom = isLastInGroup ? 'mb-5' : 'mb-1';

                                let bubbleRadius = "";
                                if (msg.isMe) {
                                    bubbleRadius = `rounded-l-[1.5rem] ${isPrevSameSender ? 'rounded-tr-[0.25rem]' : 'rounded-tr-[1.5rem]'} ${isNextSameSender ? 'rounded-br-[0.25rem]' : 'rounded-br-[0.5rem]'}`;
                                } else {
                                    bubbleRadius = `rounded-r-[1.5rem] ${isPrevSameSender ? 'rounded-tl-[0.25rem]' : 'rounded-tl-[1.5rem]'} ${isNextSameSender ? 'rounded-bl-[0.25rem]' : 'rounded-bl-[0.5rem]'}`;
                                }

                                return (
                                    <motion.div
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex flex-col max-w-[85%] ${msg.isMe ? 'self-end items-end' : 'self-start items-start'} ${marginBottom}`}
                                    >
                                        {showSenderName && (
                                            <span className="text-[10px] font-bold text-text-secondary/60 mb-1 ml-10">
                                                {msg.sender.name}
                                            </span>
                                        )}

                                        <div className="flex items-end gap-2">
                                            {isGroupChat && !msg.isMe && (
                                                showAvatar ? (
                                                    <div
                                                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[12px] font-black shadow-lg text-white border border-white/10"
                                                        style={{ backgroundColor: msg.sender.colorCode || '#333' }}
                                                    >
                                                        {msg.sender.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().substring(0, 2)}
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 shrink-0" />
                                                )
                                            )}

                                            <div
                                                className={`px-5 py-3.5 shadow-xl relative ${bubbleRadius} ${msg.isMe
                                                    ? 'bg-primary text-white'
                                                    : 'bg-surface-elevated border border-white/5 text-text-primary'
                                                    }`}
                                            >
                                                <p className="text-sm font-medium leading-relaxed break-words">
                                                    {msg.content}
                                                </p>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {showTimestamp && (
                                                <motion.span
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    className={`text-[9px] font-bold uppercase tracking-widest text-text-secondary/40 mt-1.5 ${msg.isMe ? 'mr-2' : 'ml-12'}`}
                                                >
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} className="h-1 shrink-0" />
                </div>

                <AnimatePresence>
                    {showScrollButton && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            onClick={scrollToBottom}
                            className="absolute bottom-4 right-4 w-10 h-10 bg-surface-elevated border border-white/10 rounded-full shadow-2xl flex items-center justify-center text-primary z-50 backdrop-blur-xl active:scale-90 transition-transform"
                        >
                            <ChevronDown className="w-6 h-6" />
                        </motion.button>
                    )}
                </AnimatePresence>

            </motion.main>

            {/* Szövegbeviteli sáv */}
            <motion.div variants={itemVariants} className="shrink-0 mt-auto z-10">
                <form
                    onSubmit={handleSendMessage}
                    className="flex items-end gap-2 bg-surface p-2 rounded-[2.5rem] border border-white/5 shadow-2xl"
                >
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder="Írd ide az üzenetet..."
                        className="flex-1 bg-transparent text-text-primary font-medium placeholder:text-text-primary/30 resize-none outline-none py-4 px-5 max-h-[120px] min-h-[50px] text-sm no-scrollbar"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="w-12 h-12 mb-0.5 mr-0.5 rounded-full shrink-0 flex items-center justify-center bg-primary text-white shadow-[0_0_15px_rgba(var(--primary),0.4)] active:scale-90 transition-all disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                    >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                    </button>
                </form>
            </motion.div>

            {/* ---> A MESSAGE INFO SHEET MEGHÍVÁSA <--- */}
            <MessageInfoSheet
                isOpen={isInfoSheetOpen}
                onClose={() => setIsInfoSheetOpen(false)}
                chatDetails={chatDetails as unknown as IMessageDetailDTO}
            />

        </motion.div>
    );
}