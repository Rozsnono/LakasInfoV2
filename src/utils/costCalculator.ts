export const calculateCost = (tierLimit: number, basePrice: number, marketPrice: number, amount: string | number) => {
    if (!tierLimit || !basePrice || !marketPrice) return 0;
    const val = typeof amount === "string" ? parseFloat(amount) : amount || 0;

    const limit = tierLimit;
    const discounted = Math.min(val, limit);
    const market = Math.max(0, val - limit);

    return Math.round(discounted * basePrice + market * marketPrice);
};