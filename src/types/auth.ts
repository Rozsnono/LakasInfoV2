
export interface RegisterInput {
    name: string;
    email: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    houseId?: string | null;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    token?: string;
    user?: {
        id: string;
        name: string;
        email: string;
        houseId?: string | null;
    };
}