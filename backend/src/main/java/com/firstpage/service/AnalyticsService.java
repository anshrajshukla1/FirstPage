package com.firstpage.service;

import com.firstpage.entity.Microsite;
import com.firstpage.entity.User;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Service for microsite analytics — views, reactions, replies, and visitor data.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final MicrositeRepository micrositeRepository;
    private final UserRepository userRepository;
    private final VisitorLogRepository visitorLogRepository;
    private final ReactionRepository reactionRepository;
    private final ReplyRepository replyRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getMicrositeAnalytics(UUID micrositeId, String firebaseUid) {
        Microsite microsite = verifyOwnership(micrositeId, firebaseUid);

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("micrositeId", micrositeId);
        analytics.put("title", microsite.getTitle());
        analytics.put("status", microsite.getStatus().name());

        // View stats
        long totalViews = visitorLogRepository.countByMicrositeId(micrositeId);
        long uniqueVisitors = visitorLogRepository.countDistinctSessionsByMicrositeId(micrositeId);
        Double avgTimeSpent = visitorLogRepository.avgTimeSpentByMicrositeId(micrositeId);
        Long totalReplays = visitorLogRepository.totalReplaysByMicrositeId(micrositeId);

        analytics.put("totalViews", totalViews);
        analytics.put("uniqueVisitors", uniqueVisitors);
        analytics.put("avgTimeSpentSeconds", avgTimeSpent != null ? avgTimeSpent : 0.0);
        analytics.put("totalReplays", totalReplays != null ? totalReplays : 0L);

        // Reaction stats
        long totalReactions = reactionRepository.countByMicrositeId(micrositeId);
        List<Object[]> reactionCounts = reactionRepository.countByType(micrositeId);
        List<Map<String, Object>> reactionSummary = reactionCounts.stream()
                .map(row -> Map.<String, Object>of(
                        "type", row[0].toString(),
                        "count", ((Number) row[1]).longValue()
                ))
                .toList();

        analytics.put("totalReactions", totalReactions);
        analytics.put("reactionsByType", reactionSummary);

        // Reply stats
        long totalReplies = replyRepository.countByMicrositeId(micrositeId);
        long unreadReplies = replyRepository.countByMicrositeIdAndIsReadFalse(micrositeId);

        analytics.put("totalReplies", totalReplies);
        analytics.put("unreadReplies", unreadReplies);

        return analytics;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardAnalytics(String firebaseUid) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Microsite> microsites = micrositeRepository.findByUserId(user.getId());

        long totalMicrosites = microsites.size();
        long totalViews = 0;
        long totalReactions = 0;
        long totalReplies = 0;

        for (Microsite m : microsites) {
            totalViews += visitorLogRepository.countByMicrositeId(m.getId());
            totalReactions += reactionRepository.countByMicrositeId(m.getId());
            totalReplies += replyRepository.countByMicrositeId(m.getId());
        }

        Map<String, Object> dashboard = new LinkedHashMap<>();
        dashboard.put("totalMicrosites", totalMicrosites);
        dashboard.put("totalViews", totalViews);
        dashboard.put("totalReactions", totalReactions);
        dashboard.put("totalReplies", totalReplies);

        return dashboard;
    }

    private Microsite verifyOwnership(UUID micrositeId, String firebaseUid) {
        Microsite microsite = micrositeRepository.findById(micrositeId)
                .orElseThrow(() -> new ResourceNotFoundException("Microsite", micrositeId));
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        if (!microsite.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this microsite");
        }
        return microsite;
    }
}
