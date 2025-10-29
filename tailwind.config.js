/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-tertiary': 'var(--bg-tertiary)',
        'bg-card': 'var(--bg-card)',
        'bg-elevated': 'var(--bg-elevated)',
        'bg-hover': 'var(--bg-hover)',
        'bg-active': 'var(--bg-active)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-tertiary': 'var(--text-tertiary)',
        'text-disabled': 'var(--text-disabled)',
        'border-color': 'var(--border-color)',
        'border-color-light': 'var(--border-color-light)',
        'border-color-hover': 'var(--border-color-hover)',
        'color-primary': 'var(--color-primary)',
        'color-primary-hover': 'var(--color-primary-hover)',
        'color-success': 'var(--color-success)',
        'color-success-bg': 'var(--color-success-bg)',
        'color-danger': 'var(--color-danger)',
        'color-danger-bg': 'var(--color-danger-bg)',
        'color-warning': 'var(--color-warning)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
      },
    },
  },
  plugins: [],
}

