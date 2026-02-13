/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Driver Theme (Professional Teal - Fresh & Active)
        driver: {
          primary: '#00B894',
          dark: '#00A884',
          light: '#55EFC4',
          bg: '#E8F6F3', // Very light mint/teal
          card: '#FFFFFF',
          text: '#2D3436'
        },
        // Provider Theme (Premium Indigo - Business & Wealth)
        provider: {
          primary: '#6C5CE7',
          dark: '#5849BE',
          light: '#A29BFE',
          bg: '#F3F0FF', // Very light lavender
          card: '#FFFFFF',
          text: '#2D3436'
        },
        // Admin Theme (Corporate Slate/Navy - Authority)
        admin: {
          primary: '#2D3436', // Dark Slate
          accent: '#0984E3',  // Tech Blue details
          dark: '#1E272E',
          light: '#636E72',
          bg: '#F5F6FA', // Cool gray
          card: '#FFFFFF',
          text: '#2D3436'
        },
        // Common UI Colors
        dark: {
          900: '#1E272E',
          800: '#2D3436',
          DEFAULT: '#2D3436',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          800: '#1F2937',
        },
        status: {
          success: '#00B894',
          error: '#FF7675',
          warning: '#FDCB6E',
          info: '#74B9FF',
        }
      },
    },
  },
  plugins: [],
}
