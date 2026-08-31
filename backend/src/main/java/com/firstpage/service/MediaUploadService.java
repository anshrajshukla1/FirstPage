package com.firstpage.service;

import com.firstpage.dto.response.MediaResponse;
import com.firstpage.entity.Media;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.Slide;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.MediaType;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.mapper.MediaMapper;
import com.firstpage.media.MediaService;
import com.firstpage.media.UploadedAsset;
import com.firstpage.repository.MediaRepository;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.SlideRepository;
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
    private final SlideRepository slideRepository;
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
     * @param slideId     optional slide to attach this media to. When null the
     *                    media belongs to the microsite as a whole; when set,
     *                    it appears in that slide's gallery.
     * @return the persisted media as a response DTO
     */
    @Transactional
    public MediaResponse upload(UUID micrositeId, String firebaseUid,
                                MultipartFile file, String caption, MediaType type,
                                UUID slideId) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        // Resolved before the upload so a bad slideId fails fast, without
        // leaving an orphaned file in Cloudinary.
        Slide slide = slideId == null ? null : resolveSlide(slideId, micrositeId);

        String folder = "microsites/" + micrositeId;
        UploadedAsset asset = uploadToCloudinary(file, folder, type);

        // Order within the gallery it will actually be shown in.
        int nextOrderIndex = slide == null
                ? mediaRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId).size()
                : mediaRepository.findBySlideIdOrderByOrderIndexAsc(slideId).size();

        Media media = Media.builder()
                .microsite(microsite)
                .slide(slide)
                .type(type)
                .url(asset.url())
                .publicId(asset.publicId())
                .caption(caption)
                .orderIndex(nextOrderIndex)
                .fileSize(file.getSize())
                .build();

        Media saved = mediaRepository.save(media);
        log.info("Media uploaded: id={}, type={}, microsite={}, slide={}",
                saved.getId(), type, micrositeId, slideId);

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

    // ── Update ──────────────────────────────────────────────────────────

    /**
     * Updates a media item's caption.
     *
     * @param micrositeId the owning microsite's ID
     * @param mediaId     the media item's ID
     * @param firebaseUid the authenticated user's Firebase UID
     * @param caption     the new caption; blank clears it
     * @return the updated media as a response DTO
     */
    @Transactional
    public MediaResponse updateCaption(UUID micrositeId, UUID mediaId,
                                       String firebaseUid, String caption) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        Media media = findMediaInMicrosite(mediaId, micrositeId);
        media.setCaption(caption == null || caption.isBlank() ? null : caption.trim());

        return mediaMapper.toResponse(mediaRepository.save(media));
    }

    // ── Reorder ─────────────────────────────────────────────────────────

    /**
     * Reorders one gallery. Only the media named in the request move; anything
     * else attached to the microsite keeps its index, so reordering a slide's
     * photos can't disturb another slide's.
     *
     * @param micrositeId the owning microsite's ID
     * @param firebaseUid the authenticated user's Firebase UID
     * @param orderedIds  media IDs in the order they should appear
     * @return the reordered media
     */
    @Transactional
    public List<MediaResponse> reorder(UUID micrositeId, String firebaseUid,
                                       List<UUID> orderedIds) {
        Microsite microsite = findMicrositeById(micrositeId);
        verifyOwnership(microsite, firebaseUid);

        List<Media> media = orderedIds.stream()
                .map(id -> findMediaInMicrosite(id, micrositeId))
                .toList();

        for (int i = 0; i < media.size(); i++) {
            media.get(i).setOrderIndex(i);
        }

        List<Media> saved = mediaRepository.saveAll(media);
        log.info("Media reordered for micrositeId={}, count={}", micrositeId, saved.size());

        return saved.stream().map(mediaMapper::toResponse).toList();
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

        Media media = findMediaInMicrosite(mediaId, micrositeId);

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

    /**
     * Loads a media item and asserts it belongs to the microsite the caller just
     * proved ownership of — otherwise a caller could rename or reorder media on
     * someone else's page by id alone.
     */
    private Media findMediaInMicrosite(UUID mediaId, UUID micrositeId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media", mediaId));
        if (!media.getMicrosite().getId().equals(micrositeId)) {
            throw new BusinessException("Media does not belong to the specified microsite",
                    "MEDIA_MISMATCH");
        }
        return media;
    }

    /**
     * Loads a slide and asserts it belongs to the microsite the caller just
     * proved ownership of — without this check, a caller could attach media to
     * any slide in the database.
     */
    private Slide resolveSlide(UUID slideId, UUID micrositeId) {
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", slideId));
        if (!slide.getMicrosite().getId().equals(micrositeId)) {
            throw new BusinessException("Slide does not belong to the specified microsite",
                    "SLIDE_MISMATCH");
        }
        return slide;
    }

    private void verifyOwnership(Microsite microsite, String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!microsite.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this microsite");
        }
    }

    private UploadedAsset uploadToCloudinary(MultipartFile file, String folder, MediaType type) {
        return switch (type) {
            case IMAGE -> mediaService.uploadImage(file, folder);
            case VIDEO -> mediaService.uploadVideo(file, folder);
            // Cloudinary stores audio as a video resource, but the accepted
            // content types are audio's own — hence a separate method.
            case AUDIO, VOICE_NOTE -> mediaService.uploadAudio(file, folder);
        };
    }
}
