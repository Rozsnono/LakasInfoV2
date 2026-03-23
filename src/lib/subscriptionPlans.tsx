import { Crown, ShieldCheck, Building } from "lucide-react"; // Ne felejtsd el beimportálni a Building ikont!

export const PLANS = [
    {
        id: "free",
        name: "Alap Csomag",
        badge: "Jelenlegi",
        description: "Kezdő háztartásoknak, az alapvető rezsi követéséhez.",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Maximum 2 mérőóra kezelése",
            "Alap havi statisztikák",
            "1 lakótárs meghívása",
            "Csak kézi óraállás rögzítés"
        ],
        buttonText: "Jelenlegi Csomagod",
        isPopular: false,
        icon: <ShieldCheck className="w-6 h-6 text-white/40" />
    },
    {
        id: "pro",
        name: "Pro Modell",
        badge: "Legnépszerűbb",
        description: "Teljes kontroll, AI előrejelzések és korlátlan funkciók.",
        priceMonthly: 1490,
        priceYearly: 14900, // 2 hónap ingyen!
        features: [
            "Korlátlan mérőóra kezelése",
            "Kamerás QR/Vonalkód szkennelés",
            "PDF és CSV adat exportálás",
            "Korlátlan lakótárs meghívása",
            "Intelligens fogyasztás-előrejelzés",
            "Kiemelt ügyfélszolgálat"
        ],
        buttonText: "Váltás Pro Csomagra",
        isPopular: true,
        icon: <Crown className="w-6 h-6 text-yellow-400" />
    }
];