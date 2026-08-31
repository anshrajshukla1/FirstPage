import { Category } from "@/types";

/**
 * One visual identity per occasion.
 *
 * <p>Every page used to render on the same indigo-and-purple gradient, so a
 * marriage proposal and an apology looked identical. These thirteen directions
 * are the fix: the viewer resolves one from `microsite.category` and applies it
 * as scoped CSS custom properties, so the dashboard chrome in `index.css` is
 * untouched.
 *
 * <p>The `themes` table is deliberately unused — hand-tuned identities beat a
 * generic CSS-variable blob, and nothing has ever written to it.
 */

export const MOTIFS = [
  "candle",
  "riso",
  "deckle",
  "polaroid",
  "engraved",
  "tape",
  "splitflap",
  "botanical",
  "foil",
  "gingham",
  "seal",
  "wool",
  "grid",
] as const;
export type MotifKey = (typeof MOTIFS)[number];

/**
 * Type faces, keyed by family. Five families cover thirteen occasions, so any
 * single page loads exactly one display face.
 */
const FACES = {
  cormorant: {
    stack: '"Cormorant Garamond", Georgia, serif',
    google: "Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400",
  },
  bricolage: {
    stack: '"Bricolage Grotesque", "Outfit", system-ui, sans-serif',
    google: "Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800",
  },
  newsreader: {
    stack: '"Newsreader", Georgia, serif',
    google:
      "Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,600;1,6..72,300",
  },
  fraunces: {
    stack: '"Fraunces", Georgia, serif',
    google: "Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400",
  },
  spaceGrotesk: {
    stack: '"Space Grotesk", "Inter", system-ui, sans-serif',
    google: "Space+Grotesk:wght@400;500;700",
  },
} as const;

type FaceKey = keyof typeof FACES;

export interface Occasion {
  /** The art direction's own name — used in the editor's occasion preview. */
  name: string;
  palette: {
    /** Page background. */
    bg: string;
    /** Body copy. Every pairing here clears 4.5:1 against `bg`. */
    fg: string;
    /** The single bright or metallic element: rules, numerals, the Yes button. */
    accent: string;
    /** Captions, hairlines, dates. */
    muted: string;
  };
  display: {
    face: FaceKey;
    /** Display weight. Serif faces carry headlines at a lighter weight. */
    weight: number;
    tracking: string;
  };
  /** Whether body copy is set in the display face or in Inter. */
  body: "display" | "sans";
  motif: MotifKey;
  /** Drives reveal durations — a proposal should not feel brisk. */
  pace: "slow" | "measured" | "lively";
  /** The line on the closed page, and what the tap is called. */
  seal: { kicker: string; action: string };
}

