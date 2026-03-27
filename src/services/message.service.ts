import dbConnect from "@/lib/dbConnect"; // Feltételezve, hogy itt van az adatbázis csatlakozásod
import House from "@/models/house.model";
import Message from "@/models/message.modal";
import { ObjectId } from "mongodb";

export class MessageService {
    static async getMessages(filter: string, userId: string) {
        await dbConnect();
        const messages = await Message.find({ members: { $in: [new ObjectId(userId)] } });
        if (!messages) return { success: false, error: "Nincs üzenet" };
        return { success: true, value: messages };
    }

    static async getMessageById(messageId: string, userId: string) {
        await dbConnect();
        const message = await Message.findOne({ _id: new ObjectId(messageId), members: { $in: [new ObjectId(userId)] } }).populate("members", "name email colorCode").populate("messages.sender", "name colorCode");
        if (!message) return { success: false, error: "Nincs üzenet" };
        return { success: true, value: message };
    }

    static async createMessage(members: string[], content: string, senderId: string) {
        await dbConnect();
        const newMessage = new Message({
            members: members.map(id => new ObjectId(id)).concat(new ObjectId(senderId)),
            messages: [{ sender: new ObjectId(senderId), content, timestamp: new Date() }]
        });
        await newMessage.save();
        return { success: true, value: newMessage };
    }

    static async addMessage(messageId: string, content: string, senderId: string) {
        await dbConnect();
        const message = await Message.findById(messageId);
        if (!message) return { success: false, error: "Nincs üzenet" };
        message.messages.push({ sender: new ObjectId(senderId), content, timestamp: new Date() });
        await message.save();
        return { success: true, value: message };
    }

    static async getMessageableUsers(userId: string) {
        await dbConnect();
        const house = await House.findOne({ members: { $in: [new ObjectId(userId)] } }).populate("members", "_id name email colorCode");
        if (!house) return { success: false, error: "Nincs ház" };
        return { success: true, value: house.members.filter(member => member._id.toString() !== userId) };
    }
}