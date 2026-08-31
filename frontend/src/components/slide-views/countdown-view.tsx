import { useEffect, useState } from "react";
import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Display,
  Eyebrow,
  Stage,
  Unwritten,
  displayFont,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

const UNITS = [
  { key: "days", label: "days", per: 86_400_000 },
  { key: "hours", label: "hours", per: 3_600_000 },
  { key: "minutes", label: "minutes", per: 60_000 },
  { key: "seconds", label: "seconds", per: 1000 },
] as const;

function split(remaining: number) {
  let left = remaining;
  return UNITS.map((unit) => {
    const value = Math.floor(left / unit.per);
    left -= value * unit.per;
    return { ...unit, value };
  });
}

/** Live remaining milliseconds, `null` while the target is unparseable. */
function useRemaining(targetAt: string): number | null {
  const target = targetAt ? new Date(targetAt).getTime() : NaN;
  const valid = !Number.isNaN(target);

  const [remaining, setRemaining] = useState(() =>
    valid ? Math.max(0, target - Date.now()) : null,
  );

  useEffect(() => {
    if (!valid) {
      setRemaining(null);
      return;
    }

    const tick = () => setRemaining(Math.max(0, target - Date.now()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target, valid]);

  return remaining;
}

/**
 * A countdown to a moment. No prose fields — the number *is* the slide, and the
 * only other copy is what replaces it once the moment arrives.
 */
export function CountdownView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.COUNTDOWN, slide.config);
  const { reveal } = useReveal(occasion);
  const remaining = useRemaining(config.targetAt);

  if (remaining === null) {
    return (
      <Stage>
        <Unwritten what="No date set yet." />
      </Stage>
    );
  }

  if (remaining === 0) {
    return (
      <Stage>
        <motion.div {...reveal(0)}>
          <Display as="h2">
            {config.completedMessage || "It's time."}
          </Display>
        </motion.div>
      </Stage>
    );
  }

  const parts = split(remaining);
  const target = new Date(config.targetAt);

  return (
    <Stage>
      <motion.div {...reveal(0)}>
        <Eyebrow>Counting down to</Eyebrow>
        <p className="mb-10 text-lg sm:text-xl" style={displayFont}>
          {target.toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </motion.div>

      <motion.div
        {...reveal(1)}
        className="flex flex-wrap items-end justify-center gap-x-6 gap-y-6 sm:gap-x-10"
        // Read out once rather than announcing every tick.
        aria-live="off"
      >
        {parts.map((part) => (
          <div key={part.key} className="min-w-[3.5rem]">
            <div
              className="text-5xl leading-none tabular-nums sm:text-7xl"
              style={displayFont}
            >
              {String(part.value).padStart(2, "0")}
            </div>
            <div
              className="mt-2 text-[0.625rem] uppercase tracking-[0.28em]"
              style={{ color: "var(--oc-muted)" }}
            >
              {part.label}
            </div>
          </div>
        ))}
      </motion.div>

      <p className="sr-only">
        {parts.map((part) => `${part.value} ${part.label}`).join(", ")} remaining.
      </p>
    </Stage>
  );
}
