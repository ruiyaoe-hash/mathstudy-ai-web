import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1200px",
        "2xl": "1200px",
      },
    },
    screens: {
      xs: "375px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
          100: "hsl(var(--destructive-100))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
          100: "hsl(var(--success-100))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        coin: "hsl(var(--coin))",
        star: "hsl(var(--star))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        "display-xl": ["72px", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "display-lg": ["56px", { lineHeight: "1.1", fontWeight: "800", letterSpacing: "-0.02em" }],
        "display": ["48px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.02em" }],
        "headline-lg": ["36px", { lineHeight: "1.2", fontWeight: "700", letterSpacing: "-0.01em" }],
        "headline": ["28px", { lineHeight: "1.3", fontWeight: "600", letterSpacing: "-0.01em" }],
        "title-lg": ["22px", { lineHeight: "1.4", fontWeight: "600" }],
        "title": ["18px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.6", fontWeight: "500" }],
        "body": ["15px", { lineHeight: "1.6", fontWeight: "400" }],
        "caption": ["13px", { lineHeight: "1.5", fontWeight: "500" }],
        "tiny": ["11px", { lineHeight: "1.4", fontWeight: "600", letterSpacing: "0.02em" }],
      },
      borderRadius: {
        "4xl": "2rem",
        "3xl": "1.5rem",
        "2xl": "1rem",
        xl: "0.875rem",
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        "glow-sm": "0 0 20px hsl(var(--primary) / 0.3)",
        "glow": "0 0 40px hsl(var(--primary) / 0.4)",
        "glow-lg": "0 0 60px hsl(var(--primary) / 0.5)",
        "inner-glow": "inset 0 0 20px hsl(var(--primary) / 0.1)",
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
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
