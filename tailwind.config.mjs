/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#011C2D", // Dark navy
          hover: "#011529",
          light: "#022D48",
        },
        secondary: {
          DEFAULT: "#F5F7F4", // Light off-white
          hover: "#E6E8E5",
          dark: "#D7D9D6",
        },
        accent: {
          DEFAULT: "#B42C51", // Berry red
          hover: "#9D1F43",
          light: "#C93A61",
        },
        neutral: {
          DEFAULT: "#D5BA90", // Warm taupe
          hover: "#C4A678",
          light: "#E0CAA6",
        },
        navy: {
          DEFAULT: "#011C2D",
          light: "#022D48",
          dark: "#011525",
        },
        berry: {
          DEFAULT: "#B42C51",
          light: "#C93A61",
          dark: "#9D1F43",
        },
        taupe: {
          DEFAULT: "#D5BA90",
          light: "#E0CAA6",
          dark: "#C4A678",
        },
        offwhite: {
          DEFAULT: "#F5F7F4",
          dark: "#E6E8E5",
          darker: "#D7D9D6",
        },
      },
      borderRadius: {
        none: "0",
        sm: "2px", // Changed from 0.125rem
        DEFAULT: "2px", // Changed from 0.25rem
        md: "3px", // Changed from 0.375rem
        lg: "2px", // Changed from 0.5rem
        xl: "6px", // Changed from 0.75rem
        "2xl": "8px", // Changed from 1rem
        "3xl": "10px", // Changed from 1.5rem
        full: "9999px",
      },
      boxShadow: {
        sm: "4px 4px 5px 3px rgba(0, 0, 0, 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        md: "2px 10px 10px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)",
      },

      // Slightly tighter line heights for professional text layout
      lineHeight: {
        tighter: "1.15",
        tight: "1.25",
        snug: "1.35",
        normal: "1.45",
        relaxed: "1.625",
        loose: "2",
      },

      // Refined spacing scale
      spacing: {
        // You can add custom spacing values here
        4.5: "1.125rem", // 18px
        18: "4.5rem", // 72px
      },
    },
  },
  plugins: [require("@tailwindcss/aspect-ratio")],
};
