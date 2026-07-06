package com.firstpage.dto.response;

import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MicrositeStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Full microsite response including all slides — used for detail views
 * and the editor page.
 */
public record MicrositeResponse(
        UUID id,
        String title,
        String slug,
        String recipientName,
        Category category,
        MicrositeStatus status,
        UUID themeId,
        boolean isAnonymous,
        boolean isOneTimeView,
        String musicUrl,
        LocalDateTime scheduledAt,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        List<SlideResponse> slides,
        int slideCount,
        int viewCount
) {}
