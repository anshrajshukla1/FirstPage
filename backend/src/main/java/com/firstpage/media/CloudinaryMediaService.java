package com.firstpage.media;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.firstpage.config.AppProperties;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.MediaUploadException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Cloudinary-backed implementation of the MediaService.
 * Handles image, video and audio uploads with validation and auto-optimization.
 *
 * <p>Only the bytes go to Cloudinary. Nothing here writes to the database or to
 * local disk — the caller persists the returned URL and public id, which is all
 * the application ever stores about a file.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryMediaService implements MediaService {

    private final Cloudinary cloudinary;
    private final AppProperties appProperties;

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
        "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"
    );

    private static final Set<String> ALLOWED_VIDEO_TYPES = Set.of(
        "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"
    );

    /**
     * Recorded voice notes arrive as whatever the browser's MediaRecorder
     * produces — webm/opus on Chrome, mp4 on Safari — so both are accepted
     * alongside the formats someone might upload by hand.
     */
    private static final Set<String> ALLOWED_AUDIO_TYPES = Set.of(
        "audio/mpeg", "audio/mp3", "audio/mp4", "audio/m4a", "audio/x-m4a",
        "audio/aac", "audio/wav", "audio/x-wav", "audio/webm", "audio/ogg",
        "audio/flac"
    );

    /**
     * Uploads an image to Cloudinary with auto quality and format transformations.
     *
     * @param file   the image file
     * @param folder the Cloudinary folder
     * @return the uploaded asset's URL and public id
     */
    @Override
    public UploadedAsset uploadImage(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_IMAGE_TYPES, appProperties.getMedia().getMaxImageSize(), "image");

        return send(file, ObjectUtils.asMap(
            "folder", "firstpage/" + folder,
            "resource_type", "image",
            "quality", "auto",
            "fetch_format", "auto",
            "transformation", "c_limit,w_2048,h_2048"
        ), "image");
    }

    /**
     * Uploads a video to Cloudinary with auto quality transformation.
     *
     * @param file   the video file
     * @param folder the Cloudinary folder
     * @return the uploaded asset's URL and public id
     */
    @Override
    public UploadedAsset uploadVideo(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_VIDEO_TYPES, appProperties.getMedia().getMaxVideoSize(), "video");

        return send(file, ObjectUtils.asMap(
            "folder", "firstpage/" + folder,
            "resource_type", "video",
            "quality", "auto"
        ), "video");
    }

    /**
     * Uploads an audio file to Cloudinary.
     *
     * <p>The resource type is {@code video} because that is how Cloudinary
     * classifies audio; the validation, however, is audio-specific, which is the
     * whole reason this is not just a call to {@link #uploadVideo}.
     *
     * @param file   the audio file
     * @param folder the Cloudinary folder
     * @return the uploaded asset's URL and public id
     */
    @Override
    public UploadedAsset uploadAudio(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_AUDIO_TYPES, appProperties.getMedia().getMaxAudioSize(), "audio");

        return send(file, ObjectUtils.asMap(
            "folder", "firstpage/" + folder,
            "resource_type", "video",
            "quality", "auto"
        ), "audio");
    }

    /**
     * Deletes a media asset from Cloudinary by its public ID.
     *
     * @param publicId the Cloudinary public ID
     */
    @Override
    public void deleteMedia(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Media deleted successfully: {}", publicId);
        } catch (IOException e) {
            throw new MediaUploadException("Failed to delete media: " + e.getMessage(), e);
        }
    }

    /**
     * Performs the upload and reads both identifiers out of the one response.
     *
     * @param options      the provider options for this media kind
     * @param fileCategory used only for the log line and the error message
     */
    private UploadedAsset send(MultipartFile file, Map<String, Object> options,
                               String fileCategory) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), options);

            String url = (String) result.get("secure_url");
            String publicId = (String) result.get("public_id");

            // A missing public id is not fatal now but makes the asset
            // undeletable later, so it is worth knowing about.
            if (publicId == null) {
                log.warn("Cloudinary returned no public_id for {}: {}", fileCategory, url);
            }

            log.info("{} uploaded successfully: {}", fileCategory, url);
            return new UploadedAsset(url, publicId);

        } catch (IOException e) {
            throw new MediaUploadException(
                "Failed to upload %s: %s".formatted(fileCategory, e.getMessage()), e);
        }
    }

    /**
     * Validates file size and content type before upload.
     */
    private void validateFile(MultipartFile file, Set<String> allowedTypes,
                               long maxSize, String fileCategory) {
        if (file.isEmpty()) {
            throw new BusinessException("File is empty.", "EMPTY_FILE");
        }

        String contentType = baseContentType(file.getContentType());
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException(
                "Invalid %s file type: %s. Allowed types: %s"
                    .formatted(fileCategory, file.getContentType(), allowedTypes),
                "INVALID_FILE_TYPE");
        }

        if (file.getSize() > maxSize) {
            throw new BusinessException(
                "%s file size exceeds maximum of %d MB."
                    .formatted(fileCategory.substring(0, 1).toUpperCase() + fileCategory.substring(1),
                        maxSize / (1024 * 1024)),
                "FILE_TOO_LARGE");
        }
    }

    /**
     * Drops any parameters from a content type before matching it.
     *
     * <p>Browsers send the codec along with recorded media —
     * {@code audio/webm;codecs=opus} — which an exact set lookup would reject
     * even though the format is allowed.
     */
    private static String baseContentType(String raw) {
        if (raw == null) {
            return null;
        }
        int parameterStart = raw.indexOf(';');
        String base = parameterStart < 0 ? raw : raw.substring(0, parameterStart);
        return base.trim().toLowerCase(Locale.ROOT);
    }
}
