/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Rubik', '-apple-system', 'system-ui', 'Segoe UI', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'Rubik', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Monaco', 'Menlo', 'Ubuntu Mono', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 4px 8px -4px rgba(15, 23, 42, 0.04)',
        'subtle-elevated': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'glow-lime': '0 0 20px -3px rgba(194, 239, 78, 0.4)',
        'glow-indigo': '0 0 25px -5px rgba(106, 95, 193, 0.25)',
        'glow-violet': '0 0 25px -5px rgba(106, 95, 193, 0.25)',
        'midnight-elevated': '0 10px 30px -10px rgba(21, 15, 35, 0.5)',
      },
      colors: {
        // EXAMIND Midnight-Violet & Canonical Brand Palette (DESIGN.md)
        midnight: {
          DEFAULT: '#150f23',
          surface: '#1f1633',
          hairline: '#362d59',
        },
        ink: {
          DEFAULT: '#1f1633',
          deep: '#1f1633',
        },
        examind: {
          midnight: '#150f23',
          ink: '#1f1633',
          lime: '#c2ef4e',
          violet: '#6a5fc1',
          'violet-deep': '#422082',
          rose: '#e11d48',
          emerald: '#10b981',
          amber: '#f59e0b',
        },
        // EXAMIND Light Theme Institutional Palette
        sentri: {
          primary: '#0f172a',
          ink: '#0f172a',
          'ink-deep': '#0f172a',
          'on-primary': '#ffffff',
          lime: '#c2ef4e',
          pink: '#e11d48',
          violet: '#6a5fc1',
          'violet-deep': '#422082',
          'violet-mid': '#8c84d0',
          canvas: '#ffffff',
          night: '#faf9fd',
          'press-light': '#f1effa',
          'press-stronger': '#ddd9ef',
          subtle: '#faf9fd',
          'hairline-violet': '#ddd9ef',
          'hairline-cool': '#c9c2ec',
          'hairline-cloud': '#e9e5f6',
          muted: '#64748b',
          faint: '#94a3b8',
          ring: '#6a5fc1',
        },
        // First-class semantic shorthand utility classes
        night: '#faf9fd',
        canvas: {
          DEFAULT: '#ffffff',
          tint: '#faf9fd',
        },
        hairline: {
          DEFAULT: '#ddd9ef',
          violet: '#ddd9ef',
          cool: '#c9c2ec',
          cloud: '#e9e5f6',
        },
        muted: '#64748b',
        faint: '#94a3b8',
        lime: {
          DEFAULT: '#c2ef4e',
          400: '#c2ef4e',
          500: '#addc3b',
        },
        // Brand violet ramp derived from accent-violet #6a5fc1 (500).
        // Tints are white mixes of the brand hue; shades step toward
        // violet-deep #422082 (800) and midnight #150f23 (950).
        violet: {
          50: '#f3f2fa',
          100: '#e9e7f6',
          200: '#d2cfec',
          300: '#b2acdf',
          400: '#8c84d0',
          DEFAULT: '#6a5fc1',
          500: '#6a5fc1',
          600: '#5b50b3',
          700: '#4f44a4',
          800: '#422082',
          900: '#2a1e47',
          950: '#150f23',
          deep: '#422082',
          mid: '#8c84d0',
          light: '#d2cfec',
        },
        // Azure: the single derived data hue beyond the locked palette.
        // Justification: a 4th categorical series (charts, Starter plan,
        // informational tiles) that must stay distinct from violet
        // (AI/info), emerald (success), amber (attention), and rose (risk)
        // without borrowing lime, which is reserved for primary CTAs.
        azure: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          DEFAULT: '#0284c7',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        pink: {
          DEFAULT: '#e11d48',
        },
        // Standard slate scale for crisp contrast in light mode
        slate: {
          50: '#faf9fd',
          100: '#f1effa',
          200: '#ddd9ef',
          300: '#c9c2ec',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        primary: {
          DEFAULT: '#0f172a',
          50: '#faf9fd',
          100: '#f1effa',
          200: '#ddd9ef',
          300: '#c9c2ec',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
    },
  },
  plugins: [],
}
