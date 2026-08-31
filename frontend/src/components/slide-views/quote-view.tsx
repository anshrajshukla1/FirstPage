import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Stage,
  Unwritten,
  displayFont,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/**
 * A quote card. No title, no prose — the whole slide is one line held at display
 * size, with the opening mark hung outside the measure so the first word still
 * starts on the left margin.
 */
export function QuoteView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.QUOTE, slide.config);
  const { reveal } = useReveal(occasion);

  if (!config.quote.trim()) {
    return (
      <Stage>
        <Unwritten what="No quote yet." />
      </Stage>
    );
  }

  return (
    <Stage>
      <motion.blockquote {...reveal(0)} className="relative max-w-2xl">
        <span
          aria-hidden
          className="absolute -left-2 -top-8 select-none text-[7rem] leading-none sm:-left-8 sm:text-[9rem]"
          style={{ ...displayFont, color: "var(--oc-accent)", opacity: 0.35 }}
        >
          &ldquo;
        </span>
        <p
          className="text-balance text-2xl leading-[1.3] sm:text-4xl md:text-[2.75rem]"
          style={displayFont}
        >
          {config.quote}
        </p>
      </motion.blockquote>

      {config.attribution && (
        <motion.figcaption
          {...reveal(1)}
          className="mt-8 flex items-center gap-3 text-sm uppercase tracking-[0.2em]"
          style={{ color: "var(--oc-muted)" }}
        >
          <span
            aria-hidden
            className="inline-block h-px w-8"
            style={{ background: "var(--oc-accent)" }}
          />
          {config.attribution}
        </motion.figcaption>
      )}
    </Stage>
  );
}
