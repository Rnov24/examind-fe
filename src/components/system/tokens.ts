/**
 * EXAMIND Unified Design System Tokens
 * Source of Truth for Foundations, Primitives, and Components
 *
 * Core Brand Polarity:
 * - Daylight-White (#ffffff) paper surfaces for dense exam taking, administration, and procurement.
 * - Midnight-Violet (#150f23) authoritative canvas for high-stakes authority and navigation.
 * - Electric Lime (#c2ef4e) signature brand highlighter & primary interactive punch.
 * - Pedagogical Accent-Violet (#6a5fc1) for AI insight, analytics, and intelligence cues.
 *
 * Craft Floor:
 * - Lucide icons only (NO emojis, NO unicode glyphs as icons).
 * - Indonesian copy conventions.
 * - WCAG AA contrast compliance.
 * - No dark mode (daylight surface model).
 */

// ============================================================================
// 1. RAW TOKENS (Hex values, numeric units, raw scales)
// ============================================================================

export const rawColors = {
  brand: {
    midnight: '#150f23',
    midnightSurface: '#1f1633',
    midnightHairline: '#362d59',
    midnightElevated: '#2a1e47',
    lime: '#c2ef4e',
    limeHover: '#b5e640',
    limeActive: '#a0d426',
    limeBorder: '#a8dc2c',
    limeGlow: 'rgba(194, 239, 78, 0.4)',
    violet: '#6a5fc1',
    violetHover: '#5b50b3',
    violetActive: '#4f44a4',
    violetBorder: '#584dae',
    violetDeep: '#422082',
    violetGlow: 'rgba(106, 95, 193, 0.25)',
  },
  semantic: {
    lime: '#c2ef4e',       // Primary signature highlight
    emerald: '#10b981',    // Success / Healthy / Verified
    rose: '#e11d48',       // Error / Destructive / Critical
    amber: '#f59e0b',      // Warning / Pending / Attention
    violet: '#6a5fc1',     // AI / Pedagogical / Intelligence
    slate: '#64748b',      // Neutral / Muted
  },
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },
} as const

export const rawRadii = {
  none: '0px',
  xs: '4px',       // Micro badges, keyword chips, stamps
  sm: '6px',       // Status dots, sub-indicators
  md: '8px',       // Small buttons, badges, tooltips
  lg: '12px',      // Standard inputs, controls, buttons, inner cards
  xl: '16px',      // Standard cards, modals, table containers
  full: '9999px',  // Pills, avatars, circular buttons, status caps
} as const

export const rawShadows = {
  micro: '0 1px 2px 0 rgba(15, 23, 42, 0.03)',
  subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
  card: '0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
  cardHover: '0 12px 24px -6px rgba(15, 23, 42, 0.08), 0 4px 8px -4px rgba(15, 23, 42, 0.04)',
  elevated: '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
  modal: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
  glowLime: '0 0 20px -3px rgba(194, 239, 78, 0.4)',
  glowViolet: '0 0 25px -5px rgba(106, 95, 193, 0.25)',
  midnight: '0 10px 30px -10px rgba(21, 15, 35, 0.5)',
} as const

export const rawSpacing = {
  xxs: '2px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  section: '48px',
} as const

// ============================================================================
// 2. TAILWIND CLASS TOKEN MAPPINGS (Unified styling building blocks)
// ============================================================================

