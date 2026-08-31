import { MusicProvider } from "@/types";

/**
 * URL parsing for the two places a recipient's page plays media: a VIDEO slide
 * and the background track.
 *
 * <p>The server already derives `musicProvider` on every read, so this exists
 * for the *editor* — the sender should see "YouTube detected" as they paste,
 * not after a round trip. The rules are kept deliberately in step with
 * `backend/src/main/java/com/firstpage/util/MusicUrlParser.java`.
 */

export const VIDEO_PROVIDERS = ["YOUTUBE", "VIMEO", "FILE", "NONE"] as const;
export type VideoProvider = (typeof VIDEO_PROVIDERS)[number];

export interface VideoSource {
  provider: VideoProvider;
  /** Video id for hosted providers, the URL itself for `FILE`. */
  id: string;
  /** Ready to drop into an `<iframe src>`; empty for `FILE` and `NONE`. */
  embedUrl: string;
  /** Provider-hosted still, used as a poster when the sender gives none. */
  posterUrl: string;
}

const FILE_VIDEO = /\.(mp4|webm|mov|m4v)(\?|#|$)/i;
const FILE_AUDIO = /\.(mp3|m4a|ogg|oga|wav|aac|flac)(\?|#|$)/i;

/** `null` when the string isn't a URL at all — people paste half-typed text. */
function toUrl(raw: string): URL | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    // A bare "youtu.be/abc" is a reasonable paste; give it a scheme.
    return new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

/** YouTube video id from any of the shapes people actually paste. */
function youTubeId(url: URL): string | null {
  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id || null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v) return v;
    // /shorts/<id>, /embed/<id>, /live/<id>
    const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);
    if (match) return match[1];
  }

  return null;
}

function vimeoId(url: URL): string | null {
  if (!url.hostname.replace(/^www\./, "").endsWith("vimeo.com")) return null;
  const match = url.pathname.match(/\/(\d+)/);
  return match ? match[1] : null;
}

export function parseVideoUrl(raw: string): VideoSource {
  const none: VideoSource = { provider: "NONE", id: "", embedUrl: "", posterUrl: "" };
  const url = toUrl(raw);
  if (!url) return none;

  const yt = youTubeId(url);
  if (yt) {
    return {
      provider: "YOUTUBE",
      id: yt,
      // No related videos, no branding, and nothing loads until play is pressed.
      embedUrl: `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1&playsinline=1`,
      posterUrl: `https://i.ytimg.com/vi/${yt}/hqdefault.jpg`,
    };
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return {
      provider: "VIMEO",
      id: vimeo,
      embedUrl: `https://player.vimeo.com/video/${vimeo}?dnt=1`,
      posterUrl: "",
    };
  }

  if (FILE_VIDEO.test(url.pathname)) {
    return { provider: "FILE", id: url.toString(), embedUrl: "", posterUrl: "" };
  }

  return none;
}

/**
 * Mirrors the server's music parsing so the create/edit form can label the URL
 * as it's typed. The page still plays whatever the server reports.
 */
export function parseMusicUrl(raw: string): {
  provider: MusicProvider;
  trackId: string;
} {
  const url = toUrl(raw);
  if (!url) return { provider: MusicProvider.NONE, trackId: "" };

  const yt = youTubeId(url);
  if (yt) return { provider: MusicProvider.YOUTUBE, trackId: yt };

  if (FILE_AUDIO.test(url.pathname)) {
    return { provider: MusicProvider.AUDIO, trackId: url.toString() };
  }

  return { provider: MusicProvider.NONE, trackId: "" };
}

/** Human label for the detected provider, shown under the music/video field. */
export function describeMusicProvider(provider: MusicProvider): string {
  switch (provider) {
    case MusicProvider.YOUTUBE:
      return "YouTube track detected — it plays when the page is opened.";
    case MusicProvider.AUDIO:
      return "Audio file detected — it plays when the page is opened.";
    default:
      return "Paste a YouTube link or a direct .mp3 / .m4a / .ogg URL.";
  }
}
