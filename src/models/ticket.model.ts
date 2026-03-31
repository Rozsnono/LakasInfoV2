import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Tiszta adat-interfész (Mongoose sallangok nélkül)
 */
export interface ITicketBase {
    _id: mongoose.Types.ObjectId | string;
    createdBy: mongoose.Types.ObjectId;
    houseId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    status: 'open' | 'in_progress' | 'closed';
    priority: 'low' | 'medium' | 'high';
    assignedTo?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}


/**
 * Mongoose Dokumentum interfész (ez kiterjeszti az alapot és a Document-et)
 */
export interface ITicket extends ITicketBase, Document {
    _id: mongoose.Types.ObjectId
}

const TicketSchema: Schema<ITicket> = new Schema(
    {
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
        houseId: { type: Schema.Types.ObjectId, ref: "House", required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        status: { type: String, enum: ['open', 'in_progress', 'closed'], default: 'open' },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true, versionKey: false }
);

const Ticket: Model<ITicket> = mongoose.models.Ticket || mongoose.model<ITicket>("Ticket", TicketSchema);

export default Ticket;