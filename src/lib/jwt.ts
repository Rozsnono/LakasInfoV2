import jwt from "jsonwebtoken";
import { JWTPayload } from "@/types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "valami-nagyon-titkos-kulcs";

export const signToken = (payload: JWTPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): JWTPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
        return null;
    }
};