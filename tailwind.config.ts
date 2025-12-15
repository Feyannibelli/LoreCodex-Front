import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                border: "var(--border)",
                input: "var(--input)",
                ring: "var(--ring)",
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                muted: {
                    DEFAULT: "var(--muted)",
                    foreground: "var(--muted-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                popover: {
                    DEFAULT: "var(--popover)",
                    foreground: "var(--popover-foreground)",
                },
                card: {
                    DEFAULT: "var(--card)",
                    foreground: "var(--card-foreground)",
                },
                // Custom brand aliases
                brand: {
                    50: '#FFF8F1',
                    100: '#FFF4E5',
                    200: '#FFE1BF',
                    300: '#FFCE99',
                    400: '#FFB86A', // Lighter accent
                    500: '#F57E00', // Brand Main
                    600: '#E27000',
                    700: '#CC6400',
                    800: '#994B00',
                    900: '#663200',
                },
                // Aliases for legacy/direct usage
                bg: "var(--background)",
                surface: "var(--card)",
                "surface-2": "var(--secondary)",
                text: "var(--foreground)",
                "text-muted": "var(--muted-foreground)",
                placeholder: "var(--muted-foreground)",
            },
        },
    },
    plugins: [typography],
}

export default config;
