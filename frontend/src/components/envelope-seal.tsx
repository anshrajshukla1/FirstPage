import { motion, useReducedMotion } from "motion/react";
import { Volume2 } from "lucide-react";
import type { Occasion } from "@/design/occasions";
import { PACE_SECONDS } from "@/design/occasions";

/**
 * The closed page.
 *
 * <p>Every page arrives sealed. The recipient reads one line, presses the seal,
 * and the page opens — the one moment the whole product is remembered by, which
 * is why everything around it stays quiet.
 *
 * <p>It also earns its place technically: browsers refuse to start audio without
 * a user gesture, and this press is that gesture. Background music can only
 * work because the page opens on a tap.
 */

interface EnvelopeSealProps {
  occasion: Occasion;
  recipientName: string;
  /** An anonymous sender is named as "someone", never guessed at. */
  isAnonymous: boolean;
  /** Shown as a heads-up, so nobody opens a musical page on a quiet train. */
  hasMusic: boolean;
  onOpen: () => void;
}

export function EnvelopeSeal({
  occasion,
  recipientName,
  isAnonymous,
  hasMusic,
  onOpen,
}: EnvelopeSealProps) {
  const still = useReducedMotion() ?? false;
  const beat = PACE_SECONDS[occasion.pace];
  const initial = recipientName.trim().charAt(0).toUpperCase() || "•";

  const enter = (i: number) => ({
    initial: still ? undefined : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: still ? 0 : beat, delay: still ? 0 : i * beat * 0.4 },
  });

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <motion.p
        {...enter(0)}
        className="text-[0.7rem] uppercase tracking-[0.3em]"
        style={{ color: "var(--oc-accent)" }}
      >
        {occasion.seal.kicker}
      </motion.p>

      <motion.p
        {...enter(1)}
        className="mt-7 text-sm"
        style={{ color: "var(--oc-muted)" }}
      >
        {isAnonymous ? "Left here by someone, for" : "For"}
      </motion.p>

      <motion.h1
        {...enter(1)}
        className="mt-1 text-balance text-4xl leading-tight sm:text-5xl"
        style={{
          fontFamily: "var(--oc-display)",
          fontWeight: "var(--oc-display-weight)" as unknown as number,
          letterSpacing: "var(--oc-display-tracking)",
        }}
      >
        {recipientName}
      </motion.h1>

      {/* The seal itself. Pressing it is both the answer and the gesture. */}
      <motion.button
        {...enter(2)}
        type="button"
        onClick={onOpen}
        aria-label={`${occasion.seal.action} — open this page`}
        className="group mt-12 flex flex-col items-center gap-5 rounded-full focus-visible:outline-none"
      >
        <span className="relative flex h-28 w-28 items-center justify-center">
          {/* A slow ring, breathing at the occasion's own pace. */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              border: "1px solid var(--oc-accent)",
              opacity: 0.45,
            }}
            animate={still ? undefined : { scale: [1, 1.12, 1], opacity: [0.45, 0.1, 0.45] }}
            transition={{ duration: beat * 5, repeat: Infinity, ease: "easeInOut" }}
          />
          <span
            className="absolute inset-3 rounded-full transition-transform duration-500 group-hover:scale-105 group-focus-visible:scale-105"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--oc-accent) 92%, white), var(--oc-accent))",
              boxShadow: "0 10px 30px -12px var(--oc-accent)",
            }}
          />
          <span
            className="relative text-2xl"
            style={{
              fontFamily: "var(--oc-display)",
              fontWeight: "var(--oc-display-weight)" as unknown as number,
              color: "var(--oc-bg)",
            }}
          >
            {initial}
          </span>
        </span>

        <span
          className="text-xs uppercase tracking-[0.28em] transition-opacity group-hover:opacity-100"
          style={{ color: "var(--oc-fg)", opacity: 0.72 }}
        >
          {occasion.seal.action}
        </span>
      </motion.button>

      {hasMusic && (
        <motion.p
          {...enter(3)}
          className="mt-10 flex items-center gap-2 text-[0.7rem]"
          style={{ color: "var(--oc-muted)" }}
        >
          <Volume2 className="h-3.5 w-3.5" aria-hidden />
          There's music. Sound on, if you can.
        </motion.p>
      )}
    </div>
  );
}
