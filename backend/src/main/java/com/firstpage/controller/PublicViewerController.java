package com.firstpage.controller;

import com.firstpage.dto.request.CreateReactionRequest;
import com.firstpage.dto.request.CreateReplyRequest;
import com.firstpage.dto.request.ProposalAnswerRequest;
import com.firstpage.dto.request.TrackVisitRequest;
import com.firstpage.dto.request.VerifyPasswordRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.dto.response.ReactionResponse;
import com.firstpage.dto.response.ReplyResponse;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.Reaction;
import com.firstpage.entity.Reply;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.entity.enums.NotificationType;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.mapper.ReactionMapper;
import com.firstpage.mapper.ReplyMapper;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.ReactionRepository;
import com.firstpage.repository.ReplyRepository;
import com.firstpage.service.MicrositeService;
import com.firstpage.service.NotificationService;
import com.firstpage.service.VisitorTrackingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Public-facing controller for microsite viewer interactions.
 * No authentication required — these endpoints are accessed by anyone
 * viewing a published microsite via its slug.
 */
@Slf4j
@Tag(name = "Public Viewer", description = "Public microsite interaction APIs")
@RestController
@RequestMapping("/api/v1/public/microsites/{slug}")
@RequiredArgsConstructor
public class PublicViewerController {

    private final MicrositeRepository micrositeRepository;
    private final ReactionRepository reactionRepository;
    private final ReplyRepository replyRepository;
    private final MicrositeService micrositeService;
    private final NotificationService notificationService;
    private final VisitorTrackingService visitorTrackingService;
    private final ReactionMapper reactionMapper;
    private final ReplyMapper replyMapper;

    // ── View Microsite ──────────────────────────────────────────────────

    /**
     * Returns a published microsite by slug.
     *
     * <p>Password-protected microsites return metadata only (no slides) with
     * {@code isPasswordProtected = true}; the client then calls
     * {@code /verify-password} to obtain the content. Nothing is logged and the
     * one-time view is not consumed until the content is actually delivered.
     */
    @GetMapping
    @Transactional
    @Operation(summary = "Get a published microsite by slug (public)")
    public ResponseEntity<ApiResponse<MicrositeResponse>> view(
            @PathVariable String slug,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);

        if (microsite.isPasswordProtected()) {
            return ResponseEntity.ok(ApiResponse.success(
                    micrositeService.toPublicResponse(microsite, false),
                    "This page is password protected"));
        }

