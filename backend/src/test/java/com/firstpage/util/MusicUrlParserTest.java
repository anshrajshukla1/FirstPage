package com.firstpage.util;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guards the URL shapes a real person actually pastes into the music field.
 *
 * <p>Background music was silently broken because a YouTube watch URL was fed
 * straight into an {@code <audio src>}, which can never play it. The fix hinges
 * entirely on recognising the provider, so each accepted shape is pinned here.
 */
class MusicUrlParserTest {

    @ParameterizedTest
    @CsvSource({
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ,          dQw4w9WgXcQ",
            "https://youtube.com/watch?v=dQw4w9WgXcQ&t=42s,        dQw4w9WgXcQ",
            "https://www.youtube.com/watch?list=PL123&v=dQw4w9WgXcQ, dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ,                         dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ?t=10,                    dQw4w9WgXcQ",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ,           dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ,            dQw4w9WgXcQ",
            "https://music.youtube.com/watch?v=dQw4w9WgXcQ,        dQw4w9WgXcQ",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ,            dQw4w9WgXcQ",
            // Pasted without a scheme, which browsers accept and people do.
            "youtu.be/dQw4w9WgXcQ,                                 dQw4w9WgXcQ",
    })
    void extractsYoutubeVideoId(String url, String expectedId) {
        MusicUrlParser.MusicSource source = MusicUrlParser.parse(url);

        assertThat(source.provider()).isEqualTo(MusicUrlParser.Provider.YOUTUBE);
        assertThat(source.trackId()).isEqualTo(expectedId);
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "https://cdn.example.com/song.mp3",
            "https://cdn.example.com/path/to/track.m4a",
            "https://cdn.example.com/audio.ogg?signature=abc",
    })
    void treatsDirectFilesAsPlayableAudio(String url) {
        MusicUrlParser.MusicSource source = MusicUrlParser.parse(url);

        assertThat(source.provider()).isEqualTo(MusicUrlParser.Provider.AUDIO);
        assertThat(source.trackId()).isEqualTo(url);
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {
            "   ",
            "not a url at all",
            "https://open.spotify.com/track/abc",
            // Right host, but no video ID anywhere.
            "https://www.youtube.com/results?search_query=song",
            // 10 chars — one short of a valid ID, so it must not be accepted.
            "https://youtu.be/dQw4w9WgXc",
    })
    void degradesToNoneRatherThanThrowing(String url) {
        MusicUrlParser.MusicSource source = MusicUrlParser.parse(url);

        assertThat(source.provider()).isEqualTo(MusicUrlParser.Provider.NONE);
        assertThat(source.trackId()).isNull();
    }

    @Test
    void mapperAccessorsMatchTheParsedSource() {
        String url = "https://youtu.be/dQw4w9WgXcQ";

        assertThat(MusicUrlParser.providerOf(url)).isEqualTo("YOUTUBE");
        assertThat(MusicUrlParser.trackIdOf(url)).isEqualTo("dQw4w9WgXcQ");
        assertThat(MusicUrlParser.providerOf(null)).isEqualTo("NONE");
        assertThat(MusicUrlParser.trackIdOf(null)).isNull();
    }
}
