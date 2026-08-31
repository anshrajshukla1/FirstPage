import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import {
  Display,
  Prose,
  Rule,
  Stage,
  Unwritten,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/** How many times "Not yet" slips away before it lets itself be pressed. */
const MAX_DODGES = 3;

/**
 * The question. This is the slide the whole page exists to arrive at, so it gets
 * the largest type on the page and nothing else competes with it.
 *
 * <p>The declining button dodges — but only three times, and never away from the
 * keyboard. Making a real answer unreachable would turn a question into a trick.
 */
export function ProposalView({
  slide,
  occasion,
  onProposalAnswer,
}: SlideViewProps) {
  const config = parseSlideConfig(SlideType.PROPOSAL, slide.config);
  const { still, reveal } = useReveal(occasion);
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [dodge, setDodge] = useState({ x: 0, y: 0, count: 0 });

  /** Answering also tells the sender — once, even if they press it again. */
  const choose = (choice: "yes" | "no") => {
    if (answer === null) onProposalAnswer?.(choice === "yes");
    setAnswer(choice);
  };

  if (!config.question.trim()) {
    return (
      <Stage>
        <Unwritten what="No question written yet." />
      </Stage>
    );
  }

  const dodgeAway = () => {
    if (still || dodge.count >= MAX_DODGES) return;
    // Deterministic-enough scatter; each dodge lands somewhere new but on-screen.
    const step = dodge.count + 1;
    setDodge({
      x: (step % 2 === 0 ? -1 : 1) * (46 + step * 18),
      y: (step % 3 === 0 ? 1 : -1) * (14 + step * 9),
      count: step,
    });
  };

  return (
    <Stage>
      <AnimatePresence mode="wait">
        {answer === "yes" ? (
          <motion.div
            key="yes"
            initial={still ? undefined : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: still ? 0 : 0.7 }}
            className="flex flex-col items-center gap-7"
          >
            <Display as="h2" className="max-w-[20ch]">
              {config.yesResponse || config.yesLabel}
            </Display>
            <Rule className="w-24" />
          </motion.div>
        ) : answer === "no" ? (
          <motion.div
            key="no"
            initial={still ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-6"
          >
            <Display className="max-w-[24ch] text-3xl sm:text-4xl">
              That&rsquo;s an answer too.
            </Display>
            <button
              onClick={() => setAnswer(null)}
              className="text-sm underline underline-offset-4 transition hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none"
              style={{ color: "var(--oc-muted)" }}
            >
              Read the question again
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="asking"
            initial={still ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex w-full flex-col items-center"
          >
            <Display as="h1" className="max-w-[20ch] text-5xl sm:text-6xl md:text-7xl">
              {config.question}
            </Display>

            {slide.content?.trim() && (
              <motion.div {...reveal(1)} className="mt-8 max-w-lg">
                <Prose text={slide.content} className="text-center" />
              </motion.div>
            )}

            <motion.div
              {...reveal(2)}
              className="mt-12 flex flex-wrap items-center justify-center gap-4"
            >
              <button
                onClick={() => choose("yes")}
                className="rounded-full px-10 py-4 text-base uppercase tracking-[0.16em] shadow-lg transition-transform hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                style={{ background: "var(--oc-accent)", color: "var(--oc-bg)" }}
              >
                {config.yesLabel}
              </button>

              {config.allowNo && (
                <motion.button
                  onClick={() => choose("no")}
                  onMouseEnter={dodgeAway}
                  animate={{ x: dodge.x, y: dodge.y }}
                  transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  className="rounded-full border px-7 py-3.5 text-sm uppercase tracking-[0.16em] transition-colors focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none"
                  style={{
                    borderColor: "var(--oc-muted)",
                    color: "var(--oc-muted)",
                  }}
                >
                  {config.noLabel}
                </motion.button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Stage>
  );
}
