"use strict";

import dbConnect from "@/lib/dbConnect";
import mongoose from "mongoose";
import Ticket from "@/models/ticket.model";
import House from "@/models/house.model";

export const TicketService = {
    async getTicketForHouse(houseId: string) {
        try {
            await dbConnect();
            const res = await Ticket.find({ houseId: new mongoose.Types.ObjectId(houseId) }).populate("createdBy", "name colorCode").populate("assignedTo", "name colorCode").lean();
            return { success: true, value: JSON.parse(JSON.stringify(res)) };
        } catch (error) {
            return { success: false, error: "Hiba a jegyek lekérése során" };
        }
    },

    async createTicket(data: { houseId: string, createdBy: string, title: string, description: string, priority: "low" | "medium" | "high" }) {
        try {
            await dbConnect();
            const house = await House.findById(data.houseId);
            if (!house) {
                return { success: false, error: "Ház nem található" };
            }
            const assignedTo = house.ownerId;
            const ticket = new Ticket({
                houseId: new mongoose.Types.ObjectId(data.houseId),
                createdBy: new mongoose.Types.ObjectId(data.createdBy),
                assignedTo: new mongoose.Types.ObjectId(assignedTo),
                title: data.title,
                description: data.description,
                priority: data.priority
            });
            const savedTicket = await ticket.save();
            return { success: true, value: JSON.parse(JSON.stringify(savedTicket)) };
        } catch (error) {
            return { success: false, error: "Hiba a jegy létrehozása során" };
        }
    },

    async getTicketById(id: string, userId: string) {
        try {
            await dbConnect();
            const ticket = await Ticket.findById(id).populate("createdBy", "name colorCode").populate("assignedTo", "name colorCode").lean();
            if (!ticket) {
                return { success: false, error: "Jegy nem található" };
            }
            // Ellenőrizd, hogy a jegyhez tartozó házban a user részt vesz-e
            const house = await House.findById(ticket.houseId);
            if (!house) {
                return { success: false, error: "Ház nem található" };
            }
            const isUserInHouse = house.ownerId.toString() === userId || house.members.some(memberId => memberId.toString() === userId);
            if (!isUserInHouse) {
                return { success: false, error: "Nincs jogosultságod ehhez a jegyhez" };
            }
            return { success: true, value: ticket };
        } catch (error) {
            return { success: false, error: (error as Error).message || "Hiba a jegy lekérése során" };
        }
    },

    async updateTicketStatus(id: string, status: "open" | "in_progress" | "closed", assignedId: string) {
        try {
            await dbConnect();
            const ticket = await Ticket.findOne({ $and: [{ _id: new mongoose.Types.ObjectId(id) }, { assignedTo: new mongoose.Types.ObjectId(assignedId) }] });
            if (!ticket) {
                return { success: false, error: "Jegy nem található" };
            }

            ticket.status = status;
            const updatedTicket = await ticket.save();
            return { success: true, value: updatedTicket };
        } catch (error) {
            return { success: false, error: (error as Error).message || "Hiba a jegy státuszának frissítése során" };
        }
    }
}