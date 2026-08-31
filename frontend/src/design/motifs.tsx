import { motion, useReducedMotion } from "motion/react";
import type { Occasion } from "./occasions";

/**
 * The ambient layer behind each occasion's slides.
 *
 * <p>One motif per occasion, each a single quiet idea drawn from that occasion's
 * own world — a candle for a proposal, mis-registered ink for a birthday,
 * masking tape for a friendship. They sit behind the content, never take a
 * pointer event, and are announced to nothing.
 *
 * <p>Every animated motif goes still under `prefers-reduced-motion`; the texture
 * stays, the movement stops.
 */

const LAYER =
  "pointer-events-none absolute inset-0 overflow-hidden select-none";

/** Paper/ink grain. Cheap: one SVG filter, no image request. */
function Grain({ opacity = 0.14 }: { opacity?: number }) {
  return (
    <svg className="absolute inset-0 h-full w-full" style={{ opacity }}>
      <filter id="oc-grain">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.82"
          numOctaves={3}
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#oc-grain)" />
    </svg>
  );
}

// ── One per occasion ───────────────────────────────────────────────────

function Candle({ still }: { still: boolean }) {
  return (
    <div className={LAYER}>
      <motion.div
        className="absolute left-1/2 top-0 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/3 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--oc-accent) 22%, transparent) 0%, transparent 62%)",
        }}
        animate={still ? undefined : { opacity: [0.75, 1, 0.82, 0.95, 0.8] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Gold hairlines: the engraved-invitation register, held to two rules. */}
      <div
        className="absolute inset-x-[8%] top-10 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--oc-accent), transparent)",
          opacity: 0.5,
        }}
      />
      <div
        className="absolute inset-x-[8%] bottom-10 h-px"
        style={{
          background:
            "linear-gradient(to right, transparent, var(--oc-accent), transparent)",
          opacity: 0.5,
        }}
      />
    </div>
  );
}

function Riso() {
  return (
    <div className={LAYER}>
      {/* Two ink layers, deliberately out of register. */}
      <div
        className="absolute -left-24 top-[12%] h-72 w-72 rounded-full"
        style={{
          background: "var(--oc-accent)",
          opacity: 0.16,
          mixBlendMode: "multiply",
        }}
      />
      <div
        className="absolute -right-16 bottom-[8%] h-80 w-80 rounded-full"
        style={{
          background: "var(--oc-muted)",
          opacity: 0.22,
          mixBlendMode: "multiply",
        }}
      />
      <Grain opacity={0.1} />
    </div>
  );
}

function Deckle() {
  return (
    <div className={LAYER}>
      {/* Torn edges. Nothing on an apology page should look machine-cut. */}
      <svg
        className="absolute inset-y-0 left-0 h-full w-3"
        preserveAspectRatio="none"
        viewBox="0 0 12 100"
      >
        <path
          d="M12 0 C6 6 9 12 5 18 C1 24 8 30 4 37 C0 44 9 50 6 57 C3 64 8 70 4 77 C0 84 9 90 7 100 L0 100 L0 0 Z"
          fill="var(--oc-muted)"
          opacity="0.5"
        />
      </svg>
      <svg
        className="absolute inset-y-0 right-0 h-full w-3"
        preserveAspectRatio="none"
        viewBox="0 0 12 100"
      >
        <path
          d="M0 0 C6 6 3 12 7 18 C11 24 4 30 8 37 C12 44 3 50 6 57 C9 64 4 70 8 77 C12 84 3 90 5 100 L12 100 L12 0 Z"
          fill="var(--oc-muted)"
          opacity="0.5"
        />
      </svg>
      <Grain opacity={0.16} />
    </div>
  );
}

