import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { PACE_SECONDS, type Occasion } from "@/design/occasions";
import { cn } from "@/lib/utils";
import type { Slide } from "@/types";

/**
 * The contract every slide view honours.
 *
 * <p>Each view reads its own settings out of `slide.config` with
 * `parseSlideConfig`, so the registry needs no generics and a malformed config
 * degrades to defaults instead of throwing inside the recipient's page.
 */
export interface SlideViewProps {
  slide: Slide;
  occasion: Occasion;
  /**
   * Called when a PROPOSAL slide is answered, so the sender is told. Only the
   * viewer knows the slug, so the call itself lives there.
   */
  onProposalAnswer?: (accepted: boolean) => void;
}

/** Fonts and colours come from the occasion's scoped custom properties. */
export const displayFont = {
  fontFamily: "var(--oc-display)",
  fontWeight: "var(--oc-display-weight)" as unknown as number,
  letterSpacing: "var(--oc-display-tracking)",
} as const;

export const bodyFont = { fontFamily: "var(--oc-body)" } as const;

/** Entrance timing, tuned per occasion and switched off for reduced motion. */
export function useReveal(occasion: Occasion) {
  const still = useReducedMotion() ?? false;
  const duration = still ? 0 : PACE_SECONDS[occasion.pace];

  return {
    still,
    /** `i` staggers siblings without each one needing its own delay maths. */
    reveal: (i = 0) => ({
      initial: still ? undefined : { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration, delay: still ? 0 : i * duration * 0.35 },
    }),
  };
}

/** The centred column every slide sits in. */
export function Stage({
  children,
  className,
  align = "center",
}: {
  children: ReactNode;
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "mx-auto flex h-full w-full max-w-3xl flex-col justify-center px-6 py-14 sm:px-10",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
      style={bodyFont}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p
      className="mb-4 text-[0.7rem] uppercase tracking-[0.28em]"
      style={{ color: "var(--oc-accent)" }}
    >
      {children}
    </p>
  );
}

export function Display({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2";
}) {
  return (
    <Tag
      className={cn(
        "text-balance text-4xl leading-[1.05] sm:text-5xl md:text-6xl",
        className,
      )}
      style={displayFont}
    >
      {children}
    </Tag>
  );
}

/**
 * Prose from a plain-text field. Blank lines become paragraph breaks, which is
 * what people type into a textarea and expect to see honoured.
 */
export function Prose({
  text,
  className,
  dropCap = false,
}: {
  text: string;
  className?: string;
  dropCap?: boolean;
}) {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <div
      className={cn(
        "space-y-4 text-[1.0625rem] leading-[1.75] sm:text-lg",
        className,
      )}
    >
      {paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={cn(
            dropCap &&
              i === 0 &&
              "first-letter:float-left first-letter:mr-2 first-letter:text-6xl first-letter:leading-[0.85]",
          )}
          style={
            dropCap && i === 0
              ? ({ ...displayFont, fontSize: "inherit" } as React.CSSProperties)
              : undefined
          }
        >
          {/* Single newlines inside a paragraph stay as line breaks. */}
          {paragraph.split("\n").map((line, j, all) => (
            <span key={j}>
              {line}
              {j < all.length - 1 && <br />}
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

/** A hairline in the occasion's accent. Used instead of a border colour guess. */
export function Rule({ className }: { className?: string }) {
  return (
    <div
      className={cn("h-px w-16", className)}
      style={{ background: "var(--oc-accent)", opacity: 0.7 }}
    />
  );
}

/** Shown when a slide has been added but not filled in yet. */
export function Unwritten({ what }: { what: string }) {
  return (
    <p className="text-sm italic" style={{ color: "var(--oc-muted)" }}>
      {what}
    </p>
  );
}

export { motion };
