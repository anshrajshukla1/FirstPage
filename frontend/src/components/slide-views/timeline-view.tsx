import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Display,
  Prose,
  Stage,
  Unwritten,
  displayFont,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/**
 * A date that may be an ISO string or free text.
 *
 * <p>People writing a timeline of a relationship rarely know exact dates —
 * "that summer" is a legitimate entry — so anything unparseable is shown as
 * typed rather than rejected or blanked.
 */
function formatEntryDate(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (!/^\d{4}(-\d{2}){0,2}/.test(trimmed)) return trimmed;

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;

  // A bare year or year-month shouldn't invent a day it doesn't have.
  if (/^\d{4}$/.test(trimmed)) return trimmed;
  if (/^\d{4}-\d{2}$/.test(trimmed)) {
    return parsed.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }
  return parsed.toLocaleDateString(undefined, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * The timeline. This is the one slide where ordinal markers earn their place —
 * the content genuinely is a sequence, and the numbers tell the reader how far
 * through it they are.
 */
export function TimelineView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.TIMELINE, slide.config);
  const { reveal } = useReveal(occasion);

  const entries = config.entries.filter(
    (entry) => entry.label.trim() || entry.text.trim(),
  );

  if (entries.length === 0) {
    return (
      <Stage>
        {slide.title && <Display className="mb-4">{slide.title}</Display>}
        <Unwritten what="No moments added yet." />
      </Stage>
    );
  }

  return (
    <Stage align="start" className="max-w-2xl">
      {slide.title && (
        <motion.div {...reveal(0)} className="mb-10">
          <Display className="text-3xl sm:text-4xl">{slide.title}</Display>
        </motion.div>
      )}

      <ol className="relative w-full">
        {/* One continuous rule behind the markers, so the sequence reads as one thing. */}
        <span
          aria-hidden
          className="absolute bottom-6 left-[0.6875rem] top-2 w-px"
          style={{ background: "var(--oc-accent)", opacity: 0.35 }}
        />

        {entries.map((entry, i) => {
          const date = formatEntryDate(entry.date);

          return (
            <motion.li
              key={i}
              {...reveal(i + 1)}
              className="relative flex gap-5 pb-9 last:pb-0"
            >
              <span
                aria-hidden
                className="relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.625rem] tabular-nums"
                style={{
                  background: "var(--oc-accent)",
                  color: "var(--oc-bg)",
                  ...displayFont,
                  letterSpacing: 0,
                }}
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                {date && (
                  <p
                    className="mb-1 text-[0.6875rem] uppercase tracking-[0.22em]"
                    style={{ color: "var(--oc-muted)" }}
                  >
                    {date}
                  </p>
                )}
                {entry.label.trim() && (
                  <h3
                    className="text-xl leading-snug sm:text-2xl"
                    style={displayFont}
                  >
                    {entry.label}
                  </h3>
                )}
                {entry.text.trim() && (
                  <Prose
                    text={entry.text}
                    className="mt-2 text-base leading-relaxed sm:text-base"
                  />
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </Stage>
  );
}
