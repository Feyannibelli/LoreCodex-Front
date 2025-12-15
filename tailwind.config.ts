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
                brand: {
                    100: '#FFF4E5',
                    300: '#FFB86A',
                    500: '#F57E00',
                    600: '#E27000',
                    700: '#CC6400',
                },
                bg: '#0B1020',
                surface: '#0F172A',
                'surface-2': '#111C33',
                border: 'rgba(255, 255, 255, 0.08)',
                text: '#E5E7EB',
                'text-muted': '#94A3B8',
                placeholder: '#64748B',
            },
        },
    },
    plugins: [typography],
}

export default config;
