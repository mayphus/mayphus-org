// @ts-nocheck
import type { Config } from "tailwindcss";
// @ts-ignore
import colors from "tailwindcss/colors";
// @ts-ignore
import animate from "tailwindcss-animate";
// @ts-ignore
import typography from "@tailwindcss/typography";

export default {
    darkMode: ["class"],
    content: ["./app/**/*.{ts,tsx}"],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                border: colors.zinc[800],
                input: colors.zinc[800],
                ring: colors.zinc[400],
                background: colors.zinc[950],
                foreground: colors.zinc[50],
                primary: {
                    DEFAULT: colors.zinc[50],
                    foreground: colors.zinc[950],
                },
                secondary: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.zinc[50],
                },
                destructive: {
                    DEFAULT: colors.red[500],
                    foreground: colors.zinc[50],
                },
                muted: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.zinc[400],
                },
                accent: {
                    DEFAULT: colors.zinc[800],
                    foreground: colors.zinc[50],
                },
                popover: {
                    DEFAULT: colors.zinc[950],
                    foreground: colors.zinc[50],
                },
                card: {
                    DEFAULT: colors.zinc[950],
                    foreground: colors.zinc[50],
                },
            },
            borderRadius: {
                lg: "0.5rem",
                md: "calc(0.5rem - 2px)",
                sm: "calc(0.5rem - 4px)",
            },

            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
            },
        },
    },
    plugins: [
        animate,
        typography,
    ],
} satisfies Config;
