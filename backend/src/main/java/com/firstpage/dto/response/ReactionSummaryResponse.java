package com.firstpage.dto.response;

import com.firstpage.entity.enums.ReactionType;

/**
 * Aggregated reaction summary — count of each reaction type.
 * Used in the analytics dashboard.
 */
public record ReactionSummaryResponse(
        ReactionType type,
        long count
) {}
