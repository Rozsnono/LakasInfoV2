"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettingsAction, updateSettingsAction } from "@/app/actions/settings";

export const WALLPAPERS = [
    { id: "v1", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #490c25 100%)" },
    { id: "v2", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #0c1b40 100%)" },
    { id: "v3", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #200b38 100%)" },
    { id: "v4", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #062e22 100%)" },
    { id: "v5", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #082d38 100%)" },
    { id: "v6", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #40100c 100%)" },
    { id: "v7", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #362208 100%)" },
    { id: "v8", category: "Világító", css: "radial-gradient(at 50% 0%, #020617 0%, #12103b 100%)" },
    { id: "a1", category: "Absztrakt", css: "linear-gradient(-45deg, #020617, #1e1b4b, #312e81, #020617)", animated: true },
    { id: "a2", category: "Absztrakt", css: "radial-gradient(circle at 20% 30%, #4c1d95 0%, transparent 50%), radial-gradient(circle at 80% 70%, #2e1065 0%, transparent 50%), #000", animated: true },
    { id: "a3", category: "Absztrakt", css: "radial-gradient(ellipse at 50% 50%, #1e3a8a 0%, #020617 60%, #000 100%)", animated: true },
    { id: "a4", category: "Absztrakt", css: "linear-gradient(115deg, #020617, #064e3b, #0ea5e9, #020617)", animated: true },
    { id: "a5", category: "Absztrakt", css: "radial-gradient(circle at 0% 0%, #334155 0%, transparent 40%), radial-gradient(circle at 100% 100%, #1e293b 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0f172a 0%, transparent 60%), #000", animated: true },
    { id: "a6", category: "Absztrakt", css: "radial-gradient(circle at 80% 20%, #701a75 0%, transparent 50%), radial-gradient(circle at 20% 80%, #4a044e 0%, transparent 50%), #020617", animated: true },
    { id: "a7", category: "Absztrakt", css: "radial-gradient(ellipse at 0% 100%, #7f1d1d 0%, #450a0a 40%, #000 80%)", animated: true },
    { id: "a8", category: "Absztrakt", css: "radial-gradient(circle at 100% 0%, #059669 0%, transparent 60%), radial-gradient(circle at 0% 100%, #0891b2 0%, transparent 60%), #020617", animated: true },
    { id: "s1", category: "Színek", css: "radial-gradient(circle at 10% 20%, #3b82f6 0%, transparent 40%), radial-gradient(circle at 90% 80%, #ec4899 0%, transparent 40%), radial-gradient(circle at 50% 50%, #8b5cf6 0%, transparent 60%), #000", animated: true },
    { id: "s2", category: "Színek", css: "radial-gradient(circle at 0% 100%, #ea580c 0%, transparent 50%), radial-gradient(circle at 100% 0%, #ca8a04 0%, transparent 50%), radial-gradient(circle at 50% 50%, #b91c1c 0%, transparent 60%), #020617", animated: true },
    { id: "s3", category: "Színek", css: "radial-gradient(circle at 80% 20%, #10b981 0%, transparent 45%), radial-gradient(circle at 20% 80%, #06b6d4 0%, transparent 45%), radial-gradient(circle at 50% 50%, #1e3a8a 0%, transparent 60%), #000", animated: true },
    { id: "s4", category: "Színek", css: "radial-gradient(circle at 0% 0%, #00ffcc 0%, transparent 35%), radial-gradient(circle at 100% 100%, #a855f7 0%, transparent 35%), radial-gradient(circle at 50% 50%, #4c1d95 0%, transparent 60%), #050505", animated: true },
    { id: "s5", category: "Színek", css: "radial-gradient(circle at 10% 90%, #0c4a6e 0%, transparent 50%), radial-gradient(circle at 90% 10%, #1e3a8a 0%, transparent 50%), radial-gradient(circle at 50% 50%, #042f2e 0%, transparent 60%), #020617", animated: true },
    { id: "s6", category: "Színek", css: "radial-gradient(circle at 20% 20%, #991b1b 0%, transparent 40%), radial-gradient(circle at 80% 80%, #f59e0b 0%, transparent 40%), radial-gradient(circle at 50% 50%, #450a0a 0%, transparent 70%), #000", animated: true },
    { id: "s7", category: "Színek", css: "radial-gradient(circle at 0% 50%, #4c1d95 0%, transparent 40%), radial-gradient(circle at 100% 50%, #be185d 0%, transparent 40%), radial-gradient(circle at 50% 0%, #1e3a8a 0%, transparent 50%), #020617", animated: true },
    { id: "s8", category: "Színek", css: "radial-gradient(circle at 100% 100%, #14b8a6 0%, transparent 50%), radial-gradient(circle at 0% 0%, #db2777 0%, transparent 50%), radial-gradient(circle at 50% 50%, #172554 0%, transparent 60%), #000", animated: true },
    { id: "u1", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\"), linear-gradient(135deg, #0f172a 0%, #000 100%)" },
    { id: "u2", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\"), linear-gradient(135deg, #450a0a 0%, #000 100%)" },
    { id: "u3", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\"), linear-gradient(135deg, #064e3b 0%, #000 100%)" },
    { id: "u4", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\"), linear-gradient(135deg, #1e1b4b 0%, #000 100%)" },
    { id: "u5", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.5' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\"), linear-gradient(135deg, #422006 0%, #000 100%)" },
    { id: "u6", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\"), linear-gradient(135deg, #171717 0%, #000 100%)" },
    { id: "u7", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.4' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E\"), #000" },
    { id: "u8", category: "Egyszerű", css: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\"), linear-gradient(to bottom, #111, #000)" },
    { id: "m1", category: "Minimalista", css: "linear-gradient(to bottom, #0a0a0a, #000)" },
    { id: "m2", category: "Minimalista", css: "linear-gradient(to bottom, #171717, #0a0a0a)" },
    { id: "m3", category: "Minimalista", css: "linear-gradient(to bottom, #020617, #000)" },
    { id: "m4", category: "Minimalista", css: "#000" },
    { id: "m5", category: "Minimalista", css: "radial-gradient(circle at center, #1a1a1a 0%, #000 100%)" },
    { id: "m6", category: "Minimalista", css: "linear-gradient(180deg, #0c0a09 0%, #000 100%)" },
    { id: "m7", category: "Minimalista", css: "linear-gradient(to right, #000, #111, #000)" },
    { id: "m8", category: "Minimalista", css: "linear-gradient(45deg, #050505, #111)" },
    { id: "p1", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,1000 C300,600 400,200 1000,0 L1000,1000 Z' fill='%23000000' opacity='0.25'/%3E%3Cpath d='M0,1000 C300,800 600,500 1000,400 L1000,1000 Z' fill='%23ffffff' opacity='0.05'/%3E%3Cpath d='M0,1000 C500,1000 700,700 1000,600 L1000,1000 Z' fill='%23000000' opacity='0.3'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)" },
    { id: "p2", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,500 C400,300 600,800 1000,200 L1000,1000 L0,1000 Z' fill='%23ffffff' opacity='0.04'/%3E%3Cpath d='M0,800 C300,900 700,400 1000,600 L1000,1000 L0,1000 Z' fill='%23000000' opacity='0.3'/%3E%3Cpath d='M0,0 C400,400 600,-100 1000,300 L1000,0 Z' fill='%23ffffff' opacity='0.05'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(to bottom right, #4a044e 0%, #be185d 100%)" },
    { id: "p3", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,1000 C200,500 800,900 1000,300 L1000,1000 Z' fill='%23000000' opacity='0.2'/%3E%3Cpath d='M0,1000 C500,800 500,200 1000,0 L1000,1000 Z' fill='%23ffffff' opacity='0.06'/%3E%3Cpath d='M0,300 C300,100 700,600 1000,400 L1000,1000 L0,1000 Z' fill='%23000000' opacity='0.25'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 0% 100%, #082f49 0%, #0284c7 100%)" },
    { id: "p4", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M1000,1000 C700,500 300,800 0,200 L0,1000 Z' fill='%23000000' opacity='0.3'/%3E%3Cpath d='M1000,1000 C500,900 400,400 0,600 L0,1000 Z' fill='%23ffffff' opacity='0.05'/%3E%3Cpath d='M1000,0 C600,400 300,100 0,300 L0,0 Z' fill='%23ffffff' opacity='0.03'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(115deg, #064e3b 0%, #10b981 100%)" },
    { id: "p5", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,600 C400,600 600,200 1000,200 L1000,1000 L0,1000 Z' fill='%23000000' opacity='0.25'/%3E%3Cpath d='M1000,800 C600,800 400,400 0,400 L0,1000 L1000,1000 Z' fill='%23ffffff' opacity='0.05'/%3E%3Cpath d='M500,1000 C500,600 800,800 1000,400 L1000,1000 Z' fill='%23000000' opacity='0.2'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(to top right, #7c2d12 0%, #ea580c 50%, #f59e0b 100%)" },
    { id: "p6", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,1000 C300,600 400,200 1000,0 L1000,1000 Z' fill='%23000000' opacity='0.3'/%3E%3Cpath d='M0,1000 C300,800 600,500 1000,400 L1000,1000 Z' fill='%23ffffff' opacity='0.04'/%3E%3Cpath d='M0,1000 C500,1000 700,700 1000,600 L1000,1000 Z' fill='%23000000' opacity='0.35'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(ellipse at center, #334155 0%, #0f172a 100%)" },
    { id: "p7", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M0,500 C400,300 600,800 1000,200 L1000,1000 L0,1000 Z' fill='%23ffffff' opacity='0.03'/%3E%3Cpath d='M0,800 C300,900 700,400 1000,600 L1000,1000 L0,1000 Z' fill='%23000000' opacity='0.35'/%3E%3Cpath d='M0,0 C400,400 600,-100 1000,300 L1000,0 Z' fill='%23ffffff' opacity='0.04'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(180deg, #450a0a 0%, #991b1b 100%)" },
    { id: "p8", category: "Prémium", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cpath d='M1000,1000 C700,500 300,800 0,200 L0,1000 Z' fill='%23000000' opacity='0.25'/%3E%3Cpath d='M1000,1000 C500,900 400,400 0,600 L0,1000 Z' fill='%23ffffff' opacity='0.06'/%3E%3Cpath d='M1000,0 C600,400 300,100 0,300 L0,0 Z' fill='%23ffffff' opacity='0.04'/%3E%3C/svg%3E\") center/cover no-repeat, linear-gradient(-45deg, #042f2e 0%, #0d9488 100%)" },
    { id: "g1", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #334155 0%, #0f172a 100%)" },
    { id: "g2", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #ca8a04 0%, #713f12 100%)" },
    { id: "g3", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #52525b 0%, #1c1917 100%)" },
    { id: "g4", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #0f766e 0%, #042f2e 100%)" },
    { id: "g5", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #b91c1c 0%, #450a0a 100%)" },
    { id: "g6", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #2563eb 0%, #1e3a8a 100%)" },
    { id: "g7", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #c2410c 0%, #7c2d12 100%)" },
    { id: "g8", category: "Groove", css: "radial-gradient(circle at 50% 50%, transparent 10%, rgba(0,0,0,0.9) 110%), repeating-linear-gradient(to right, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.1) 2px, rgba(255,255,255,0.2) 4px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.2) 6px, rgba(0,0,0,0.1) 8px, rgba(0,0,0,0.5) 10px), linear-gradient(180deg, #15803d 0%, #064e3b 100%)" },
    { id: "l1", category: "Láva", animated: true, css: "radial-gradient(circle at 15% 40%, #06b6d4 0%, transparent 50%), radial-gradient(circle at 75% 30%, #ec4899 0%, transparent 50%), radial-gradient(circle at 50% 85%, #8b5cf6 0%, transparent 50%), #170b2b" },
    { id: "l2", category: "Láva", animated: true, css: "radial-gradient(circle at 20% 30%, #f97316 0%, transparent 55%), radial-gradient(circle at 80% 60%, #eab308 0%, transparent 55%), radial-gradient(circle at 50% 10%, #d946ef 0%, transparent 50%), #4a044e" },
    { id: "l3", category: "Láva", animated: true, css: "radial-gradient(circle at 70% 20%, #4ade80 0%, transparent 55%), radial-gradient(circle at 30% 70%, #3b82f6 0%, transparent 55%), radial-gradient(circle at 10% 10%, #2dd4bf 0%, transparent 50%), #064e3b" },
    { id: "l4", category: "Láva", animated: true, css: "radial-gradient(circle at 60% 60%, #38bdf8 0%, transparent 50%), radial-gradient(circle at 20% 80%, #0ea5e9 0%, transparent 50%), radial-gradient(circle at 50% 15%, #a855f7 0%, transparent 50%), #0f172a" },
    { id: "l5", category: "Láva", animated: true, css: "radial-gradient(circle at 20% 40%, #84cc16 0%, transparent 55%), radial-gradient(circle at 80% 60%, #06b6d4 0%, transparent 55%), radial-gradient(circle at 50% 90%, #6366f1 0%, transparent 50%), #1e1b4b" },
    { id: "l6", category: "Láva", animated: true, css: "radial-gradient(circle at 30% 30%, #8b5cf6 0%, transparent 60%), radial-gradient(circle at 80% 70%, #f59e0b 0%, transparent 50%), radial-gradient(circle at 70% 10%, #10b981 0%, transparent 50%), #115e59" },
    { id: "l7", category: "Láva", animated: true, css: "radial-gradient(circle at 25% 75%, #a3e635 0%, transparent 55%), radial-gradient(circle at 75% 25%, #2dd4bf 0%, transparent 55%), radial-gradient(circle at 80% 80%, #3b82f6 0%, transparent 50%), #1e3a8a" },
    { id: "l8", category: "Láva", animated: true, css: "radial-gradient(circle at 30% 20%, #f97316 0%, transparent 55%), radial-gradient(circle at 70% 80%, #eab308 0%, transparent 55%), radial-gradient(circle at 20% 80%, #ef4444 0%, transparent 50%), #1e3a8a" },
    { id: "f1", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,800 C400,900 600,200 1100,300' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,800 C400,900 600,200 1100,300' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,400 C400,500 600,-100 1100,0' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,400 C400,500 600,-100 1100,0' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 30% 70%, #0c4a6e 0%, transparent 60%), radial-gradient(circle at 80% 30%, #064e3b 0%, #000 70%)" },
    { id: "f2", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,1100 C300,400 700,300 1100,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,1100 C300,400 700,300 1100,-100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,500 C400,800 700,100 1100,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,500 C400,800 700,100 1100,-100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 30% 20%, #312e81 0%, #020617 80%)" },
    { id: "f3", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,-100 C300,600 700,700 1100,1100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,-100 C300,600 700,700 1100,1100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,500 C400,200 700,900 1100,1100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,500 C400,200 700,900 1100,1100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 80% 20%, #4c1d95 0%, #000000 80%)" },
    { id: "f4", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M300,1100 C100,600 800,400 600,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M300,1100 C100,600 800,400 600,-100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M800,1100 C900,600 200,400 300,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M800,1100 C900,600 200,400 300,-100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 20% 80%, #831843 0%, #000000 80%)" },
    { id: "f5", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,1100 C300,400 700,300 1100,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,1100 C300,400 700,300 1100,-100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,500 C400,800 700,100 1100,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,500 C400,800 700,100 1100,-100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 70% 70%, #1d4ed8 0%, #000000 80%)" },
    { id: "f6", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,-100 C300,600 700,700 1100,1100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,-100 C300,600 700,700 1100,1100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,500 C400,200 700,900 1100,1100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,500 C400,200 700,900 1100,1100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 30% 30%, #064e3b 0%, #000000 80%)" },
    { id: "f7", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M-100,800 C400,900 600,200 1100,300' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M-100,800 C400,900 600,200 1100,300' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M-100,400 C400,500 600,-100 1100,0' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M-100,400 C400,500 600,-100 1100,0' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 60% 20%, #713f12 0%, #000000 80%)" },
    { id: "f8", category: "Üveg", css: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='xMidYMid slice'%3E%3Cdefs%3E%3Cfilter id='b'%3E%3CfeGaussianBlur stdDeviation='6'/%3E%3C/filter%3E%3C/defs%3E%3Cpath d='M300,1100 C100,600 800,400 600,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='15' filter='url(%23b)'/%3E%3Cpath d='M300,1100 C100,600 800,400 600,-100' fill='none' stroke='rgba(255,255,255,0.8)' stroke-width='0.5'/%3E%3Cpath d='M800,1100 C900,600 200,400 300,-100' fill='none' stroke='rgba(255,255,255,0.1)' stroke-width='12' filter='url(%23b)'/%3E%3Cpath d='M800,1100 C900,600 200,400 300,-100' fill='none' stroke='rgba(255,255,255,0.5)' stroke-width='0.5'/%3E%3C/svg%3E\") center/cover no-repeat, radial-gradient(circle at 20% 80%, #9a3412 0%, #000000 80%)" },
    { id: "w1", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p1.png') center / cover no-repeat" },
    { id: "w2", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p2.png') center / cover no-repeat" },
    { id: "w3", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p3.png') center / cover no-repeat" },
    { id: "w4", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p4.png') center / cover no-repeat" },
    { id: "w5", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p5.png') center / cover no-repeat" },
    { id: "w6", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p6.png') center / cover no-repeat" },
    { id: "w7", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p7.png') center / cover no-repeat" },
    { id: "w8", category: 'Egyedi', css: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/wallpapers/wallpaper_p8.png') center / cover no-repeat" },
];


export const CATEGORIES = [{
    id: "Világító",
    name: "Világító",
    type: 'free'
}, {
    id: "Absztrakt",
    name: "Absztrakt",
    type: 'pro'
}, {
    id: "Színek",
    name: "Színek",
    type: 'free'
}, {
    id: "Üveg",
    name: "Üveg",
    type: 'pro'
}, {
    id: "Minimalista",
    name: "Minimalista",
    type: 'free'
}, {
    id: "Egyszerű",
    name: "Egyszerű",
    type: 'free'
}, {
    id: "Prémium",
    name: "Prémium",
    type: 'pro'
}, {
    id: "Groove",
    name: "Groove",
    type: 'pro'
}, {
    id: "Láva",
    name: "Láva",
    type: 'free'
}, {
    id: "Egyedi",
    name: "Egyedi",
    type: 'free'
}];

interface AppearanceContextType {
    theme: "dark" | "light" | "system";
    accent: string;
    animations: boolean;
    wallpaper: string;
    widgets: { [houseId: string]: string[] };
    setTheme: (t: "dark" | "light" | "system") => void;
    setAccent: (a: string) => void;
    setAnimations: (enabled: boolean) => void;
    setWallpaper: (id: string) => void;
    setWidgets: (widgets: { [houseId: string]: string[] }) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

export function AppearanceProvider({ children, initialValues }: {
    children: React.ReactNode;
    initialValues: { theme: string | undefined; accent: string | undefined; animations: string | undefined; wallpaper: string | undefined; widgets: { [houseId: string]: string[] } | undefined }
}) {
    const [theme, setThemeState] = useState<"dark" | "light" | "system">((initialValues.theme as "dark" | "light" | "system") || "dark");
    const [accent, setAccentState] = useState(initialValues.accent || "#ff3b30");
    const [animations, setAnimationsState] = useState(initialValues.animations !== "false");
    const [wallpaper, setWallpaperState] = useState(initialValues.wallpaper || "v1");
    const [widgets, setWidgetsState] = useState(initialValues.widgets || {});

    const setterThemeState = (t: "dark" | "light" | "system") => {
        setThemeState(t);
        saveCookie("app_theme", t);
        updateSettingsAction({ theme: t, accent, animations, wallpaper, widgets });
    }

    const setterAccentState = (a: string) => {
        setAccentState(a);
        saveCookie("app_accent", a);
        updateSettingsAction({ theme, accent: a, animations, wallpaper, widgets });
    }

    const setterAnimationsState = (en: boolean) => {
        setAnimationsState(en);
        saveCookie("app_animations", en.toString());
        updateSettingsAction({ theme, accent, animations: en, wallpaper, widgets });
    }

    const setterWallpaperState = (id: string) => {
        setWallpaperState(id);
        saveCookie("app_wallpaper", id);
        updateSettingsAction({ theme, accent, animations, wallpaper: id, widgets });
    }

    const setterWidgetsState = (w: { [houseId: string]: string[] }) => {
        setWidgetsState(w);
        saveCookie("app_widgets", JSON.stringify(w));
        updateSettingsAction({ theme, accent, animations, wallpaper, widgets: w });
    }

    const saveCookie = (name: string, value: string) => {
        if (typeof document !== "undefined") {
            document.cookie = `${name}=${value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
        }
    };

    useEffect(() => {
        const fetchSettings = async () => {
            if (!initialValues.theme && !initialValues.accent && !initialValues.wallpaper) {
                const res = await getSettingsAction();
                if (res.success && res.settings) {
                    const { theme: t, accent: a, animations: anim, wallpaper: wp, widgets: widg } = res.settings;

                    if (t) { setThemeState(t as "dark" | "light" | "system"); saveCookie("app_theme", t); }
                    if (a) { setAccentState(a); saveCookie("app_accent", a); }
                    if (anim !== undefined) { setAnimationsState(anim); saveCookie("app_animations", anim.toString()); }
                    if (wp) { setWallpaperState(wp); saveCookie("app_wallpaper", wp); }
                    if (widg) { setWidgetsState(widg); saveCookie("app_widgets", JSON.stringify(widg)); }
                }
            }
        };

        fetchSettings();
    }, [initialValues]);

    useEffect(() => {
        const root = document.documentElement;
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleThemeChange = () => {
            const isDark = theme === "dark" || (theme === "system" && mediaQuery.matches);

            if (isDark) {
                root.classList.add("dark");
                root.classList.remove("light");
                root.style.colorScheme = "dark";
            } else {
                root.classList.add("light");
                root.classList.remove("dark");
                root.style.colorScheme = "light";
            }
        };

        handleThemeChange();
        mediaQuery.addEventListener("change", handleThemeChange);
        return () => mediaQuery.removeEventListener("change", handleThemeChange);
    }, [theme]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty("--brand-primary", accent);
        root.style.setProperty("--brand-accent-red", `${accent}33`);

        const selectedWp = WALLPAPERS.find(w => w.id === wallpaper);
        const bgValue = selectedWp ? selectedWp.css : WALLPAPERS[0].css;
        const isAnimated = selectedWp?.animated === true && animations;

        root.style.setProperty("--app-wallpaper", bgValue);
        root.style.setProperty("--app-bg-size", isAnimated ? "300% 300%" : "cover");
        root.style.setProperty("--app-bg-animation", isAnimated ? "moveAbstractGradient 20s ease-in-out infinite alternate" : "none");

        if (!animations) root.classList.add("no-animations");
        else root.classList.remove("no-animations");
    }, [accent, animations, wallpaper]);

    return (
        <AppearanceContext.Provider value={{
            theme, accent, animations, wallpaper, widgets,
            setTheme: setterThemeState,
            setAccent: setterAccentState,
            setAnimations: setterAnimationsState,
            setWallpaper: setterWallpaperState,
            setWidgets: setterWidgetsState
        }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes moveAbstractGradient {
                    0% { background-position: 0% 0%; }
                    33% { background-position: 100% 0%; }
                    66% { background-position: 100% 100%; }
                    100% { background-position: 0% 100%; }
                }
                :root.light { --app-wallpaper-overlay: rgba(255, 255, 255, 0.85); }
                :root.dark { --app-wallpaper-overlay: transparent; }
            `}} />
            {children}
        </AppearanceContext.Provider>
    );
}

export const useAppearance = () => {
    const context = useContext(AppearanceContext);
    if (!context) throw new Error("useAppearance must be used within AppearanceProvider");
    return context;
};