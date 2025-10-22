import defaultTheme from "tailwindcss/defaultTheme";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
  ],
  theme: {
    extend: {
      colors: {
        lime: {
          500: "#B4FF00",
          600: "#8DE600",
        },
        fuchsia: {
          500: "#FF3EC8",
          600: "#E020A8",
        },
        "cf-orange": "#f6821f", // Cloudflare brand orange
        ink: "#0f0f0f",
        sand: "#f9f4ef",
      },
      fontFamily: {
        display: ["'Space Grotesk'", ...defaultTheme.fontFamily.sans],
        sans: ["'Inter Variable'", ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        vibe: "8px 8px 0px 0px rgba(15, 15, 15, 0.9)",
      },
    },
  },
  plugins: [],
};
