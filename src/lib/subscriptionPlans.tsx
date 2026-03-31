import { Crown, ShieldCheck, Building, Gem } from "lucide-react"; // Ne felejtsd el beimportálni a Building ikont!

export const PLANS = [
    {
        id: "free",
        name: "Alap Csomag",
        badge: (cond: boolean) => cond ? "Jelenlegi" : 'Ingyenes',
        description: "Kezdő háztartásoknak, az alapvető rezsi követéséhez.",
        priceMonthly: 0,
        priceYearly: 0,
        features: [
            "Maximum 3 mérőóra kezelése",
            "Alap havi statisztikák",
            "1 lakótárs meghívása",
            "Csak kézi óraállás rögzítés"
        ],
        buttonText: (cond: boolean) => cond ? "Jelenlegi Csomagod" : "Váltás Ingyenes Csomagra",
        isPopular: false,
        icon: <ShieldCheck className="w-6 h-6 text-text-primary/40" />
    },
    {
        id: "pro",
        name: "Pro Modell",
        badge: (cond: boolean) => cond ? "Jelenlegi" : "Legnépszerűbb",
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
        buttonText: (cond: boolean) => cond ? "Jelenlegi Csomagod" : "Váltás Pro Csomagra",
        isPopular: true,
        icon: <Gem className="w-6 h-6 text-yellow-400" />
    },
    {
        id: "enterprise",
        name: "Enterprise",
        badge: (cond: boolean) => cond ? "Jelenlegi" : "Bérbeadóknak",
        description: "Ideális befektetőknek. Több ingatlan, bérlőkezelés és automatizált adminisztráció.",
        priceMonthly: 3990,
        priceYearly: 39900, // 2 hónap ingyen itt is!
        features: [
            "Minden Pro funkció",
            "Több ingatlan (háztartás) egyidejű kezelése",
            "Bérlők meghívása és szeparált jogosultságok",
            "Hivatalos átadás-átvételi jegyzőkönyvek",
            "Beépített hibabejelentő (Ticketing) rendszer",
            "Bérleti díj és elszámolás automatizálása"
        ],
        buttonText: (cond: boolean) => cond ? "Jelenlegi Csomagod" : "Váltás Enterprise Csomagra",
        isPopular: false,
        icon: <Crown className="w-6 h-6 text-emerald-400" />
    }
];