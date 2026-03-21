import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                background: "#000000",
                surface: "#1c1c1e",
                surfaceElevated: "#2c2c2e",
                primary: "#ff3b30",
                textPrimary: "#ffffff",
                textSecondary: "#8e8e93",
                accentRed: "#4a1215",
            },
            borderRadius: {
                '4xl': '2rem',
            }
        },
    },
    plugins: [],
} satisfies Config;