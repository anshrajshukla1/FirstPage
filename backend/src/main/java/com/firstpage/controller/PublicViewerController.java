package com.firstpage.controller;

import com.firstpage.dto.request.CreateReactionRequest;
import com.firstpage.dto.request.CreateReplyRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.dto.response.ReactionResponse;
import com.firstpage.dto.response.ReplyResponse;
import com.firstpage.entity.Microsite;
import com.firstpage.entity.Reaction;
import com.firstpage.entity.Reply;
import com.firstpage.entity.VisitorLog;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.exception.BusinessException;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.mapper.MicrositeMapper;
import com.firstpage.mapper.ReactionMapper;
import com.firstpage.mapper.ReplyMapper;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.ReactionRepository;
import com.firstpage.repository.ReplyRepository;
import com.firstpage.repository.VisitorLogRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    private final VisitorLogRepository visitorLogRepository;
    private final MicrositeMapper micrositeMapper;
    private final ReactionMapper reactionMapper;
    private final ReplyMapper replyMapper;

    // ── View Microsite ──────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "Get a published microsite by slug (public)")
    public ResponseEntity<ApiResponse<MicrositeResponse>> view(
            @PathVariable String slug,
            HttpServletRequest request) {
        Microsite microsite = findPublished(slug);

        // Log visitor
        logVisit(microsite, request);

        // Handle one-time view
        if (microsite.isOneTimeView() && microsite.isHasBeenViewed()) {
            throw new BusinessException("ONE_TIME_VIEWED",
                    "This page was a one-time view and has already been seen.");
        }
        if (microsite.isOneTimeView()) {
            microsite.setHasBeenViewed(true);
            micrositeRepository.save(microsite);
        }

        return ResponseEntity.ok(ApiResponse.success(micrositeMapper.toResponse(microsite)));
    }

    // ── Reactions ───────────────────────────────────────────────────────

    @PostMapping("/reactions")
    @Operation(summary = "Add a reaction to a microsite")
    public ResponseEntity<ApiResponse<ReactionResponse>> react(
            @PathVariable String slug,
            @Valid @RequestBody CreateReactionRequest request) {
        Microsite microsite = findPublished(slug);

        Reaction reaction = Reaction.builder()
                .microsite(microsite)
                .type(request.type())
                .build();

        Reaction saved = reactionRepository.save(reaction);
        log.info("Reaction added: type={}, microsite={}", request.type(), slug);

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
    @Operation(summary = "Send a reply to a microsite")
    public ResponseEntity<ApiResponse<ReplyResponse>> reply(
            @PathVariable String slug,
            @Valid @RequestBody CreateReplyRequest request) {
        Microsite microsite = findPublished(slug);

        Reply reply = Reply.builder()
                .microsite(microsite)
                .message(request.message())
                .isRead(false)
                .build();

        Reply saved = replyRepository.save(reply);
        log.info("Reply received: microsite={}", slug);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(replyMapper.toResponse(saved), "Reply sent"));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private Microsite findPublished(String slug) {
        Microsite microsite = micrositeRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", slug));
        if (microsite.getStatus() != MicrositeStatus.PUBLISHED) {
            throw new BusinessException("NOT_PUBLISHED",
                    "This microsite is not currently published.");
        }
        return microsite;
    }

    private void logVisit(Microsite microsite, HttpServletRequest request) {
        try {
            String sessionId = UUID.randomUUID().toString();
            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null) ip = request.getRemoteAddr();
            String browser = request.getHeader("User-Agent");

            VisitorLog visitLog = VisitorLog.builder()
                    .microsite(microsite)
                    .sessionId(sessionId)
                    .ipAddress(ip)
                    .browser(browser)
                    .build();

            visitorLogRepository.save(visitLog);
        } catch (Exception e) {
            log.warn("Failed to log visitor: {}", e.getMessage());
        }
    }
}
