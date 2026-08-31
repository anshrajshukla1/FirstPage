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

/**
 * STORY and CUSTOM: the message itself, set as a measured column rather than
 * centred display type. A drop cap appears only where the occasion sets its body
 * copy in a serif — on Inter it reads as a gimmick.
 */
export function ProseView({ slide, occasion }: SlideViewProps) {
  const { reveal } = useReveal(occasion);
  const content = slide.content ?? "";

  return (
    <Stage align="start" className="max-w-2xl">
      {slide.title && (
        <motion.div {...reveal(0)} className="mb-6 flex flex-col gap-4">
          <Display className="text-3xl sm:text-4xl md:text-5xl">
            {slide.title}
          </Display>
          <Rule />
        </motion.div>
      )}

      <motion.div {...reveal(1)} className="w-full">
        {content.trim() ? (
          <Prose text={content} dropCap={occasion.body === "display"} />
        ) : (
          <Unwritten what="Nothing written here yet." />
        )}
      </motion.div>

      {slide.media.length > 0 && (
        <motion.figure {...reveal(2)} className="mt-8 w-full">
          <img
            src={slide.media[0].url}
            alt={slide.media[0].caption ?? ""}
            className="w-full rounded-lg"
            loading="lazy"
          />
          {slide.media[0].caption && (
            <figcaption
              className="mt-2 text-xs"
              style={{ color: "var(--oc-muted)" }}
            >
              {slide.media[0].caption}
            </figcaption>
          )}
        </motion.figure>
      )}
    </Stage>
  );
}
