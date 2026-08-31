import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Display,
  Eyebrow,
  Rule,
  Stage,
  Unwritten,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/**
 * The opening slide. Sets the occasion before a word of the message lands, so
 * the headline arrives one word at a time rather than as a block.
 */
export function IntroView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.INTRO, slide.config);
  const { still, reveal } = useReveal(occasion);

  const headline = config.headline || slide.title || "";
  const words = headline.split(/\s+/).filter(Boolean);

  return (
    <Stage>
      {config.eyebrow && (
        <motion.div {...reveal(0)}>
          <Eyebrow>{config.eyebrow}</Eyebrow>
        </motion.div>
      )}

      {words.length > 0 ? (
        <Display as="h1" className="max-w-[22ch]">
          {words.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="inline-block"
              initial={still ? undefined : { opacity: 0, y: "0.4em" }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: still ? 0 : 0.55,
                delay: still ? 0 : 0.15 + i * 0.09,
              }}
            >
              {word}
              {i < words.length - 1 && " "}
            </motion.span>
          ))}
        </Display>
      ) : (
        <Unwritten what="No headline yet." />
      )}

      <motion.div {...reveal(2)} className="mt-8 flex flex-col items-center gap-6">
        <Rule />
        {config.subhead && (
          <p
            className="max-w-md text-base leading-relaxed sm:text-lg"
            style={{ color: "var(--oc-muted)" }}
          >
            {config.subhead}
          </p>
        )}
      </motion.div>
    </Stage>
  );
}
