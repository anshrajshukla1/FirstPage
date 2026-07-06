package com.firstpage.service;

import com.firstpage.dto.request.CreateMicrositeRequest;
import com.firstpage.dto.request.UpdateMicrositeRequest;
import com.firstpage.dto.response.MicrositeListResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.mapper.MicrositeMapper;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.UserRepository;
import com.firstpage.repository.VisitorLogRepository;
import com.firstpage.utils.SlugUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Core business logic for microsite CRUD operations.
 * Handles creation, retrieval, update, deletion, publishing, scheduling,
 * and ownership authorization checks.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MicrositeService {

    private final MicrositeRepository micrositeRepository;
    private final UserRepository userRepository;
    private final VisitorLogRepository visitorLogRepository;
    private final MicrositeMapper micrositeMapper;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ── Create ──────────────────────────────────────────────────────────

    @Transactional
    public MicrositeResponse create(String firebaseUid, CreateMicrositeRequest request) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Microsite microsite = micrositeMapper.toEntity(request);
        microsite.setUserId(user.getId());
        microsite.setSlug(generateUniqueSlug(request.title()));
        microsite.setStatus(MicrositeStatus.DRAFT);

        // Hash password if provided
        if (request.password() != null && !request.password().isBlank()) {
            microsite.setPasswordHash(passwordEncoder.encode(request.password()));
        }

        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite created: id={}, slug={}, user={}", saved.getId(), saved.getSlug(), firebaseUid);

        return enrichResponse(micrositeMapper.toResponse(saved), saved.getId());
    }

    // ── Read ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public MicrositeResponse getById(UUID id, String firebaseUid) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);
        return enrichResponse(micrositeMapper.toResponse(microsite), id);
    }

    @Transactional(readOnly = true)
    public MicrositeResponse getBySlug(String slug) {
        Microsite microsite = micrositeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", slug));
        return enrichResponse(micrositeMapper.toResponse(microsite), microsite.getId());
    }

    @Transactional(readOnly = true)
    public Page<MicrositeListResponse> getMyMicrosites(String firebaseUid, MicrositeStatus status, Pageable pageable) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Page<Microsite> page;
        if (status != null) {
            page = micrositeRepository.findByUserIdAndStatus(user.getId(), status, pageable);
        } else {
            page = micrositeRepository.findByUserId(user.getId(), pageable);
        }

        return page.map(m -> {
            MicrositeListResponse lr = micrositeMapper.toListResponse(m);
            long views = visitorLogRepository.countDistinctSessionsByMicrositeId(m.getId());
            // Re-create with enriched viewCount
            return new MicrositeListResponse(
                    lr.id(), lr.title(), lr.slug(), lr.category(), lr.status(),
                    lr.previewImageUrl(), lr.slideCount(), (int) views, lr.createdAt()
            );
        });
    }

    @Transactional(readOnly = true)
    public long countMyMicrosites(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return micrositeRepository.countByUserId(user.getId());
    }

    // ── Update ──────────────────────────────────────────────────────────

    @Transactional
    public MicrositeResponse update(UUID id, String firebaseUid, UpdateMicrositeRequest request) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        // Apply non-null updates
        if (request.title() != null) microsite.setTitle(request.title());
        if (request.recipientName() != null) microsite.setRecipientName(request.recipientName());
        if (request.themeId() != null) microsite.setThemeId(request.themeId());
        if (request.isAnonymous() != null) microsite.setAnonymous(request.isAnonymous());
        if (request.isOneTimeView() != null) microsite.setOneTimeView(request.isOneTimeView());
        if (request.musicUrl() != null) microsite.setMusicUrl(request.musicUrl());
        if (request.password() != null) {
            if (request.password().isBlank()) {
                microsite.setPasswordHash(null); // Remove password
            } else {
                microsite.setPasswordHash(passwordEncoder.encode(request.password()));
            }
        }

        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite updated: id={}", id);

        return enrichResponse(micrositeMapper.toResponse(saved), id);
    }

    // ── Delete ──────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID id, String firebaseUid) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        micrositeRepository.delete(microsite);
        log.info("Microsite deleted: id={}, user={}", id, firebaseUid);
    }

    // ── Publish / Unpublish / Schedule ──────────────────────────────────

    @Transactional
    public MicrositeResponse publish(UUID id, String firebaseUid) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        if (microsite.getSlideCount() == 0) {
            throw new BusinessException("EMPTY_MICROSITE", "Cannot publish a microsite with no slides");
        }

        microsite.publish();
        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite published: id={}", id);

        return enrichResponse(micrositeMapper.toResponse(saved), id);
    }

    @Transactional
    public MicrositeResponse unpublish(UUID id, String firebaseUid) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        microsite.setStatus(MicrositeStatus.DRAFT);
        microsite.setPublishedAt(null);
        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite unpublished: id={}", id);

        return enrichResponse(micrositeMapper.toResponse(saved), id);
    }

    @Transactional
    public MicrositeResponse schedule(UUID id, String firebaseUid, LocalDateTime scheduledAt) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        if (scheduledAt.isBefore(LocalDateTime.now())) {
            throw new BusinessException("INVALID_SCHEDULE", "Scheduled time must be in the future");
        }

        microsite.setStatus(MicrositeStatus.SCHEDULED);
        microsite.setScheduledAt(scheduledAt);
        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite scheduled: id={}, scheduledAt={}", id, scheduledAt);

        return enrichResponse(micrositeMapper.toResponse(saved), id);
    }

    @Transactional
    public MicrositeResponse archive(UUID id, String firebaseUid) {
        Microsite microsite = findMicrositeById(id);
        verifyOwnership(microsite, firebaseUid);

        microsite.archive();
        Microsite saved = micrositeRepository.save(microsite);
        log.info("Microsite archived: id={}", id);

        return enrichResponse(micrositeMapper.toResponse(saved), id);
    }

    // ── Password Verification (for visitors) ────────────────────────────

    public boolean verifyPassword(String slug, String rawPassword) {
        Microsite microsite = micrositeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", slug));

        if (!microsite.isPasswordProtected()) return true;
        return passwordEncoder.matches(rawPassword, microsite.getPasswordHash());
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

    private String generateUniqueSlug(String title) {
        String base = SlugUtils.toSlug(title);
        String slug = base;
        int attempt = 0;
        while (micrositeRepository.existsBySlug(slug)) {
            slug = base + "-" + SlugUtils.generateRandomSlug(4);
            attempt++;
            if (attempt > 10) {
                slug = SlugUtils.generateRandomSlug(12);
            }
        }
        return slug;
    }

    private MicrositeResponse enrichResponse(MicrositeResponse response, UUID micrositeId) {
        long views = visitorLogRepository.countDistinctSessionsByMicrositeId(micrositeId);
        return new MicrositeResponse(
                response.id(), response.title(), response.slug(), response.recipientName(),
                response.category(), response.status(), response.themeId(),
                response.isAnonymous(), response.isOneTimeView(), response.musicUrl(),
                response.scheduledAt(), response.publishedAt(), response.createdAt(),
                response.slides(), response.slideCount(), (int) views
        );
    }
}
