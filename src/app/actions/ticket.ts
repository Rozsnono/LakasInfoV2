"use server";

import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose"; // Hozzáadtuk a SignJWT-t is
import { ITicket } from "@/models/ticket.model";
import { HouseService } from "@/services/house.service";
import { TicketService } from "@/services/ticket.service";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "valami-titkos-kulcs");

export async function getTicketsForHouseAction(): Promise<{ success: boolean; value?: ITicket[]; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };

        const { payload } = await jwtVerify(token, JWT_SECRET);
        const houseRes = await HouseService.getHouseDetailsByUserId(payload.userId as string);

        if (!houseRes.success || !houseRes.house) return { success: false, error: "No house" };

        const tickets = await TicketService.getTicketForHouse(houseRes.house._id.toString());
        return JSON.parse(JSON.stringify(tickets));
    } catch {
        return { success: false, error: "Hiba" };
    }
}

export async function createTicketAction(data: { title: string, description: string, priority: "low" | "medium" | "high" }): Promise<{ success: boolean; value?: ITicket; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const houseRes = await HouseService.getHouseDetailsByUserId(payload.userId as string);
        if (!houseRes.success || !houseRes.house) return { success: false, error: "No house" };
        const ticketRes = await TicketService.createTicket({
            houseId: houseRes.house._id.toString(),
            createdBy: payload.userId as string,
            title: data.title,
            description: data.description,
            priority: data.priority
        });
        if (!ticketRes.success) return { success: false, error: ticketRes.error };
        return { success: true, value: ticketRes.value };
    } catch (error) {
        return { success: false, error: (error as Error).message || "Hiba" };
    }
}

export async function getTicketByIdAction(id: string): Promise<{ success: boolean; value?: ITicket; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const ticketRes = await TicketService.getTicketById(id, payload.userId as string);
        if (!ticketRes.success) return { success: false, error: ticketRes.error };
        return { success: true, value: JSON.parse(JSON.stringify(ticketRes.value)) };
    } catch (error) {
        return { success: false, error: (error as Error).message || "Hiba" };
    }
}

export async function updateTicketStatusAction(id: string, status: "open" | "in_progress" | "closed"): Promise<{ success: boolean; value?: ITicket; error?: string }> {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return { success: false, error: "Unauthorized" };
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const ticketRes = await TicketService.updateTicketStatus(id, status, payload.userId as string);
        if (!ticketRes.success) return { success: false, error: ticketRes.error };
        return { success: true, value: JSON.parse(JSON.stringify(ticketRes.value)) };
    }
    catch (error) {
        return { success: false, error: (error as Error).message || "Hiba" };
    }
}