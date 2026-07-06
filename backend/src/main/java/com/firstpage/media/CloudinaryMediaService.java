package com.firstpage.media;

import java.io.IOException;
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
 * Handles image and video uploads with validation and auto-optimization.
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
     * Uploads an image to Cloudinary with auto quality and format transformations.
     *
     * @param file   the image file
     * @param folder the Cloudinary folder
     * @return the secure URL of the uploaded image
     */
    @Override
    public String uploadImage(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_IMAGE_TYPES, appProperties.getMedia().getMaxImageSize(), "image");

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "firstpage/" + folder,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto",
                    "transformation", "c_limit,w_2048,h_2048"
                ));

            String url = (String) result.get("secure_url");
            log.info("Image uploaded successfully: {}", url);
            return url;

        } catch (IOException e) {
            throw new MediaUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Uploads a video to Cloudinary with auto quality transformation.
     *
     * @param file   the video file
     * @param folder the Cloudinary folder
     * @return the secure URL of the uploaded video
     */
    @Override
    public String uploadVideo(MultipartFile file, String folder) {
        validateFile(file, ALLOWED_VIDEO_TYPES, appProperties.getMedia().getMaxVideoSize(), "video");

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap(
                    "folder", "firstpage/" + folder,
                    "resource_type", "video",
                    "quality", "auto"
                ));

            String url = (String) result.get("secure_url");
            log.info("Video uploaded successfully: {}", url);
            return url;

        } catch (IOException e) {
            throw new MediaUploadException("Failed to upload video: " + e.getMessage(), e);
        }
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
     * Validates file size and content type before upload.
     */
    private void validateFile(MultipartFile file, Set<String> allowedTypes,
                               long maxSize, String fileCategory) {
        if (file.isEmpty()) {
            throw new BusinessException("File is empty.", "EMPTY_FILE");
        }

        String contentType = file.getContentType();
        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new BusinessException(
                "Invalid %s file type: %s. Allowed types: %s"
                    .formatted(fileCategory, contentType, allowedTypes),
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
}
