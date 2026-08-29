// constants/theme.ts
// Central Theme Palette & Design System Tokens

import { Platform } from "react-native";

export const Colors = {
  light: {
    text: "#0F172A",
    textSecondary: "#64748B",
    textMuted: "#94A3B8",
    background: "#FFFFFF",
    backgroundElement: "#F8FAFC",
    backgroundSelected: "#EFF6FF",
    border: "#E2E8F0",
    primary: "#2563EB",
    primaryLight: "#EFF6FF",
    gold: "#D97706",
    goldLight: "#FFFBEB",
    navy: "#0F172A",
    danger: "#E11D48",
    dangerLight: "#FFF1F2",
    success: "#10B981",
    successLight: "#ECFDF5",
  },
  dark: {
    text: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    background: "#0F172A",
    backgroundElement: "#1E293B",
    backgroundSelected: "#1E3A8A",
    border: "#334155",
    primary: "#3B82F6",
    primaryLight: "#1E3A8A",
    gold: "#F59E0B",
    goldLight: "#78350F",
    navy: "#020617",
    danger: "#F43F5E",
    dangerLight: "#881337",
    success: "#34D399",
    successLight: "#064E3B",
  },
} as const;

export type ThemeColor = keyof typeof Colors.light;

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    serif: "Georgia, Cambria, serif",
    rounded: "'Nunito', sans-serif",
    mono: "monospace",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 70 }) ?? 0;
export const MaxContentWidth = 800;

export default Colors;
