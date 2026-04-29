/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0c0c0c',
        surface: '#141414',
        surface2: '#1c1c1c',
        border: '#2a2a2a',
        accent: '#e8f542',
        red: '#f54242',
        green: '#42f5a7',
        blue: '#42a7f5',
        text: '#f0f0f0',
        muted: '#666666',
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
};
