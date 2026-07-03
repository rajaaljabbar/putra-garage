/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "primary-fixed": "#ffdbcc",
        "secondary-fixed-dim": "#adc6ff",
        "on-background": "#e5e2e3",
        "tertiary-container": "#059eff",
        "primary": "#ffb693",
        "on-error-container": "#ffdad6",
        "surface-container-high": "#2a2a2b",
        "primary-fixed-dim": "#ffb693",
        "error": "#ffb4ab",
        "surface-variant": "#353436",
        "on-tertiary": "#003257",
        "surface-tint": "#ffb693",
        "surface-dim": "#131314",
        "inverse-surface": "#e5e2e3",
        "outline-variant": "#5a4136",
        "on-error": "#690005",
        "tertiary": "#9ccaff",
        "secondary-fixed": "#d8e2ff",
        "on-secondary-fixed-variant": "#004493",
        "secondary-container": "#4b8eff",
        "background": "#131314",
        "surface-container": "#201f20",
        "outline": "#a98a7d",
        "on-tertiary-fixed-variant": "#00497b",
        "surface-container-lowest": "#0e0e0f",
        "on-primary-fixed": "#351000",
        "on-surface-variant": "#e2bfb0",
        "on-primary-fixed-variant": "#7a3000",
        "inverse-on-surface": "#313031",
        "surface-container-low": "#1c1b1c",
        "surface-container-highest": "#353436",
        "on-secondary-container": "#00285c",
        "surface": "#131314",
        "on-primary": "#561f00",
        "error-container": "#93000a",
        "on-primary-container": "#572000",
        "on-secondary-fixed": "#001a41",
        "surface-bright": "#3a393a",
        "on-surface": "#e5e2e3",
        "on-secondary": "#002e69",
        "inverse-primary": "#a04100",
        "on-tertiary-fixed": "#001d35",
        "tertiary-fixed-dim": "#9ccaff",
        "secondary": "#adc6ff",
        "tertiary-fixed": "#d0e4ff",
        "primary-container": "#ff6b00",
        "on-tertiary-container": "#003357"
      },
      "borderRadius": {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      "spacing": {
        "stack-md": "12px",
        "container-padding-desktop": "40px",
        "stack-sm": "4px",
        "stack-lg": "24px",
        "container-padding-mobile": "20px",
        "gutter": "16px",
        "base": "8px"
      },
      "fontFamily": {
        "display-lg": ["Outfit", "sans-serif"],
        "label-caps": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Outfit", "sans-serif"],
        "headline-lg": ["Outfit", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "title-md": ["Outfit", "sans-serif"]
      },
      "fontSize": {
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "label-caps": ["12px", {"lineHeight": "16px", "letterSpacing": "0.1em", "fontWeight": "700"}],
        "headline-lg-mobile": ["28px", {"lineHeight": "36px", "fontWeight": "600"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.01em", "fontWeight": "600"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "body-sm": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "title-md": ["20px", {"lineHeight": "28px", "fontWeight": "500"}]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
