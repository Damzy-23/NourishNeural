/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Living Pantry — warm sage & terracotta palette
        primary: {
          50: '#f4f7f4',
          100: '#e4ebe4',
          200: '#c8d7c8',
          300: '#a3bda3',
          400: '#7a9e7a',
          500: '#5a8a5a', // Sage green — main brand
          600: '#476e47',
          700: '#3a5a3a',
          800: '#314a31',
          900: '#2a3d2a',
        },
        accent: {
          50: '#fdf6f0',
          100: '#fbe8d5',
          200: '#f6cdaa',
          300: '#f0ab74',
          400: '#e8843c',
          500: '#e06a1e', // Terracotta — warm accent
          600: '#d15216',
          700: '#ae3d14',
          800: '#8b3218',
          900: '#712b17',
        },
        cream: {
          50: '#fefdfb',
          100: '#fdf9f3',
          200: '#faf3e7',
          300: '#f5e8d4',
          400: '#efdcbf',
        },
        neutral: {
          50: '#fafaf8',
          100: '#f3f3f0',
          200: '#e6e5e1',
          300: '#d4d3cd',
          400: '#a8a69e',
          500: '#7a7870',
          600: '#5c5a53',
          700: '#45443e',
          800: '#2e2d29',
          900: '#1c1b18',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"DM Serif Display"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 2s infinite',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '30%': { transform: 'translate(3%, -15%)' },
          '50%': { transform: 'translate(12%, 9%)' },
          '70%': { transform: 'translate(9%, 4%)' },
          '90%': { transform: 'translate(-1%, 7%)' },
        },
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'medium': '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'large': '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        'warm': '0 4px 20px -4px rgba(90, 138, 90, 0.15), 0 8px 16px -4px rgba(224, 106, 30, 0.08)',
        'card': '0 1px 3px rgba(0,0,0,0.04), 0 6px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 2px 8px rgba(0,0,0,0.06), 0 12px 28px rgba(0,0,0,0.1)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [],
}