export const tokens = {
  /**
   * Corner Radii Scale:
   * - xs (rounded): 4px - Keyword chips, integrity stamps, micro badges
   * - sm (rounded-md): 6px - Sub-indicators, table badges
   * - md (rounded-lg): 8px - Small controls, tags, icon buttons
   * - lg (rounded-xl): 12px - Inputs, selects, buttons, bento blocks, sub-containers
   * - xl (rounded-2xl): 16px - Canonical cards, modals, table containers, popups
   * - full (rounded-full): 9999px - Pills, ribbons, circular actions, avatars
   */
  radius: {
    none: 'rounded-none',
    xs: 'rounded',
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
    full: 'rounded-full',
  },

  /**
   * Surface Backgrounds:
   * Grounded in Daylight Paper & Midnight Authority polarity.
   */
  surface: {
    card: 'bg-white',
    subtle: 'bg-[#faf9fd]',
    muted: 'bg-[#f1effa]',
    hover: 'hover:bg-[#f1effa]',
    active: 'active:bg-[#f1effa]',
    midnight: 'bg-[#150f23]',
    midnightSurface: 'bg-[#1f1633]',
  },

  /**
   * Precision Borders & Hairlines:
   * Single-source styling for 1px crisp borders.
   * Light-surface hairlines are violet-tinted (derived from midnight-violet),
   * never pure gray, so cards separate from the tinted canvas by hue as
   * well as lightness.
   */
  border: {
    subtle: 'border border-[#e9e5f6]',
    default: 'border border-[#ddd9ef]',
    strong: 'border border-[#c9c2ec]',
    divider: 'border-[#e9e5f6]',
    divideY: 'divide-y divide-[#e9e5f6]',
    divideX: 'divide-x divide-[#e9e5f6]',
    midnight: 'border border-[#362d59]',
    midnightProminent: 'border border-[#2a1e47]',
    focus: 'focus:border-[#150f23] focus:ring-2 focus:ring-[#6a5fc1]/25',
    focusLime: 'focus:border-[#150f23] focus:ring-2 focus:ring-[#c2ef4e]',
    focusRose: 'focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25',
  },

  /**
   * Shadow & Elevation Ladders:
   * From micro badges to prominent modal dialogs.
   */
  shadow: {
    none: 'shadow-none',
    micro: 'shadow-2xs',
    subtle: 'shadow-xs',
    card: 'shadow-card',
    cardHover: 'shadow-card hover:shadow-card-hover hover:-translate-y-0.5',
    elevated: 'shadow-subtle-elevated',
    modal: 'shadow-2xl',
    midnight: 'shadow-midnight-elevated',
    glowLime: 'shadow-glow-lime',
    glowViolet: 'shadow-glow-violet',
  },

  /**
   * Semantic Status Palettes:
   * Solid, badge, subtle background, border, text, dot, and accent top bar.
   */
  semantic: {
    lime: {
      solid: 'bg-[#c2ef4e] text-[#150f23] border border-[#a8dc2c]',
      badge: 'bg-[#c2ef4e] text-[#150f23] border border-[#a8dc2c]',
      subtle: 'bg-[#c2ef4e]/20 text-[#150f23] border border-[#c2ef4e]/60',
      text: 'text-[#150f23]',
      dot: 'bg-[#150f23]',
      accentBar: 'before:bg-[#c2ef4e]',
      hover: 'hover:bg-[#b5e640] hover:shadow-glow-lime',
    },
    violet: {
      solid: 'bg-[#6a5fc1] text-white border border-[#584dae]',
      badge: 'bg-violet-50 text-[#6a5fc1] border border-violet-200/80',
      subtle: 'bg-violet-50/80 text-[#6a5fc1] border border-violet-200/70',
      text: 'text-[#6a5fc1]',
      dot: 'bg-[#6a5fc1]',
      accentBar: 'before:bg-[#6a5fc1]',
      hover: 'hover:bg-[#5b50b3] hover:shadow-glow-violet',
    },
    emerald: {
      solid: 'bg-emerald-600 text-white border border-emerald-700',
      badge: 'bg-emerald-50 text-emerald-800 border border-emerald-200/90',
      subtle: 'bg-emerald-50/70 text-emerald-900 border border-emerald-100',
      text: 'text-emerald-700',
      dot: 'bg-emerald-500',
      accentBar: 'before:bg-[#10b981]',
      hover: 'hover:bg-emerald-100 hover:text-emerald-900',
    },
    amber: {
      solid: 'bg-amber-600 text-white border border-amber-700',
      badge: 'bg-amber-50 text-amber-900 border border-amber-300/80',
      subtle: 'bg-amber-50/80 text-amber-900 border border-amber-200/80',
      text: 'text-amber-700',
      dot: 'bg-amber-500',
      accentBar: 'before:bg-[#f59e0b]',
      hover: 'hover:bg-amber-100 hover:text-amber-900',
    },
    rose: {
      solid: 'bg-rose-600 text-white border border-rose-700',
      badge: 'bg-rose-50 text-rose-800 border border-rose-200/90',
      subtle: 'bg-rose-50/70 text-rose-900 border border-rose-200/80',
      text: 'text-rose-700',
      dot: 'bg-rose-500',
      accentBar: 'before:bg-[#e11d48]',
      hover: 'hover:bg-rose-100 hover:text-rose-900',
    },
    midnight: {
      solid: 'bg-[#150f23] text-white border border-[#2a1e47]',
      badge: 'bg-[#150f23] text-white border border-[#2a1e47]',
      subtle: 'bg-[#1f1633] text-white border border-[#362d59]',
      text: 'text-[#150f23]',
      dot: 'bg-[#c2ef4e]',
      accentBar: 'before:bg-[#150f23]',
      hover: 'hover:bg-[#1f1633]',
    },
    neutral: {
      solid: 'bg-slate-900 text-white border border-slate-950',
      badge: 'bg-[#f1effa] text-slate-700 border border-[#ddd9ef]',
      subtle: 'bg-[#faf9fd] text-slate-700 border border-[#ddd9ef]',
      text: 'text-slate-600',
      dot: 'bg-slate-500',
      accentBar: 'before:bg-slate-400',
      hover: 'hover:bg-[#f1effa] hover:text-slate-900',
    },
  },

  /**
   * Stat / KPI Icon Tiles:
   * Tinted background + saturated icon + matching hairline, one hue per
   * meaning. The number itself always stays ink — color carries category,
   * never the value. Lime is deliberately absent: it belongs to primary
   * CTAs and active navigation only.
   */
  tile: {
    violet: 'bg-[#f1effa] text-[#6a5fc1] border-[#ddd9ef]',
    azure: 'bg-azure-50 text-azure-700 border-azure-200/80',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
    amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
    rose: 'bg-rose-50 text-rose-700 border-rose-200/80',
    midnight: 'bg-[#150f23] text-white border-[#362d59]',
    neutral: 'bg-[#faf9fd] text-slate-700 border-[#ddd9ef]',
  },

  /**
   * Top Accent Bar Base:
   * 3px signature accent stripe positioned at top edge of cards, tables, modals.
   */
  accentBarBase:
    'before:absolute before:top-0 before:left-0 before:right-0 before:h-[3px] before:z-10',

  /**
   * Typography Hierarchy (Plus Jakarta Sans & JetBrains Mono):
   */
  typography: {
    hero: 'font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-[#1f1633]',
    title: 'font-display font-extrabold text-base sm:text-lg tracking-tight text-[#1f1633]',
    subheading: 'font-display font-bold text-sm tracking-tight text-[#1f1633]',
    eyebrow: 'font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400',
    body: 'font-sans text-xs sm:text-sm text-slate-600 leading-relaxed',
    bodyMuted: 'font-sans text-xs text-slate-500 leading-relaxed',
    caption: 'font-sans text-[11px] text-slate-500 font-medium',
    monoBadge: 'font-mono font-bold tracking-tight',
    monoMeta: 'font-mono text-[11px] font-semibold text-slate-700',
  },

  /**
   * Spacing and Padding Standards:
   */
  spacing: {
    cardPaddingSm: 'p-4',
    cardPaddingMd: 'p-5 sm:p-6',
    cardPaddingLg: 'p-6 sm:p-8',
    headerPadding: 'px-5 sm:px-6 pt-5 pb-3',
    footerPadding: 'px-5 sm:px-6 py-3',
    gapSm: 'gap-2',
    gapMd: 'gap-3 sm:gap-4',
    gapLg: 'gap-6',
  },

  /**
   * Transitions:
   */
  transition: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    colors: 'transition-colors duration-150 ease-out',
  },
} as const

export type DesignTokens = typeof tokens

/**
 * Categorical Chart Palette:
 * Brand hues only, ordered so adjacent series stay distinguishable by
 * lightness as well as hue (never color alone — every series also gets a
 * label or legend entry). Lime is forbidden here by design: it is spent
 * exclusively on primary CTAs and active navigation.
 * Azure (#0284c7) is the one derived hue beyond the locked palette,
 * justified as the 4th data category (informational/neutral volume)
 * that must not collide with violet (AI), emerald (success),
 * amber (attention), or rose (risk).
 */
export const chartPalette = {
  midnight: '#150f23',
  violet: '#6a5fc1',
  azure: '#0284c7',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#e11d48',
} as const

/** Default series assignment order for multi-series charts. */
export const chartSeriesOrder = [
  chartPalette.violet,
  chartPalette.azure,
  chartPalette.emerald,
  chartPalette.amber,
  chartPalette.rose,
  chartPalette.midnight,
] as const

export default tokens