export const OCCASIONS: Record<Category, Occasion> = {
  [Category.PROPOSAL]: {
    name: "Ink & Champagne",
    palette: {
      bg: "#0B0E14",
      fg: "#F4E4C1",
      accent: "#C9A227",
      muted: "#6E7480",
    },
    display: { face: "cormorant", weight: 500, tracking: "-0.02em" },
    body: "sans",
    motif: "candle",
    pace: "slow",
    seal: { kicker: "There's a question inside.", action: "Break the seal" },
  },

  [Category.BIRTHDAY]: {
    name: "Risograph Party",
    palette: {
      bg: "#FFF8E7",
      fg: "#2B6CB0",
      accent: "#FF5B4A",
      muted: "#FFD166",
    },
    display: { face: "bricolage", weight: 800, tracking: "-0.03em" },
    body: "sans",
    motif: "riso",
    pace: "lively",
    seal: { kicker: "Something arrived for you.", action: "Open it" },
  },

  [Category.APOLOGY]: {
    name: "Handmade Grey",
    palette: {
      bg: "#E8E6E1",
      fg: "#3A3A38",
      accent: "#9C6B5A",
      muted: "#C4BEB4",
    },
    display: { face: "newsreader", weight: 400, tracking: "0" },
    body: "display",
    motif: "deckle",
    pace: "slow",
    seal: { kicker: "Someone would like a minute.", action: "Read it" },
  },

  [Category.CRUSH]: {
    name: "Polaroid Dusk",
    palette: {
      bg: "#1B1420",
      fg: "#FFD9E0",
      accent: "#FF7A9C",
      muted: "#6C5570",
    },
    display: { face: "cormorant", weight: 600, tracking: "-0.01em" },
    body: "sans",
    motif: "polaroid",
    pace: "measured",
    seal: { kicker: "Someone wanted you to see this.", action: "Open" },
  },

  [Category.ANNIVERSARY]: {
    name: "Gold Leaf on Oxblood",
    palette: {
      bg: "#2A0E14",
      fg: "#F6EFE4",
      accent: "#D4A24C",
      muted: "#8E3B4A",
    },
    display: { face: "cormorant", weight: 500, tracking: "-0.01em" },
    body: "sans",
    motif: "engraved",
    pace: "slow",
    seal: { kicker: "A year of it, written down.", action: "Open" },
  },

  [Category.FRIENDSHIP]: {
    name: "Marker & Tape",
    palette: {
      bg: "#14181C",
      fg: "#F2F4F0",
      accent: "#46E5B7",
      muted: "#FFC24B",
    },
    display: { face: "spaceGrotesk", weight: 700, tracking: "-0.03em" },
    body: "sans",
    motif: "tape",
    pace: "lively",
    seal: { kicker: "Made for you, obviously.", action: "Open it" },
  },

  [Category.FAREWELL]: {
    name: "Departure Board",
    palette: {
      bg: "#0F1B24",
      fg: "#E6EDF2",
      accent: "#7FB2CE",
      muted: "#C86B4A",
    },
    display: { face: "newsreader", weight: 400, tracking: "0.01em" },
    body: "display",
    motif: "splitflap",
    pace: "measured",
    seal: { kicker: "Before you go.", action: "Open" },
  },

  [Category.THANK_YOU]: {
    name: "Pressed Botanical",
    palette: {
      bg: "#F3F1E7",
      fg: "#2C3A2E",
      accent: "#7A8B5C",
      muted: "#C9A227",
    },
    display: { face: "newsreader", weight: 400, tracking: "0" },
    body: "display",
    motif: "botanical",
    pace: "measured",
    seal: { kicker: "Someone wanted to thank you properly.", action: "Read it" },
  },

  [Category.CONGRATULATIONS]: {
    name: "Trophy Foil",
    palette: {
      bg: "#101013",
      fg: "#FFFFFF",
      accent: "#FFCF3D",
      muted: "#3D6FFF",
    },
    display: { face: "bricolage", weight: 800, tracking: "-0.04em" },
    body: "sans",
    motif: "foil",
    pace: "lively",
    seal: { kicker: "You did it. Someone noticed.", action: "Open it" },
  },

  [Category.FAMILY]: {
    name: "Kitchen Table",
    palette: {
      bg: "#FBF3E4",
      fg: "#3A2E26",
      accent: "#C2603F",
      muted: "#6E8B6B",
    },
    display: { face: "fraunces", weight: 600, tracking: "-0.01em" },
    body: "sans",
    motif: "gingham",
    pace: "measured",
    seal: { kicker: "From the people who claim you.", action: "Open" },
  },

  [Category.GRADUATION]: {
    name: "Diploma Ledger",
    palette: {
      bg: "#12223A",
      fg: "#F5F1E6",
      accent: "#B08A3E",
      muted: "#7B94B5",
    },
    display: { face: "fraunces", weight: 600, tracking: "0" },
    body: "sans",
    motif: "seal",
    pace: "measured",
    seal: { kicker: "Cap, gown, and a page to keep.", action: "Open" },
  },

  [Category.BABY_WELCOME]: {
    name: "Soft Wool",
    palette: {
      bg: "#FFFDF8",
      fg: "#4A4238",
      accent: "#A8C8D8",
      muted: "#F2B8B0",
    },
    display: { face: "bricolage", weight: 600, tracking: "-0.02em" },
    body: "sans",
    motif: "wool",
    pace: "slow",
    seal: { kicker: "Welcome to the world.", action: "Open" },
  },

  [Category.CUSTOM]: {
    name: "Studio Neutral",
    palette: {
      bg: "#0E0E10",
      fg: "#FAFAF8",
      accent: "#4D5BFF",
      muted: "#8A8A85",
    },
    display: { face: "spaceGrotesk", weight: 500, tracking: "-0.02em" },
    body: "sans",
    motif: "grid",
    pace: "measured",
    seal: { kicker: "Someone made this for you.", action: "Open" },
  },
};

/** Falls back to Studio Neutral so an unknown category still renders. */
export function occasionFor(category: Category | undefined): Occasion {
  return (category && OCCASIONS[category]) || OCCASIONS[Category.CUSTOM];
}

/** Seconds for a slide's entrance, by pace. */
export const PACE_SECONDS: Record<Occasion["pace"], number> = {
  slow: 1.1,
  measured: 0.7,
  lively: 0.45,
};

/**
 * The custom properties the viewer root sets. Prefixed `--oc-` so they can't
 * collide with the app's own `--color-*` tokens.
 */
export function occasionStyle(occasion: Occasion): React.CSSProperties {
  const face = FACES[occasion.display.face];
  const { bg, fg, accent, muted } = occasion.palette;

  return {
    "--oc-bg": bg,
    "--oc-fg": fg,
    "--oc-accent": accent,
    "--oc-muted": muted,
    "--oc-display": face.stack,
    "--oc-display-weight": String(occasion.display.weight),
    "--oc-display-tracking": occasion.display.tracking,
    "--oc-body":
      occasion.body === "display" ? face.stack : '"Inter", system-ui, sans-serif',
    backgroundColor: bg,
    color: fg,
  } as React.CSSProperties;
}

/**
 * Loads the occasion's display face, once per family per session.
 *
 * <p>Injected here rather than in `index.html` so the dashboard never pays for
 * thirteen faces it doesn't use, and so a recipient on mobile data downloads
 * exactly one.
 */
const loaded = new Set<string>();

export function loadOccasionFont(occasion: Occasion): void {
  const { google } = FACES[occasion.display.face];
  if (loaded.has(google)) return;
  loaded.add(google);

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = `https://fonts.googleapis.com/css2?family=${google}&display=swap`;
  document.head.appendChild(link);
}