function Polaroid({ still }: { still: boolean }) {
  return (
    <div className={LAYER}>
      <motion.div
        className="absolute -left-32 -top-24 h-[26rem] w-[26rem] rounded-full blur-3xl"
        style={{ background: "var(--oc-accent)", opacity: 0.18 }}
        animate={still ? undefined : { scale: [1, 1.08, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="absolute -bottom-28 -right-24 h-96 w-96 rounded-full blur-3xl"
        style={{ background: "var(--oc-muted)", opacity: 0.35 }}
      />
      <Grain opacity={0.12} />
    </div>
  );
}

function Engraved() {
  const rule = (
    <svg height="10" className="w-full" preserveAspectRatio="none">
      <pattern
        id="oc-engrave"
        width="18"
        height="10"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M0 5 H6 M9 2 L12 5 L9 8 M12 5 H18"
          stroke="var(--oc-accent)"
          strokeWidth="0.7"
          fill="none"
        />
      </pattern>
      <rect width="100%" height="10" fill="url(#oc-engrave)" opacity="0.45" />
    </svg>
  );

  return (
    <div className={LAYER}>
      <div className="absolute inset-x-[10%] top-8">{rule}</div>
      <div className="absolute inset-x-[10%] bottom-8">{rule}</div>
    </div>
  );
}

function Tape() {
  const strip = "absolute h-7 w-28 opacity-25";
  return (
    <div className={LAYER}>
      <div
        className={strip}
        style={{
          top: "1.5rem",
          left: "-1.5rem",
          rotate: "-24deg",
          background: "var(--oc-muted)",
        }}
      />
      <div
        className={strip}
        style={{
          bottom: "2.5rem",
          right: "-2rem",
          rotate: "18deg",
          background: "var(--oc-accent)",
        }}
      />
      {/* A hand-drawn arrow, the way you'd scrawl one on a photo. */}
      <svg
        className="absolute bottom-16 left-8 h-16 w-24 opacity-30"
        viewBox="0 0 100 60"
        fill="none"
      >
        <path
          d="M4 52 C24 46 40 30 52 12"
          stroke="var(--oc-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M40 10 L54 9 L52 24"
          stroke="var(--oc-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

function SplitFlap() {
  return (
    <div className={LAYER}>
      {/* Boarding-pass perforation down one side. */}
      <div
        className="absolute inset-y-0 left-16 w-px"
        style={{
          background:
            "repeating-linear-gradient(to bottom, var(--oc-accent) 0 6px, transparent 6px 14px)",
          opacity: 0.4,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0 22px, color-mix(in srgb, var(--oc-fg) 4%, transparent) 22px 23px)",
        }}
      />
    </div>
  );
}

function Botanical() {
  return (
    <div className={LAYER}>
      <svg
        className="absolute -right-10 top-1/4 h-80 w-80 opacity-[0.18]"
        viewBox="0 0 120 200"
        fill="none"
      >
        <path
          d="M60 195 C60 140 60 80 60 8"
          stroke="var(--oc-accent)"
          strokeWidth="1.6"
        />
        {[30, 60, 90, 120, 150].map((y, i) => (
          <g key={y}>
            <path
              d={`M60 ${y} C${34 - i * 2} ${y - 16} ${26 - i} ${y + 4} 60 ${y + 10}`}
              fill="var(--oc-accent)"
            />
            <path
              d={`M60 ${y + 14} C${86 + i * 2} ${y - 2} ${94 + i} ${y + 18} 60 ${y + 24}`}
              fill="var(--oc-accent)"
            />
          </g>
        ))}
      </svg>
      <Grain opacity={0.13} />
    </div>
  );
}

function Foil({ still }: { still: boolean }) {
  return (
    <div className={LAYER}>
      <motion.div
        className="absolute inset-y-0 w-1/3"
        style={{
          background:
            "linear-gradient(105deg, transparent, color-mix(in srgb, var(--oc-accent) 30%, transparent), transparent)",
        }}
        initial={{ x: "-40%" }}
        animate={still ? undefined : { x: ["-40%", "340%"] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          repeatDelay: 3.5,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

function Gingham() {
  return (
    <div className={LAYER}>
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{
          background:
            "repeating-linear-gradient(0deg, var(--oc-muted) 0 1px, transparent 1px 26px), repeating-linear-gradient(90deg, var(--oc-muted) 0 1px, transparent 1px 26px)",
        }}
      />
      <Grain opacity={0.1} />
    </div>
  );
}

function SealMedallion() {
  return (
    <div className={LAYER}>
      <svg
        className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 opacity-[0.09]"
        viewBox="0 0 200 200"
        fill="none"
      >
        <circle cx="100" cy="100" r="86" stroke="var(--oc-accent)" strokeWidth="2" />
        <circle cx="100" cy="100" r="72" stroke="var(--oc-accent)" strokeWidth="0.8" />
        {Array.from({ length: 36 }, (_, i) => {
          const a = (i / 36) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 74}
              y1={100 + Math.sin(a) * 74}
              x2={100 + Math.cos(a) * 84}
              y2={100 + Math.sin(a) * 84}
              stroke="var(--oc-accent)"
              strokeWidth="1.4"
            />
          );
        })}
      </svg>
      {/* Ruled ledger lines — the diploma register. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(to bottom, transparent 0 31px, color-mix(in srgb, var(--oc-muted) 22%, transparent) 31px 32px)",
        }}
      />
    </div>
  );
}

function Wool({ still }: { still: boolean }) {
  return (
    <motion.div
      className={LAYER}
      animate={still ? undefined : { y: [0, -6, 0] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          background:
            "repeating-linear-gradient(45deg, var(--oc-accent) 0 3px, transparent 3px 9px), repeating-linear-gradient(-45deg, var(--oc-muted) 0 3px, transparent 3px 9px)",
        }}
      />
    </motion.div>
  );
}

function ExposedGrid() {
  return (
    <div className={LAYER}>
      <div
        className="absolute inset-0 opacity-[0.16]"
        style={{
          background:
            "repeating-linear-gradient(90deg, var(--oc-muted) 0 1px, transparent 1px 96px)",
        }}
      />
      <div
        className="absolute inset-x-0 top-1/2 h-px"
        style={{ background: "var(--oc-muted)", opacity: 0.22 }}
      />
    </div>
  );
}

// ── Dispatcher ─────────────────────────────────────────────────────────

export function Motif({ occasion }: { occasion: Occasion }) {
  const still = useReducedMotion() ?? false;

  switch (occasion.motif) {
    case "candle":
      return <Candle still={still} />;
    case "riso":
      return <Riso />;
    case "deckle":
      return <Deckle />;
    case "polaroid":
      return <Polaroid still={still} />;
    case "engraved":
      return <Engraved />;
    case "tape":
      return <Tape />;
    case "splitflap":
      return <SplitFlap />;
    case "botanical":
      return <Botanical />;
    case "foil":
      return <Foil still={still} />;
    case "gingham":
      return <Gingham />;
    case "seal":
      return <SealMedallion />;
    case "wool":
      return <Wool still={still} />;
    case "grid":
      return <ExposedGrid />;
  }
}
