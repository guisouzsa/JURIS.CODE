import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
          "inverse-surface": "#e5e2e1",
          "surface-container-lowest": "#0e0e0e",
          "secondary-fixed-dim": "#c8c6c5",
          "on-tertiary-fixed": "#1b1c1c",
          "on-primary-container": "#636565",
          "error-container": "#93000a",
          "on-primary-fixed": "#1a1c1c",
          "tertiary-fixed-dim": "#c7c6c6",
          "error": "#ffb4ab",
          "surface-container-highest": "#353534",
          "on-error-container": "#ffdad6",
          "tertiary-container": "#e3e2e2",
          "outline": "#8e9192",
          "tertiary": "#ffffff",
          "secondary-container": "#474746",
          "inverse-primary": "#5d5f5f",
          "on-secondary-fixed-variant": "#474746",
          "surface-container-low": "#1c1b1b",
          "surface-bright": "#393939",
          "on-tertiary-container": "#646464",
          "surface-dim": "#131313",
          "secondary-fixed": "#e4e2e1",
          "on-background": "#e5e2e1",
          "surface-container-high": "#2a2a2a",
          "background": "#131313",
          "inverse-on-surface": "#313030",
          "surface-container": "#201f1f",
          "on-primary": "#2f3131",
          "on-tertiary": "#303031",
          "outline-variant": "#444748",
          "secondary": "#c8c6c5",
          "primary-fixed": "#e2e2e2",
          "on-tertiary-fixed-variant": "#464747",
          "surface": "#131313",
          "primary-fixed-dim": "#c6c6c7",
          "on-primary-fixed-variant": "#454747",
          "on-secondary-container": "#b6b5b4",
          "on-secondary": "#303030",
          "surface-tint": "#c6c6c7",
          "on-surface-variant": "#c4c7c8",
          "on-error": "#690005",
          "primary-container": "#e2e2e2",
          "on-surface": "#e5e2e1",
          "on-secondary-fixed": "#1b1c1c",
          "tertiary-fixed": "#e3e2e2",
          "surface-variant": "#353534",
          "primary": "#ffffff",
          "accent-brand": "#6366F1",
          "accent-brand-dim": "#4F46E5"
      },
      borderRadius: {
          DEFAULT: "0.25rem",
          lg: "0.5rem",
          xl: "0.75rem",
          full: "9999px"
      },
      spacing: {
          "stack-lg": "80px",
          "max-width": "1440px",
          "margin-mobile": "24px",
          "gutter": "24px",
          "margin-desktop": "64px",
          "stack-md": "40px",
          "stack-xl": "160px"
      },
      fontFamily: {
          "headline-lg-mobile": ["var(--font-montserrat)", "sans-serif"],
          "display-xl": ["var(--font-montserrat)", "sans-serif"],
          "headline-md": ["var(--font-montserrat)", "sans-serif"],
          "body-md": ["var(--font-montserrat)", "sans-serif"],
          "label-nav": ["var(--font-montserrat)", "sans-serif"],
          "body-lg": ["var(--font-montserrat)", "sans-serif"],
          "headline-lg": ["var(--font-montserrat)", "sans-serif"],
          "label-caps": ["var(--font-montserrat)", "sans-serif"]
      },
      fontSize: {
          "headline-lg-mobile": ["32px", { lineHeight: "120%", fontWeight: "700" }],
          "display-xl": ["120px", { lineHeight: "110%", letterSpacing: "-0.04em", fontWeight: "900" }],
          "headline-md": ["24px", { lineHeight: "140%", letterSpacing: "0.1em", fontWeight: "600" }],
          "body-md": ["14px", { lineHeight: "160%", fontWeight: "400" }],
          "label-nav": ["11px", { lineHeight: "100%", letterSpacing: "0.15em", fontWeight: "500" }],
          "body-lg": ["18px", { lineHeight: "160%", letterSpacing: "0.01em", fontWeight: "400" }],
          "headline-lg": ["48px", { lineHeight: "120%", letterSpacing: "0.05em", fontWeight: "700" }],
          "label-caps": ["12px", { lineHeight: "100%", letterSpacing: "0.2em", fontWeight: "600" }]
      },
      keyframes: {
        scrolldown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(300%)' },
        }
      },
      animation: {
        'scrolldown': 'scrolldown 2s ease-in-out infinite',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
};
export default config;

