package com.firstpage.service;

import com.firstpage.dto.response.MediaResponse;
import com.firstpage.entity.Media;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.MediaType;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.mapper.MediaMapper;
import com.firstpage.media.MediaService;
import com.firstpage.repository.MediaRepository;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * Handles media upload, retrieval, and deletion for microsites.
 * Integrates with Cloudinary for file storage and manages the Media entity lifecycle.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MediaUploadService {

    private final MediaRepository mediaRepository;
    private final MicrositeRepository micrositeRepository;
    private final UserRepository userRepository;
    private final MediaService mediaService;
    private final MediaMapper mediaMapper;

    // ── Upload ──────────────────────────────────────────────────────────

    /**
     * Uploads a media file to Cloudinary and persists the metadata.
     *
     * @param micrositeId the owning microsite's ID
     * @param firebaseUid the authenticated user's Firebase UID
     * @param file        the multipart file to upload
     * @param caption     optional caption for the media
     * @param type        the media type (IMAGE, VIDEO, AUDIO, VOICE_NOTE)
     * @return the persisted media as a response DTO
     */
    @Transactional
    public MediaResponse upload(UUID micrositeId, String firebaseUid,
                                MultipartFile file, String caption, MediaType type) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        String folder = "microsites/" + micrositeId;
        String url = uploadToCloudinary(file, folder, type);

        // Extract Cloudinary public ID from the URL
        String publicId = extractPublicId(url);

        // Determine next order index
        int nextOrderIndex = mediaRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId)
                .size();

        Media media = Media.builder()
                .microsite(microsite)
                .type(type)
                .url(url)
                .publicId(publicId)
                .caption(caption)
                .orderIndex(nextOrderIndex)
                .fileSize(file.getSize())
                .build();

        Media saved = mediaRepository.save(media);
        log.info("Media uploaded: id={}, type={}, microsite={}", saved.getId(), type, micrositeId);

        return mediaMapper.toResponse(saved);
    }

    // ── List ────────────────────────────────────────────────────────────

    /**
     * Retrieves all media for a microsite, ordered by orderIndex.
     *
     * @param micrositeId the microsite's ID
     * @param firebaseUid the authenticated user's Firebase UID
     * @return list of media responses
     */
    @Transactional(readOnly = true)
    public List<MediaResponse> getMediaByMicrosite(UUID micrositeId, String firebaseUid) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        return mediaRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId)
                .stream()
                .map(mediaMapper::toResponse)
                .toList();
    }

    // ── Delete ──────────────────────────────────────────────────────────

    /**
     * Deletes a media item from both Cloudinary and the database.
     *
     * @param micrositeId the owning microsite's ID
     * @param mediaId     the media item's ID
     * @param firebaseUid the authenticated user's Firebase UID
     */
    @Transactional
    public void deleteMedia(UUID micrositeId, UUID mediaId, String firebaseUid) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", mediaId));

        if (!media.getMicrosite().getId().equals(micrositeId)) {
            throw new BusinessException("MEDIA_MISMATCH",
                    "Media does not belong to the specified microsite");
        }

        // Delete from Cloudinary first
        if (media.getPublicId() != null && !media.getPublicId().isBlank()) {
            try {
                mediaService.deleteMedia(media.getPublicId());
            } catch (Exception e) {
                log.warn("Failed to delete media from Cloudinary (publicId={}): {}",
                        media.getPublicId(), e.getMessage());
            }
        }

        mediaRepository.delete(media);
        log.info("Media deleted: id={}, microsite={}", mediaId, micrositeId);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Microsite findMicrositeById(UUID id) {
        return micrositeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", id));
    }

    private void verifyOwnership(Microsite microsite, String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!microsite.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this microsite");
        }
    }

    private String uploadToCloudinary(MultipartFile file, String folder, MediaType type) {
        return switch (type) {
            case IMAGE -> mediaService.uploadImage(file, folder);
            case VIDEO -> mediaService.uploadVideo(file, folder);
            case AUDIO, VOICE_NOTE -> mediaService.uploadVideo(file, folder); // Cloudinary treats audio as video resource
        };
    }

    /**
     * Extracts a best-effort Cloudinary public ID from a secure URL.
     * Format: https://res.cloudinary.com/{cloud}/image/upload/v{version}/{publicId}.{ext}
     */
    private String extractPublicId(String url) {
        try {
            String afterUpload = url.substring(url.indexOf("/upload/") + 8);
            // Skip the version segment (v1234567890/)
            if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
                afterUpload = afterUpload.substring(afterUpload.indexOf("/") + 1);
            }
            // Remove file extension
            int lastDot = afterUpload.lastIndexOf('.');
            return lastDot > 0 ? afterUpload.substring(0, lastDot) : afterUpload;
        } catch (Exception e) {
            log.warn("Could not extract public ID from URL: {}", url);
            return null;
        }
    }
}
