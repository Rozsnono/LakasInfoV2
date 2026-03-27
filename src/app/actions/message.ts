"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { MessageService } from "@/services/message.service";
import { IMessageBase, IMessageDTO } from "@/models/message.modal";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

export interface GetMessageFilter {
    name?: string;
}

export async function getMessagesAction(filter: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const messageRes = await MessageService.getMessages('', payload.userId as string);
        const cleanMessageRes = (JSON.parse(JSON.stringify(messageRes.value)) as IMessageDTO[]).map(m => ({
            ...m,
            lastChat: m.messages[m.messages.length - 1]?.content || "",
            lastChatTime: m.messages[m.messages.length - 1]?.timestamp || "",
        }));
        return { success: true, value: cleanMessageRes };
    } catch (error) {
        return { success: false, error: (error as Error).message || "Hiba" };
    }
}

export async function getMessageableUsersAction() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const res = await MessageService.getMessageableUsers(payload.userId as string);
        return { success: true, value: JSON.parse(JSON.stringify(res.value)) };
    } catch {
        return { success: false, error: "Hiba" };
    }
}

export async function getMessageByIdAction(id: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const res = await MessageService.getMessageById(id, payload.userId as string);
        const chatDetails = JSON.parse(JSON.stringify(res.value)) as IMessageDTO;
        const cleanRes = {
            ...chatDetails,
            messages: chatDetails.messages.map(m => ({
                ...m,
                isMe: m.sender._id.toString() === payload.userId,
            }))
        };
        return { success: true, value: cleanRes };
    } catch {
        return { success: false, error: "Hiba" };
    }
}

export async function createMessageAction(members: string[], content: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const res = await MessageService.createMessage(members, content, payload.userId as string);
        return { success: true, value: JSON.parse(JSON.stringify(res.value)) };
    } catch {
        return { success: false, error: "Hiba" };
    }
}

export async function sendMessageAction(chatId: string, content: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const res = await MessageService.addMessage(chatId, content, payload.userId as string);
        return { success: true, value: JSON.parse(JSON.stringify(res.value)) };
    } catch {
        return { success: false, error: "Hiba" };
    }
}