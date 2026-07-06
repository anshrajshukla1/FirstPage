package com.firstpage.dto.response;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Comprehensive visitor analytics response for the analytics dashboard.
 * Includes aggregate stats and per-slide breakdowns.
 */
public record VisitorAnalyticsResponse(
        long totalViews,
        long uniqueVisitors,
        double avgTimeSpent,
        Map<String, Long> viewsByDevice,
        Map<String, Long> viewsByCountry,
        List<SlideAnalytics> slideAnalytics
) {
    /**
     * Analytics data for a single slide within a microsite.
     */
    public record SlideAnalytics(
            UUID slideId,
            String slideTitle,
            long views,
            double avgTimeSpent
    ) {}
}
