/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "cream-bg": "#FAF6EE",
        "cream-card": "#FFFFFF",
        "cream-border": "#E8DCC8",
        "cream-tan": "#EADFCB",
        "soil-brown": "#6B4226",
        "soil-deep": "#4A2C17",
        "soil-text": "#2B1D12",
        "leaf-green": "#3F8F3F",
        "leaf-deep": "#2E6B34",
        "leaf-soft": "#E6F2DF",
        "harvest-gold": "#E0A526",
        "clay-red": "#B3412E",
      },
      fontFamily: {
        sans: [
          '"Inter"',
          '"Noto Sans Devanagari"',
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          '"Segoe UI"',
          "sans-serif",
        ],
        devanagari: [
          '"Noto Sans Devanagari"',
          '"Inter"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        display: [
          '"Inter"',
          '"Noto Sans Devanagari"',
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 14px 34px -22px rgba(74, 44, 23, 0.35)",
        sheet: "0 -18px 50px -24px rgba(43, 29, 18, 0.45)",
      },
    },
  },
  plugins: [],
};
