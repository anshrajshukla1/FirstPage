package com.firstpage.util;

import lombok.extern.slf4j.Slf4j;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Locale;
import java.util.regex.Pattern;

/**
 * Resolves a user-pasted background-music URL into something a browser can
 * actually play.
 *
 * <p>The stored value is only ever a URL — parsing happens on read, so nothing
 * derived is persisted and a fix here applies retroactively to every existing
 * microsite. A YouTube <em>watch</em> URL cannot be fed to an {@code <audio>}
 * element, so the client needs to know which player to instantiate; that is the
 * distinction {@link Provider} carries.
 */
@Slf4j
public final class MusicUrlParser {

    /** Which player the client should use for a given URL. */
    public enum Provider {
        /** Playable through the YouTube IFrame API using {@code trackId}. */
        YOUTUBE,
        /** A direct audio file, playable in an {@code <audio>} element. */
        AUDIO,
        /** Nothing usable — the client renders no music control. */
        NONE
    }

    /**
     * @param provider which player to use
     * @param trackId  the YouTube video ID, or the URL itself for {@code AUDIO},
     *                 or null for {@code NONE}
     */
    public record MusicSource(Provider provider, String trackId) {
        static final MusicSource NONE = new MusicSource(Provider.NONE, null);
    }

    /** YouTube IDs are exactly 11 chars of [A-Za-z0-9_-]. */
    private static final Pattern VIDEO_ID = Pattern.compile("^[A-Za-z0-9_-]{11}$");

    private static final Pattern AUDIO_EXTENSION =
            Pattern.compile("\\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|weba)$", Pattern.CASE_INSENSITIVE);

    private MusicUrlParser() {
    }

    /**
     * Parses a raw URL. Never throws — an unrecognised or malformed value
     * yields {@link Provider#NONE} so a bad paste degrades to "no music"
     * rather than breaking the page.
     */
    public static MusicSource parse(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return MusicSource.NONE;
        }

        String trimmed = rawUrl.trim();
        // Tolerate "youtu.be/xyz" pasted without a scheme.
        String normalized = trimmed.matches("(?i)^[a-z][a-z0-9+.-]*://.*")
                ? trimmed
                : "https://" + trimmed;

        URI uri;
        try {
            uri = new URI(normalized);
        } catch (URISyntaxException e) {
            log.debug("Unparseable music URL: {}", trimmed);
            return MusicSource.NONE;
        }

        String host = uri.getHost();
        if (host == null) {
            return MusicSource.NONE;
        }
        host = host.toLowerCase(Locale.ROOT);
        if (host.startsWith("www.")) {
            host = host.substring(4);
        }
        String path = uri.getPath() == null ? "" : uri.getPath();

        String videoId = switch (host) {
            // youtu.be/<id>
            case "youtu.be" -> firstPathSegment(path);
            // youtube.com/watch?v=<id>, /shorts/<id>, /embed/<id>, /live/<id>
            case "youtube.com", "m.youtube.com", "music.youtube.com", "youtube-nocookie.com" ->
                    youtubeIdFromComDomain(uri, path);
            default -> null;
        };

        if (videoId != null && VIDEO_ID.matcher(videoId).matches()) {
            return new MusicSource(Provider.YOUTUBE, videoId);
        }

        // Direct audio file — the original URL is the src.
        if (AUDIO_EXTENSION.matcher(path).find()) {
            return new MusicSource(Provider.AUDIO, normalized);
        }

        log.debug("Music URL matched no known provider: {}", trimmed);
        return MusicSource.NONE;
    }

    private static String youtubeIdFromComDomain(URI uri, String path) {
        String fromQuery = queryParam(uri.getRawQuery(), "v");
        if (fromQuery != null) {
            return fromQuery;
        }
        // /shorts/<id>, /embed/<id>, /live/<id>, /v/<id>
        String[] segments = path.split("/");
        for (int i = 0; i < segments.length - 1; i++) {
            if (segments[i].equals("shorts") || segments[i].equals("embed")
                    || segments[i].equals("live") || segments[i].equals("v")) {
                return segments[i + 1];
            }
        }
        return null;
    }

    private static String firstPathSegment(String path) {
        String stripped = path.startsWith("/") ? path.substring(1) : path;
        int slash = stripped.indexOf('/');
        return slash == -1 ? stripped : stripped.substring(0, slash);
    }

    private static String queryParam(String rawQuery, String key) {
        if (rawQuery == null || rawQuery.isBlank()) {
            return null;
        }
        for (String pair : rawQuery.split("&")) {
            int eq = pair.indexOf('=');
            if (eq > 0 && pair.substring(0, eq).equals(key)) {
                return pair.substring(eq + 1);
            }
        }
        return null;
    }

    // ── Mapper-friendly accessors ────────────────────────────────────────
    // MapStruct expressions call these directly; keeping them here avoids
    // leaking the record into the generated mapper.

    /** @return the provider name for a raw URL, e.g. {@code "YOUTUBE"}. */
    public static String providerOf(String rawUrl) {
        return parse(rawUrl).provider().name();
    }

    /** @return the video ID, direct audio URL, or null. */
    public static String trackIdOf(String rawUrl) {
        return parse(rawUrl).trackId();
    }
}
