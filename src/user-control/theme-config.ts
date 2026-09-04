/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║              LAUNCHPAD — THEME CONFIGURATION                     ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

export const themeConfig = {
  /**
   * COLOR PALETTE — warm ink + amber accent, distinct from generic
   * blue-violet SaaS templates. OKLCH for wide-gamut, perceptually even
   * color across light/dark.
   */
  colors: {
    primary: {
      DEFAULT: "oklch(0.62 0.19 45)", // Warm amber-orange
      foreground: "oklch(0.99 0 0)",
      hover: "oklch(0.56 0.2 45)",
    },
    secondary: {
      DEFAULT: "oklch(0.95 0.015 60)",
      foreground: "oklch(0.32 0.05 45)",
    },
    destructive: {
      DEFAULT: "oklch(0.58 0.21 25)",
      foreground: "oklch(0.98 0 0)",
    },
    background: {
      DEFAULT: "oklch(0.985 0.003 90)",
      dark: "oklch(0.14 0.012 55)",
      card: "oklch(1 0 0)",
      cardDark: "oklch(0.18 0.015 55)",
      muted: "oklch(0.96 0.006 70)",
      mutedDark: "oklch(0.22 0.015 55)",
    },
    foreground: {
      DEFAULT: "oklch(0.18 0.015 55)",
      dark: "oklch(0.95 0.01 70)",
      muted: "oklch(0.5 0.02 60)",
    },
    border: {
      DEFAULT: "oklch(0.9 0.01 65)",
      dark: "oklch(0.28 0.018 55)",
    },
  },

  fonts: {
    sans: "var(--font-sans)",
    mono: "var(--font-mono)",
    display: "var(--font-display)",
  },

  radius: {
    sm: "0.5rem",
    DEFAULT: "0.75rem",
    md: "0.875rem",
    lg: "1rem",
    xl: "1.375rem",
    "2xl": "1.75rem",
    full: "9999px",
  },

  shadows: {
    card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 6px -1px rgb(0 0 0 / 0.06)",
    dropdown: "0 12px 24px -6px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.08)",
    modal: "0 30px 60px -15px rgb(0 0 0 / 0.3)",
    glow: "0 0 0 1px oklch(0.62 0.19 45 / 0.12), 0 8px 30px -8px oklch(0.62 0.19 45 / 0.35)",
  },

  animations: {
    fadeUp: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.4 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.94 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
    },
    staggerChildren: {
      animate: { transition: { staggerChildren: 0.09 } },
    },
  },
} as const;

export type ThemeConfig = typeof themeConfig;
