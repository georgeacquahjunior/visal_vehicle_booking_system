/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        fadeIn: { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideDown: {
          "0%": { opacity: 0, transform: "translateY(-12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        slideUpFade: {
          "0%": { opacity: 0, transform: "translateY(-30px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        floatA: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(24px, -18px) scale(1.08)" },
        },
        floatB: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(-20px, 16px) scale(1.05)" },
        },
        floatC: {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "50%": { transform: "translate(14px, 20px) scale(0.95)" },
        },
        scaleIn: {
          "0%": { opacity: 0, transform: "scale(0.96) translateY(8px)" },
          "100%": { opacity: 1, transform: "scale(1) translateY(0)" },
        },
        toastIn: {
          "0%": { opacity: 0, transform: "translateX(24px)" },
          "100%": { opacity: 1, transform: "translateX(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease",
        slideDown: "slideDown 0.3s ease-out",
        slideUpFade: "slideUpFade 0.3s ease-out",
        floatA: "floatA 9s ease-in-out infinite",
        floatB: "floatB 11s ease-in-out infinite",
        floatC: "floatC 13s ease-in-out infinite",
        scaleIn: "scaleIn 0.2s cubic-bezier(0.16,1,0.3,1)",
        toastIn: "toastIn 0.25s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
}

