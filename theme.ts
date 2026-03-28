import { Platform, TextStyle, ViewStyle } from "react-native";

// ─── Palette ───────────────────────────────────────────────
export const C = {
  bg:        "#0A0A0C",
  surface:   "#131316",
  surfaceHi: "#1A1A1F",
  text:      "#E2E0DC",
  textDim:   "#6E6D6A",
  accent:    "#C4302B",       // crimson
  accentDim: "#8B211D",
  border:    "#1F1F24",
  error:     "#C4302B",
  doom1:     "#C9A227",       // mild doom (amber)
  doom2:     "#D4742A",       // moderate doom (orange)
  doom3:     "#C4302B",       // severe doom (crimson)
} as const;

// ─── Doom score color ──────────────────────────────────────
export function doomColor(score: number): string {
  const abs = Math.abs(score);
  if (abs >= 4) return C.doom3;
  if (abs >= 2) return C.doom2;
  return C.doom1;
}

// ─── Glow (web = boxShadow, native = shadow props) ────────
export function glow(color: string, radius: number = 12): ViewStyle {
  if (Platform.OS === "web") {
    return {
      // @ts-ignore — web-only
      boxShadow: `0 0 ${radius}px ${color}`,
    };
  }
  return {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: radius / 2,
    elevation: 4,
  };
}

// ─── Text glow (web = textShadow, native = noop) ──────────
export function textGlow(color: string, radius: number = 8): TextStyle {
  if (Platform.OS === "web") {
    return {
      // @ts-ignore — web-only
      textShadowColor: color,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: radius,
    };
  }
  return {
    textShadowColor: color,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: radius,
  };
}

// ─── Shared typography ─────────────────────────────────────
export const T = {
  headline: {
    fontSize: 17,
    fontWeight: "400",
    color: C.text,
    letterSpacing: 0.2,
  } as TextStyle,
  body: {
    fontSize: 15,
    fontWeight: "300",
    color: C.text,
    lineHeight: 24,
    letterSpacing: 0.15,
  } as TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: "300",
    color: C.textDim,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  } as TextStyle,
  title: {
    fontSize: 21,
    fontWeight: "500",
    color: C.text,
    letterSpacing: 0.3,
  } as TextStyle,
} as const;
