import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Tiszta adat-interfész (Mongoose sallangok nélkül)
 */
export interface IMessageBase {
    _id: mongoose.Types.ObjectId | string;
    members: mongoose.Types.ObjectId[];
    messages: {
        sender: mongoose.Types.ObjectId;
        content: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageDTO extends Omit<IMessageBase, 'members' | 'messages'> {
    lastChat: string;
    lastChatTime: string;
    members: {
        _id: mongoose.Types.ObjectId | string;
        name: string;
        colorCode: string;
    }[];
    messages: {
        sender: {
            _id: mongoose.Types.ObjectId | string;
            name: string;
            colorCode: string;
        };
        content: string;
        timestamp: Date;
        isMe: boolean;
    }[];
}

export interface IMessageDetailDTO extends Omit<IMessageBase, 'members' | 'messages'> {
    _id: mongoose.Types.ObjectId | string;
    members: {
        _id: mongoose.Types.ObjectId | string;
        name: string;
        colorCode: string;
    }[];
    messages: {
        sender: mongoose.Types.ObjectId;
        content: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Dokumentum interfész (ez kiterjeszti az alapot és a Document-et)
 */
export interface IMessage extends IMessageBase, Document {
    _id: mongoose.Types.ObjectId
}

const MessageSchema: Schema<IMessage> = new Schema(
    {
        members: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
        messages: [
            {
                sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
                content: { type: String, required: true },
                timestamp: { type: Date, default: Date.now }
            }
        ],
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now }
    },
    { timestamps: true, versionKey: false }
);

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;