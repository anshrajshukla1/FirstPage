package com.firstpage.service;

import com.firstpage.dto.request.TrackVisitRequest;
import com.firstpage.entity.VisitorLog;
import com.firstpage.repository.MicrositeRepository;
import com.firstpage.repository.VisitorLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/**
 * Records anonymous visitor activity for published microsites.
 *
 * <p>Every write runs in its own transaction ({@link Propagation#REQUIRES_NEW})
 * so analytics bookkeeping can never roll back — or be rolled back by — the
 * visitor-facing request that triggered it. Callers should treat failures as
 * non-fatal.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class VisitorTrackingService {

    /** Header the public viewer uses to send its persisted visitor id. */
    public static final String SESSION_HEADER = "X-Visitor-Session";

    private static final int MAX_SESSION_ID_LENGTH = 100;

    private final VisitorLogRepository visitorLogRepository;
    private final MicrositeRepository micrositeRepository;

    // ── Session identity ────────────────────────────────────────────────

    /**
     * Resolves a stable id for the current visitor.
     *
     * <p>Prefers the client-supplied {@value #SESSION_HEADER} header. When it is
     * absent (e.g. a client that blocks storage) it falls back to a digest of
     * IP + User-Agent, so repeat visits still collapse into a single "unique
     * visitor" instead of inflating the count on every request.
     */
    public String resolveSessionId(HttpServletRequest request) {
        String provided = request.getHeader(SESSION_HEADER);
        if (provided != null && !provided.isBlank()) {
            String trimmed = provided.trim();
            return trimmed.length() > MAX_SESSION_ID_LENGTH
                    ? trimmed.substring(0, MAX_SESSION_ID_LENGTH)
                    : trimmed;
        }
        String fingerprint = clientIp(request) + "|" + Objects.toString(userAgent(request), "");
        return "fp-" + DigestUtils.md5DigestAsHex(fingerprint.getBytes(StandardCharsets.UTF_8));
    }

    // ── Writes ──────────────────────────────────────────────────────────

    /**
     * Records a visit, creating one row per (microsite, session) pair.
     *
     * @return {@code true} if this is the session's first visit to the microsite
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean recordVisit(UUID micrositeId, String sessionId, HttpServletRequest request) {
        Optional<VisitorLog> existing = visitorLogRepository
                .findFirstByMicrositeIdAndSessionIdOrderByVisitedAtDesc(micrositeId, sessionId);

        if (existing.isPresent()) {
            VisitorLog visit = existing.get();
            visit.setReplayCount(visit.getReplayCount() + 1);
            visitorLogRepository.save(visit);
            return false;
        }

        String ua = userAgent(request);
        visitorLogRepository.save(VisitorLog.builder()
                .microsite(micrositeRepository.getReferenceById(micrositeId))
                .sessionId(sessionId)
                .ipAddress(clientIp(request))
                .browser(ua)
                .device(detectDevice(ua))
                .build());
        return true;
    }

    /**
     * Updates how far the visitor got and how long they stayed. Values are only
     * applied when they move forward, so out-of-order heartbeats cannot lower a
     * previously reported maximum. {@code replayCount} is deliberately not
     * client-settable — {@link #recordVisit} owns it.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void trackProgress(UUID micrositeId, String sessionId, TrackVisitRequest request) {
        VisitorLog visit = visitorLogRepository
                .findFirstByMicrositeIdAndSessionIdOrderByVisitedAtDesc(micrositeId, sessionId)
                .orElse(null);

        if (visit == null) {
            log.debug("No visit row for microsite={} session={} — ignoring heartbeat",
                    micrositeId, sessionId);
            return;
        }

        if (request.currentSlideIndex() != null
                && request.currentSlideIndex() > visit.getCurrentSlideIndex()) {
            visit.setCurrentSlideIndex(request.currentSlideIndex());
        }
        if (request.timeSpentSeconds() != null
                && request.timeSpentSeconds() > visit.getTimeSpentSeconds()) {
            visit.setTimeSpentSeconds(request.timeSpentSeconds());
        }

        visitorLogRepository.save(visit);
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private String clientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // May be a comma-separated chain — the first entry is the client.
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private String userAgent(HttpServletRequest request) {
        return request.getHeader("User-Agent");
    }

    private String detectDevice(String userAgent) {
        if (userAgent == null || userAgent.isBlank()) return "UNKNOWN";
        String ua = userAgent.toLowerCase(Locale.ROOT);
        if (ua.contains("ipad") || ua.contains("tablet")) return "TABLET";
        if (ua.contains("mobi") || ua.contains("android") || ua.contains("iphone")) return "MOBILE";
        return "DESKTOP";
    }
}
