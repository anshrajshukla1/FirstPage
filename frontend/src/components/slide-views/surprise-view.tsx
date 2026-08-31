import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Display,
  Prose,
  Stage,
  Unwritten,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/**
 * Something held back until the recipient asks for it.
 *
 * <p>The reveal is one deliberate press, not a hover: on a phone there is no
 * hover, and the whole point is that the recipient chooses the moment.
 */
export function SurpriseView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.SURPRISE, slide.config);
  const { still, reveal } = useReveal(occasion);
  const [revealed, setRevealed] = useState(false);

  const hasPayload =
    Boolean(config.revealText.trim()) || slide.media.length > 0;
  if (!hasPayload) {
    return (
      <Stage>
        <Unwritten what="Nothing hidden here yet." />
      </Stage>
    );
  }

  const media =
    slide.media.find((item) => item.id === config.revealMediaId) ??
    // A picture uploaded to this slide but not yet pointed at by the config is
    // still clearly meant to be part of the reveal.
    slide.media[0] ??
    null;

  return (
    <Stage>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="sealed"
            initial={still ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="flex flex-col items-center gap-8"
          >
            <Display className="max-w-[24ch] text-3xl sm:text-4xl md:text-5xl">
              {config.prompt || "There's something here."}
            </Display>

            <button
              onClick={() => setRevealed(true)}
              className="group relative overflow-hidden rounded-full px-8 py-3 text-sm uppercase tracking-[0.2em] transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              style={{
                background: "var(--oc-accent)",
                color: "var(--oc-bg)",
              }}
            >
              Reveal
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={still ? undefined : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: still ? 0 : 0.6 }}
            className="flex w-full flex-col items-center gap-7"
          >
            {media && (
              <img
                src={media.url}
                alt={media.caption ?? ""}
                className="max-h-[45vh] w-auto max-w-full rounded-lg shadow-2xl"
              />
            )}
            {config.revealText.trim() && (
              <motion.div {...reveal(1)} className="max-w-xl">
                <Prose text={config.revealText} className="text-center" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
