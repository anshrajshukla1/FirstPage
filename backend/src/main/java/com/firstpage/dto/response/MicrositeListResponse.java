package com.firstpage.dto.response;

import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MicrositeStatus;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Lightweight microsite response for dashboard list views.
 * Excludes slides to reduce payload size.
 */
public record MicrositeListResponse(
        UUID id,
        String title,
        String slug,
        Category category,
        MicrositeStatus status,
        boolean isOneTimeView,
        boolean hasBeenViewed,
        boolean isPasswordProtected,
        String previewImageUrl,
        int slideCount,
        int viewCount,
        /** When the recipient last opened it — null until somebody does. */
        LocalDateTime lastViewedAt,
        LocalDateTime createdAt
) {}
