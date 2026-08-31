import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { SlideType, type Media } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import { cn } from "@/lib/utils";
import {
  Display,
  Stage,
  Unwritten,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/** Full-screen viewing. Photos are the point of this slide; thumbnails aren't. */
function Lightbox({
  photos,
  index,
  onClose,
  onIndexChange,
}: {
  photos: Media[];
  index: number;
  onClose: () => void;
  onIndexChange: (next: number) => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      // Stop the viewer's own arrow handler from also changing slides.
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
        event.stopPropagation();
        event.preventDefault();
        const delta = event.key === "ArrowRight" ? 1 : -1;
        onIndexChange((index + delta + photos.length) % photos.length);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [index, photos.length, onClose, onIndexChange]);

  const photo = photos[index];

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Photo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 p-4"
    >
      <button
        onClick={onClose}
        aria-label="Close photo"
        className="absolute right-4 top-4 rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        <X className="h-5 w-5" />
      </button>

      <img
        src={photo.url}
        alt={photo.caption ?? ""}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[80vh] max-w-full rounded-lg object-contain"
      />
      {photo.caption && (
        <p className="mt-4 max-w-lg text-center text-sm text-white/70">
          {photo.caption}
        </p>
      )}

      {photos.length > 1 && (
        <div
          className="mt-5 flex items-center gap-5"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            aria-label="Previous photo"
            onClick={() => onIndexChange((index - 1 + photos.length) % photos.length)}
            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-xs tabular-nums text-white/50">
            {index + 1} / {photos.length}
          </span>
          <button
            aria-label="Next photo"
            onClick={() => onIndexChange((index + 1) % photos.length)}
            className="rounded-full p-2 text-white/70 transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/**
 * The photo slide, in whichever of the three arrangements the sender chose.
 *
 * <p>`stack` deliberately rotates each print a degree or two: a stack of photos
 * on a table is never square, and the occasions that use it (crush, family) are
 * the ones where that reads as warmth rather than sloppiness.
 */
export function PhotosView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.PHOTOS, slide.config);
  const { still, reveal } = useReveal(occasion);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const photos = slide.media;

  if (photos.length === 0) {
    return (
      <Stage>
        {slide.title && <Display className="mb-4">{slide.title}</Display>}
        <Unwritten what="No photos here yet." />
      </Stage>
    );
  }

  const frame =
    "overflow-hidden bg-black/10 focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none";

  return (
    <Stage className="max-w-4xl">
      {slide.title && (
        <motion.div {...reveal(0)} className="mb-8">
          <Display className="text-3xl sm:text-4xl">{slide.title}</Display>
        </motion.div>
      )}

      {config.layout === "grid" && (
        <div
          className={cn(
            "grid w-full gap-3",
            photos.length === 1
              ? "grid-cols-1"
              : photos.length === 2
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3",
          )}
        >
          {photos.map((photo, i) => (
            <motion.button
              key={photo.id}
              {...reveal(i * 0.4)}
              onClick={() => setLightboxIndex(i)}
              aria-label={photo.caption ?? `Photo ${i + 1}`}
              className={cn(frame, "group aspect-square rounded-md")}
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
            </motion.button>
          ))}
        </div>
      )}

      {config.layout === "stack" && (
        <div className="flex w-full flex-wrap justify-center gap-6">
          {photos.map((photo, i) => (
            <motion.button
              key={photo.id}
              {...reveal(i * 0.4)}
              onClick={() => setLightboxIndex(i)}
              aria-label={photo.caption ?? `Photo ${i + 1}`}
              style={{ rotate: still ? 0 : `${((i % 4) - 1.5) * 1.8}deg` }}
              className="group max-w-[15rem] shrink-0 bg-white p-3 pb-10 shadow-xl transition-transform hover:z-10 hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none"
            >
              <img
                src={photo.url}
                alt={photo.caption ?? ""}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              {photo.caption && (
                <span className="mt-3 block text-center text-xs text-slate-600">
                  {photo.caption}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {config.layout === "carousel" && (
        <div className="w-full">
          <motion.button
            {...reveal(1)}
            onClick={() => setLightboxIndex(carouselIndex)}
            aria-label={photos[carouselIndex].caption ?? "Open photo"}
            className={cn(frame, "aspect-[4/3] w-full rounded-lg")}
          >
            <img
              key={photos[carouselIndex].id}
              src={photos[carouselIndex].url}
              alt={photos[carouselIndex].caption ?? ""}
              className="h-full w-full object-cover"
            />
          </motion.button>

          {photos[carouselIndex].caption && (
            <p className="mt-3 text-sm" style={{ color: "var(--oc-muted)" }}>
              {photos[carouselIndex].caption}
            </p>
          )}

          {photos.length > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {photos.map((photo, i) => (
                <button
                  key={photo.id}
                  aria-label={`Photo ${i + 1}`}
                  aria-current={i === carouselIndex}
                  onClick={() => setCarouselIndex(i)}
                  className="h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none"
                  style={{
                    width: i === carouselIndex ? "1.5rem" : "0.375rem",
                    background:
                      i === carouselIndex
                        ? "var(--oc-accent)"
                        : "var(--oc-muted)",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={photos}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        )}
      </AnimatePresence>
    </Stage>
  );
}
