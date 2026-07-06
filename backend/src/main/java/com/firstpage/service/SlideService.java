package com.firstpage.service;

import com.firstpage.dto.request.CreateSlideRequest;
import com.firstpage.dto.request.ReorderSlidesRequest;
import com.firstpage.dto.request.UpdateSlideRequest;
import com.firstpage.dto.response.SlideResponse;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.Slide;
import com.firstpage.entity.User;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.mapper.SlideMapper;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.SlideRepository;
import com.firstpage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing slides within a microsite.
 * Handles CRUD operations and reordering with ownership verification.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SlideService {

    private final SlideRepository slideRepository;
    private final MicrositeRepository micrositeRepository;
    private final UserRepository userRepository;
    private final SlideMapper slideMapper;

    // ── Create ──────────────────────────────────────────────────────────

    @Transactional
    public SlideResponse create(UUID micrositeId, String firebaseUid, CreateSlideRequest request) {
        Microsite microsite = findMicrositeAndVerify(micrositeId, firebaseUid);

        Slide slide = slideMapper.toEntity(request);
        slide.setMicrosite(microsite);
        // Set order index to end of list
        long count = slideRepository.countByMicrositeId(micrositeId);
        slide.setOrderIndex((int) count);

        Slide saved = slideRepository.save(slide);
        log.info("Slide created: id={}, micrositeId={}, order={}", saved.getId(), micrositeId, saved.getOrderIndex());

        return slideMapper.toResponse(saved);
    }

    // ── Read ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<SlideResponse> getSlides(UUID micrositeId, String firebaseUid) {
        findMicrositeAndVerify(micrositeId, firebaseUid);
        return slideRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId)
                .stream()
                .map(slideMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SlideResponse getById(UUID micrositeId, UUID slideId, String firebaseUid) {
        findMicrositeAndVerify(micrositeId, firebaseUid);
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", slideId));
        return slideMapper.toResponse(slide);
    }

    // ── Update ──────────────────────────────────────────────────────────

    @Transactional
    public SlideResponse update(UUID micrositeId, UUID slideId, String firebaseUid, UpdateSlideRequest request) {
        findMicrositeAndVerify(micrositeId, firebaseUid);
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", slideId));

        if (request.title() != null) slide.setTitle(request.title());
        if (request.content() != null) slide.setContent(request.content());
        if (request.animationType() != null) slide.setAnimationType(request.animationType());
        if (request.backgroundType() != null) slide.setBackgroundType(request.backgroundType());

        Slide saved = slideRepository.save(slide);
        log.info("Slide updated: id={}", slideId);

        return slideMapper.toResponse(saved);
    }

    // ── Delete ──────────────────────────────────────────────────────────

    @Transactional
    public void delete(UUID micrositeId, UUID slideId, String firebaseUid) {
        findMicrositeAndVerify(micrositeId, firebaseUid);
        Slide slide = slideRepository.findById(slideId)
                .orElseThrow(() -> new ResourceNotFoundException("Slide", slideId));

        slideRepository.delete(slide);
        // Reindex remaining slides
        reindexSlides(micrositeId);
        log.info("Slide deleted: id={}, micrositeId={}", slideId, micrositeId);
    }

    // ── Reorder ─────────────────────────────────────────────────────────

    @Transactional
    public List<SlideResponse> reorder(UUID micrositeId, String firebaseUid, ReorderSlidesRequest request) {
        findMicrositeAndVerify(micrositeId, firebaseUid);

        List<UUID> orderedIds = request.slideIds();
        List<Slide> slides = slideRepository.findByMicrositeId(micrositeId);

        for (Slide slide : slides) {
            int newIndex = orderedIds.indexOf(slide.getId());
            if (newIndex != -1) {
                slide.setOrderIndex(newIndex);
            }
        }

        slideRepository.saveAll(slides);
        log.info("Slides reordered for micrositeId={}", micrositeId);

        return slideRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId)
                .stream()
                .map(slideMapper::toResponse)
                .toList();
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Microsite findMicrositeAndVerify(UUID micrositeId, String firebaseUid) {
        Microsite microsite = micrositeRepository.findById(micrositeId)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", micrositeId));
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!microsite.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this microsite");
        }
        return microsite;
    }

    private void reindexSlides(UUID micrositeId) {
        List<Slide> slides = slideRepository.findByMicrositeIdOrderByOrderIndexAsc(micrositeId);
        for (int i = 0; i < slides.size(); i++) {
            slides.get(i).setOrderIndex(i);
        }
        slideRepository.saveAll(slides);
    }
}
