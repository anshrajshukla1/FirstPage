package com.firstpage.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.firstpage.config.AppProperties;
import com.firstpage.exception.BusinessException;

/**
 * Locks the two things about uploads that fail silently rather than loudly.
 *
 * <p>Neither is covered by a compiler check: an audio file routed through video
 * validation is rejected at runtime with a confusing message, and a public id
 * that never made it onto the entity only shows up much later as a storage bill
 * for files nothing can delete.
 */
class CloudinaryMediaServiceTest {

    private Uploader uploader;
    private CloudinaryMediaService service;

    @BeforeEach
    void setUp() throws IOException {
        uploader = mock(Uploader.class);
        Cloudinary cloudinary = mock(Cloudinary.class);
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(), any())).thenReturn(Map.of(
                "secure_url", "https://res.cloudinary.com/demo/video/upload/v1/a/b.webm",
                "public_id", "firstpage/microsites/x/voice-note"
        ));

        service = new CloudinaryMediaService(cloudinary, new AppProperties());
    }

    private static MockMultipartFile file(String contentType) {
        return new MockMultipartFile("file", "clip", contentType, new byte[] {1, 2, 3});
    }

    /**
     * The public id comes from the response, not from parsing the URL. The old
     * parse returned null on any unexpected URL shape, and a null public id makes
     * the delete path skip Cloudinary and leak the file.
     */
    @Test
    void carriesTheProvidersOwnPublicId() {
        UploadedAsset asset = service.uploadAudio(file("audio/mpeg"), "microsites/x");

        assertThat(asset.publicId()).isEqualTo("firstpage/microsites/x/voice-note");
        assertThat(asset.url()).startsWith("https://res.cloudinary.com/");
    }

    /**
     * Browsers append the codec to the content type of anything they record, so
     * MediaRecorder output arrives as {@code audio/webm;codecs=opus}. An exact
     * set lookup rejects that even though webm is allowed — which would have made
     * every recorded voice note fail.
     */
    @Test
    void acceptsRecordedAudioWithACodecParameter() {
        assertThat(service.uploadAudio(file("audio/webm;codecs=opus"), "microsites/x"))
                .isNotNull();
        assertThat(service.uploadAudio(file("audio/mp4"), "microsites/x")).isNotNull();
    }

    /** Audio no longer goes through video validation, which rejected all of it. */
    @Test
    void rejectsNonAudioSentAsAudio() {
        assertThatThrownBy(() -> service.uploadAudio(file("image/png"), "microsites/x"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Invalid audio file type");
    }

    @Test
    void rejectsAnEmptyFile() {
        MockMultipartFile empty = new MockMultipartFile("file", "clip", "audio/mpeg", new byte[0]);

        assertThatThrownBy(() -> service.uploadAudio(empty, "microsites/x"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("empty");
    }
}
