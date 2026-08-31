import { useState } from "react";
import { Play } from "lucide-react";
import { SlideType } from "@/types";
import { parseSlideConfig } from "@/types/slide-config";
import { parseVideoUrl } from "@/lib/media-url";
import {
  Display,
  Stage,
  Unwritten,
  motion,
  useReveal,
  type SlideViewProps,
} from "./shared";

/**
 * A single video, held in a 16:9 frame.
 *
 * <p>Nothing is fetched until the recipient presses play: the embed is a poster
 * plus a button, and the iframe only mounts on that click. The page a recipient
 * opens is usually on mobile data, and a background iframe would cost them a
 * few megabytes before they'd decided to watch.
 */
export function VideoView({ slide, occasion }: SlideViewProps) {
  const config = parseSlideConfig(SlideType.VIDEO, slide.config);
  const { reveal } = useReveal(occasion);
  const [playing, setPlaying] = useState(false);

  const source = parseVideoUrl(config.url);

  if (source.provider === "NONE") {
    return (
      <Stage>
        {slide.title && <Display className="mb-4">{slide.title}</Display>}
        <Unwritten what="No video here yet." />
      </Stage>
    );
  }

  const poster = config.poster || source.posterUrl;

  return (
    <Stage className="max-w-4xl">
      {slide.title && (
        <motion.div {...reveal(0)} className="mb-8">
          <Display className="text-3xl sm:text-4xl">{slide.title}</Display>
        </motion.div>
      )}

      <motion.div
        {...reveal(1)}
        className="relative w-full overflow-hidden rounded-lg bg-black/40 shadow-2xl"
        style={{ aspectRatio: "16 / 9" }}
      >
        {source.provider === "FILE" ? (
          <video
            src={source.id}
            poster={poster || undefined}
            controls
            playsInline
            preload="none"
            className="h-full w-full"
          />
        ) : playing ? (
          <iframe
            src={`${source.embedUrl}&autoplay=1`}
            title={slide.title || "Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        ) : (
          <button
            onClick={() => setPlaying(true)}
            aria-label={`Play ${slide.title || "video"}`}
            className="group relative h-full w-full focus-visible:ring-2 focus-visible:ring-[var(--oc-accent)] focus-visible:outline-none"
          >
            {poster && (
              <img
                src={poster}
                alt=""
                className="h-full w-full object-cover opacity-80 transition group-hover:opacity-100"
              />
            )}
            <span
              className="absolute inset-0 flex items-center justify-center"
              aria-hidden
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110"
                style={{ background: "var(--oc-accent)" }}
              >
                <Play className="ml-0.5 h-6 w-6 fill-current text-black/80" />
              </span>
            </span>
          </button>
        )}
      </motion.div>

      {slide.content?.trim() && (
        <motion.p
          {...reveal(2)}
          className="mt-5 max-w-xl text-sm leading-relaxed"
          style={{ color: "var(--oc-muted)" }}
        >
          {slide.content}
        </motion.p>
      )}
    </Stage>
  );
}
