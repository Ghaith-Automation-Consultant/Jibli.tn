/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./pages/**/*.{html,js}", "./js/**/*.{html,js}", "./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0F4C81", // blue.main
                    hover: "#0D3B66",   // blue.hover
                    light: "#DCEEFB"    // blue.softBackground
                },
                accent: {
                    DEFAULT: "#F59E0B", // amber.main
                    hover: "#D97706",   // amber.hover
                    light: "#FEF3C7"    // amber.softBackground
                },
                identity: {
                    "tunisian-red": {
                        DEFAULT: "#C1121F", // tunisianRed.main
                        light: "#FEE2E2"    // tunisianRed.softBackground
                    }
                },
                neutral: {
                    50: "#F9FAFB",  // background.secondary
                    100: "#F3F4F6",
                    200: "#E5E7EB", // border
                    300: "#D1D5DB", // divider
                    400: "#9CA3AF", // text.disabled
                    500: "#6B7280", // text.secondary
                    600: "#4B5563",
                    700: "#374151",
                    800: "#1F2937",
                    900: "#111827", // text.primary
                    950: "#0B1220"  // background.inverse
                },
                state: {
                    success: "#16A34A",
                    warning: "#F97316", // status.warning
                    error: "#DC2626",
                    info: "#2563EB"
                },
                error: "#DC2626",
            },
            borderRadius: {
                'sm': '6px',
                'md': '10px',
                'lg': '14px',
                'xl': '20px',
                'pill': '9999px'
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0,0,0,0.05)',
                'md': '0 4px 6px rgba(0,0,0,0.1)',
                'lg': '0 10px 15px rgba(0,0,0,0.15)'
            },
            fontFamily: {
                'arabic': ['Noto Sans Arabic', 'sans-serif'],
                // --font-inter is set by next/font in app/layout.js
                'inter': ['var(--font-inter)', 'Inter', 'sans-serif']
            },
            spacing: {
                '4.5': '1.125rem'
            },
            keyframes: {
                fadeIn: {
                    from: { opacity: '0', transform: 'translateY(4px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                }
            },
            animation: {
                fadeIn: 'fadeIn 0.3s ease-out'
            }
        }
    },
    plugins: [],
}
