import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── ZYVV Color System ──────────────────────────────────────
      // Black is the canvas. Neon is used sparingly.
      // One accent color per state.
      colors: {
        black: '#000000',
        'zyvv-cyan':   '#00F5FF',   // neutral / input state
        'zyvv-green':  '#00FF94',   // conventional door
        'zyvv-red':    '#FF2D55',   // contrarian door
        'zyvv-purple': '#BF5AF2',   // alien door
        'zyvv-dim':    '#111111',   // card / surface backgrounds
        'zyvv-border': '#222222',   // subtle borders
        'zyvv-muted':  '#555555',   // secondary text
      },

      // ── Typography ─────────────────────────────────────────────
      // Massive and tight. Like a SpaceX mission badge.
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'display': ['92px', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'hero':    ['56px', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
        'title':   ['32px', { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'label':   ['13px', { lineHeight: '1.4',  letterSpacing: '0.08em'  }],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter:  '-0.03em',
        wide:     '0.08em',
      },

      // ── Animation ──────────────────────────────────────────────
      // Purposeful. Nothing bounces. Nothing is cute.
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.4' },
        },
        'door-open': {
          '0%':   { transform: 'scaleY(0)', transformOrigin: 'bottom' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'bottom' },
        },
      },
      animation: {
        'fade-up':    'fade-up 0.5s ease-out forwards',
        'fade-in':    'fade-in 0.4s ease-out forwards',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'door-open':  'door-open 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },

      // ── Spacing ────────────────────────────────────────────────
      // Mobile-first. Everything designed for 390px.
      maxWidth: {
        'mobile': '390px',
        'card':   '420px',
      },

      // ── Box Shadow ─────────────────────────────────────────────
      // Neon glows for active states. Subtle, not garish.
      boxShadow: {
        'cyan':   '0 0 24px rgba(0, 245, 255, 0.25)',
        'green':  '0 0 24px rgba(0, 255, 148, 0.25)',
        'red':    '0 0 24px rgba(255, 45, 85,  0.25)',
        'purple': '0 0 24px rgba(191, 90, 242, 0.25)',
        'glow':   '0 0 40px rgba(0, 245, 255, 0.15)',
      },
    },
  },
  plugins: [],
}

export default config
