import { Types } from "mongoose";

export interface CreateHouseInput {
    name: string;
    address?: string;
    ownerId: string;
    inviteCode?: string;
}

export interface JoinHouseInput {
    inviteCode: string;
    userId: string;
}

export interface HouseResponse {
    success: boolean;
    message?: string;
    houseId?: string;
    inviteCode?: string;
}