        return ResponseEntity.ok(ApiResponse.success(deliver(microsite, request)));
    }

    /**
     * Verifies the visitor password and, on success, returns the full microsite
     * including its slides.
     */
    @PostMapping("/verify-password")
    @Transactional
    @Operation(summary = "Unlock a password-protected microsite and get its content")
    public ResponseEntity<ApiResponse<MicrositeResponse>> verifyPassword(
            @PathVariable String slug,
            @Valid @RequestBody VerifyPasswordRequest body,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);

        if (!micrositeService.verifyPassword(slug, body.password())) {
            throw new BusinessException("Incorrect password.", "INVALID_PASSWORD");
        }

        return ResponseEntity.ok(ApiResponse.success(
                deliver(microsite, request), "Unlocked"));
    }

    // ── Progress Tracking ───────────────────────────────────────────────

    /**
     * Records how far the visitor got and how long they stayed. Fire-and-forget:
     * a tracking failure never fails the caller.
     */
    @PostMapping("/track")
    @Operation(summary = "Report viewer progress for analytics")
    public ResponseEntity<ApiResponse<Void>> track(
            @PathVariable String slug,
            @Valid @RequestBody TrackVisitRequest body,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);
        String sessionId = visitorTrackingService.resolveSessionId(request);

        try {
            visitorTrackingService.trackProgress(microsite.getId(), sessionId, body);
        } catch (Exception e) {
            log.warn("Failed to track visit for microsite={}: {}", slug, e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(null, "Tracked"));
    }

    // ── Reactions ───────────────────────────────────────────────────────

    @PostMapping("/reactions")
    @Transactional
    @Operation(summary = "Add a reaction to a microsite")
    public ResponseEntity<ApiResponse<ReactionResponse>> react(
            @PathVariable String slug,
            @Valid @RequestBody CreateReactionRequest body,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);

        String sessionId = body.visitorSessionId() != null && !body.visitorSessionId().isBlank()
                ? body.visitorSessionId()
                : visitorTrackingService.resolveSessionId(request);

        Reaction saved = reactionRepository.save(Reaction.builder()
                .microsite(microsite)
                .type(body.type())
                .visitorSessionId(sessionId)
                .build());

        log.info("Reaction added: type={}, microsite={}", body.type(), slug);
        notifyOwner(microsite, NotificationType.REACTED,
                "Someone reacted %s to \"%s\"".formatted(body.type(), microsite.getTitle()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(reactionMapper.toResponse(saved), "Reaction added"));
    }

    @GetMapping("/reactions/summary")
    @Operation(summary = "Get reaction counts for a microsite")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> reactionSummary(
            @PathVariable String slug) {
        Microsite microsite = findPublished(slug);

        List<Object[]> counts = reactionRepository.countByType(microsite.getId());
        List<Map<String, Object>> summary = counts.stream()
                .map(row -> Map.<String, Object>of(
                        "type", row[0].toString(),
                        "count", ((Number) row[1]).longValue()
                ))
                .toList();

        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    // ── Replies ─────────────────────────────────────────────────────────

    @PostMapping("/replies")
    @Transactional
    @Operation(summary = "Send a reply to a microsite")
    public ResponseEntity<ApiResponse<ReplyResponse>> reply(
            @PathVariable String slug,
            @Valid @RequestBody CreateReplyRequest body,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);

        String sessionId = body.visitorSessionId() != null && !body.visitorSessionId().isBlank()
                ? body.visitorSessionId()
                : visitorTrackingService.resolveSessionId(request);

        Reply saved = replyRepository.save(Reply.builder()
                .microsite(microsite)
                .message(body.message())
                .visitorSessionId(sessionId)
                .isRead(false)
                .build());

        log.info("Reply received: microsite={}", slug);
        notifyOwner(microsite, NotificationType.REPLIED,
                "You have a new reply on \"%s\"".formatted(microsite.getTitle()));

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(replyMapper.toResponse(saved), "Reply sent"));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Microsite findPublished(String slug) {
        Microsite microsite = micrositeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", slug));
        if (microsite.getStatus() != MicrositeStatus.PUBLISHED) {
            throw new BusinessException("This microsite is not currently published.",
                    "NOT_PUBLISHED");
        }
        return microsite;
    }

    /**
     * Hands the microsite content to the visitor: enforces the one-time-view
     * rule first, then builds the response, consumes the view, and records the
     * visit. Ordering matters — nothing is mutated until we know the content is
     * actually being served.
     */
    private MicrositeResponse deliver(Microsite microsite, HttpServletRequest request) {
        if (microsite.isOneTimeView() && microsite.isHasBeenViewed()) {
            throw new BusinessException(
                    "This page was a one-time view and has already been seen.",
                    "ONE_TIME_VIEWED");
        }

        MicrositeResponse response = micrositeService.toPublicResponse(microsite, true);

        if (microsite.isOneTimeView()) {
            microsite.setHasBeenViewed(true);
            micrositeRepository.save(microsite);
        }

        boolean firstVisit = false;
        String sessionId = visitorTrackingService.resolveSessionId(request);
        try {
            firstVisit = visitorTrackingService.recordVisit(microsite.getId(), sessionId, request);
        } catch (Exception e) {
            log.warn("Failed to log visitor for microsite={}: {}",
                    microsite.getSlug(), e.getMessage());
        }

        // Only notify on a genuinely new visitor, so reloads don't spam the bell.
        if (firstVisit) {
            notifyOwner(microsite, NotificationType.VIEWED,
                    "Someone just viewed \"%s\"".formatted(microsite.getTitle()));
        }

        return response;
    }

    // ── Proposal answer ───────────────────────────────────────────

    /**
     * Records that the recipient answered a proposal.
     *
     * <p>Only a yes notifies. The soft "no" a proposal slide offers exists so the
     * recipient can decline gently and in person — pushing that to the sender's
     * phone before they have spoken would take the kindness back out of it.
     */
    @PostMapping("/answer")
    @Transactional
    @Operation(summary = "Record the recipient's answer to a proposal slide")
    public ResponseEntity<ApiResponse<Void>> answer(
            @PathVariable String slug,
            @Valid @RequestBody ProposalAnswerRequest body) {
        Microsite microsite = findPublished(slug);

        if (Boolean.TRUE.equals(body.accepted())) {
            log.info("Proposal accepted: microsite={}", slug);
            notifyOwner(microsite, NotificationType.ACCEPTED,
                    "They said yes to \"%s\"".formatted(microsite.getTitle()));
        }

        return ResponseEntity.ok(ApiResponse.success(null, "Recorded"));
    }

    /** Best-effort notification — never fails the visitor's request. */
    private void notifyOwner(Microsite microsite, NotificationType type, String message) {
        UUID ownerId = microsite.getUserId();
        if (ownerId == null) return;
        try {
            notificationService.notifyOwner(ownerId, microsite.getId(), type, message);
        } catch (Exception e) {
            log.warn("Failed to create {} notification for microsite={}: {}",
                    type, microsite.getSlug(), e.getMessage());
        }
    }
}
