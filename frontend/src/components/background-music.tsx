import { useEffect, useRef } from "react";
import { MusicProvider } from "@/types";

/**
 * Background music for a recipient's page.
 *
 * <p>The old viewer fed `musicUrl` straight into an `<audio src>`, so a pasted
 * YouTube link produced silence — an `<audio>` element cannot play a watch page.
 * The provider is resolved server-side, and each provider gets the player it
 * actually needs: a hidden YouTube IFrame player, or a plain `<audio>` for a
 * direct file.
 *
 * <p>Playback is gated on `playing`, which the viewer only sets once the seal is
 * tapped. That tap is the user gesture browsers require before sound is allowed;
 * without it, `play()` is rejected and the page is silent no matter what we do.
 *
 * <p>Nothing about the track is stored — the URL lives in `music_url` and the
 * audio itself streams from YouTube or the file host.
 */

const FULL_VOLUME = 55;
/** Volume held during a slide change, so the transition isn't fought over. */
const DUCKED_VOLUME = 18;
const DUCK_MS = 700;

interface YtPlayer {
  playVideo(): void;
  mute(): void;
  unMute(): void;
  setVolume(volume: number): void;
  getPlayerState(): number;
  destroy(): void;
}

interface YtEvent {
  target: YtPlayer;
  data: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        host: HTMLElement,
        options: {
          videoId: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady: (event: YtEvent) => void;
            onStateChange: (event: YtEvent) => void;
          };
        },
      ) => YtPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
    /** Exposed so the player's state can be checked from the console. */
    firstPageMusic?: YtPlayer | HTMLAudioElement | null;
  }
}

/** Loads YouTube's player script once per session, on pages that need it. */
let apiPromise: Promise<void> | null = null;

function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });
  return apiPromise;
}

export interface BackgroundMusicProps {
  provider: MusicProvider;
  /** YouTube video id, or the file URL when the provider is `AUDIO`. */
  trackId: string | null;
  /** Set once the recipient has opened the page — the required user gesture. */
  playing: boolean;
  muted: boolean;
  /** Any value that changes on slide change; the volume dips when it does. */
  duckOn?: number | string;
}

export function BackgroundMusic({
  provider,
  trackId,
  playing,
  muted,
  duckOn,
}: BackgroundMusicProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YtPlayer | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isYouTube = provider === MusicProvider.YOUTUBE && Boolean(trackId);
  const isFile = provider === MusicProvider.AUDIO && Boolean(trackId);

  // Build the YouTube player the moment the page is opened, not before: an
  // embed that exists from page load starts fetching a video nobody asked for.
  useEffect(() => {
    if (!isYouTube || !trackId || !playing) return;
    let cancelled = false;

    void loadYouTubeApi().then(() => {
      if (cancelled || playerRef.current || !mountRef.current || !window.YT) {
        return;
      }
      /*
       * The API replaces the element it is handed with an iframe. Give it a node
       * React never rendered, so React's own reconciler is not reaching for a
       * child that has quietly been swapped out from under it.
       */
      const host = document.createElement("div");
      mountRef.current.appendChild(host);

      playerRef.current = new window.YT.Player(host, {
        videoId: trackId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          disablekb: 1,
          // A single video loops only when it is also its own playlist.
          loop: 1,
          playlist: trackId,
          playsinline: 1,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event) => {
            event.target.setVolume(FULL_VOLUME);
            if (muted) event.target.mute();
            event.target.playVideo();
            window.firstPageMusic = event.target;
          },
          onStateChange: (event) => {
            // 0 is ENDED. The playlist trick usually loops on its own; restart
            // explicitly for the clients where it doesn't.
            if (event.data === 0) event.target.playVideo();
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // `muted` is read once on ready and then handled by its own effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouTube, trackId, playing]);

  // Tear the player down on the way out so the audio stops with the page.
  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
      window.firstPageMusic = null;
    },
    [],
  );

  // A direct file needs nothing but a play() call once the gesture has happened.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !playing) return;
    audio.volume = FULL_VOLUME / 100;
    audio.muted = muted;
    window.firstPageMusic = audio;
    // A rejected play() means the browser blocked it; the mute button is the
    // recipient's way back in, so there is nothing to recover here.
    void audio.play().catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing]);

  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      if (muted) {
        player.mute();
      } else {
        player.unMute();
        player.setVolume(FULL_VOLUME);
      }
    }
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
  }, [muted]);

  useEffect(() => {
    if (duckOn === undefined || muted) return;
    const player = playerRef.current;
    const audio = audioRef.current;

    player?.setVolume(DUCKED_VOLUME);
    if (audio) audio.volume = DUCKED_VOLUME / 100;

    const restore = window.setTimeout(() => {
      player?.setVolume(FULL_VOLUME);
      if (audio) audio.volume = FULL_VOLUME / 100;
    }, DUCK_MS);

    return () => window.clearTimeout(restore);
  }, [duckOn, muted]);

  if (isYouTube) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 h-px w-px overflow-hidden opacity-0"
      >
        <div ref={mountRef} />
      </div>
    );
  }

  if (isFile) {
    return <audio ref={audioRef} src={trackId ?? undefined} loop preload="none" />;
  }

  return null;
}
