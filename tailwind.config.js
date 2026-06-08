/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{svelte,ts,js}"],
  theme: {
    extend: {
      colors: {
        // Warm "kitchen paper" base
        paper: "#f4efe6",
        parchment: "#ece4d4",
        // Charcoal ink
        ink: "#211d1a",
        "ink-soft": "#4b443d",
        // Accents
        saffron: "#e0901f",
        terracotta: "#bf5a37",
        sage: "#6f7d5b",
        // Expiration semantics
        expired: "#a8331f",
        critical: "#bf5a37",
        soon: "#c98a1a",
        fresh: "#6f7d5b",
      },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        body: ['"Geist"', "system-ui", "sans-serif"],
        mono: ['"Geist Mono"', "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(33,29,26,0.04), 0 8px 24px rgba(33,29,26,0.06)",
        lift: "0 4px 8px rgba(33,29,26,0.06), 0 16px 40px rgba(33,29,26,0.12)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};
