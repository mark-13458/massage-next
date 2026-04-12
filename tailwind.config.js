/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/lib/**/*.{ts,tsx}',
    './src/server/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Lora for headings — elegant serif, wellness mood
        serif: ['var(--font-lora)', 'Georgia', 'serif'],
        // Raleway for body — modern, clean, readable
        sans: ['var(--font-raleway)', 'system-ui', 'sans-serif'],
      },
      colors: {
        amber: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107',
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        brown: {
          50: '#efebe9',
          100: '#d7ccc8',
          200: '#bcaaa4',
          300: '#a1887f',
          400: '#8d6e63',
          500: '#795548',
          600: '#6d4c41',
          700: '#5d4037',
          800: '#4e342e',
          900: '#3e2723',
        },
        cream: '#f8f5f0',
        // Warm off-white for section backgrounds
        warm: {
          50: '#fdfaf6',
          100: '#f9f4ed',
          200: '#f3ebe0',
        },
      },
      boxShadow: {
        soft: '0 20px 60px rgba(121, 85, 72, 0.12)',
        card: '0 2px 16px rgba(121, 85, 72, 0.07), 0 1px 4px rgba(121, 85, 72, 0.05)',
        'card-hover': '0 20px 60px rgba(121, 85, 72, 0.16), 0 4px 16px rgba(121, 85, 72, 0.08)',
        'inner-sm': 'inset 0 1px 2px rgba(0,0,0,0.06)',
        glow: '0 0 0 3px rgba(255, 193, 7, 0.25)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      transitionTimingFunction: {
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 2s linear infinite',
      },
      letterSpacing: {
        widest2: '0.24em',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
