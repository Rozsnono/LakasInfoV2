
export interface SubscriptionResponse {
    success: boolean;
    message?: string;
}

export interface SubscriptionStatus {
    plan: "free" | "pro" | "enterprise";
    isActive: boolean;
    expiresAt: Date | null;
}

export interface SubscriptionInput {
    userId: string;
    plan: "free" | "pro" | "enterprise";
    type: "monthly" | "yearly";
    paymentMethodId?: string; // Stripe Payment Method ID, csak Pro és Enterprise esetén kötelező
}

export const getSubscriptionStatusTitle = (plan: "free" | "pro" | "enterprise") => {
    switch (plan) {
        case "free":
            return "Alap";
        case "pro":
            return "Pro";
        case "enterprise":
            return "Enterprise";
        default:
            return "Alap";
    }
};