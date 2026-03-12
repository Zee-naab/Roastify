/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Syne"', "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        base: "#07080f",
        surface: "#0d0e18",
        card: "#12131f",
        stroke: "rgba(255,255,255,0.08)",
        muted: "#9ca3af",
        warm: "#f8f6f2",
        plasma: {
          orange: "#ff4500",
          purple: "#8a2be2",
        },
        heat: {
          DEFAULT: "#ff4500",
          bright: "#ff6a33",
          dim: "#c73700",
        },
        magic: {
          DEFAULT: "#8a2be2",
          bright: "#a64df5",
        },
        crimson: {
          DEFAULT: "#dc143c",
          bright: "#ff1f4f",
          dim: "#8b0000",
        },
        electric: {
          DEFAULT: "#7b2fff",
          bright: "#9d5fff",
          dim: "#4a1a99",
        },
        gold: "#f5a623",
      },
      boxShadow: {
        plasma: "0 0 40px rgba(255,69,0,0.2), 0 0 80px rgba(138,43,226,0.15)",
        "heat-lg": "0 0 50px rgba(255,69,0,0.35)",
        "magic-lg": "0 0 50px rgba(138,43,226,0.35)",
        gummi:
          "0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        "gummi-hover":
          "0 20px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.15)",
        liquid:
          "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      backgroundImage: {
        "plasma-gradient": "linear-gradient(135deg, #ff4500, #c0392b, #8a2be2)",
        "card-gradient":
          "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        "float-alt": "float 9s ease-in-out infinite reverse",
        "plasma-orb": "plasmaOrb 8s ease-in-out infinite",
        shimmer: "shimmer 1.8s infinite",
        fuse1: "fuse 0.9s ease-in-out infinite",
        fuse2: "fuse 0.9s ease-in-out 0.2s infinite",
        fuse3: "fuse 0.9s ease-in-out 0.4s infinite",
        shake: "shake 0.4s ease-in-out",
        "burn-gradient": "burnGradient 3s ease-in-out infinite",
        flame1: "flameFlicker 0.65s ease-in-out infinite",
        flame2: "flameFlicker 0.65s ease-in-out 0.18s infinite",
        flame3: "flameFlicker 0.65s ease-in-out 0.36s infinite",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        plasmaOrb: {
          "0%,100%": { opacity: "0.15" },
          "50%": { opacity: "0.3" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-600px 0" },
          "100%": { backgroundPosition: "600px 0" },
        },
        fuse: {
          "0%,100%": { opacity: "0.4", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-4px)" },
          "40%": { transform: "translateX(4px)" },
          "60%": { transform: "translateX(-3px)" },
          "80%": { transform: "translateX(3px)" },
        },
        burnGradient: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        flameFlicker: {
          "0%,100%": {
            transform: "scaleY(1) scaleX(1) rotate(-2deg)",
            opacity: "0.65",
            filter: "brightness(0.85)",
          },
          "25%": {
            transform: "scaleY(1.25) scaleX(0.88) rotate(2deg)",
            opacity: "1",
            filter: "brightness(1.5)",
          },
          "50%": {
            transform: "scaleY(0.88) scaleX(1.12) rotate(-1deg)",
            opacity: "0.8",
            filter: "brightness(1.1)",
          },
          "75%": {
            transform: "scaleY(1.18) scaleX(0.92) rotate(3deg)",
            opacity: "1",
            filter: "brightness(1.4)",
          },
        },
      },
    },
  },
  plugins: [],
};
