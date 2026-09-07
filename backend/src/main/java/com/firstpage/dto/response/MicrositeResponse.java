package com.firstpage.dto.response;

import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MicrositeStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Full microsite response including all slides — used for detail views
 * and the editor page.
 *
 * @param musicUrl      the raw URL the sender pasted, stored verbatim
 * @param musicProvider which player the client should use: {@code YOUTUBE},
 *                      {@code AUDIO}, or {@code NONE}. Derived from
 *                      {@code musicUrl} on every read, never persisted.
 * @param musicTrackId  the YouTube video ID, or the direct audio URL
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
        boolean hasBeenViewed,
        boolean isPasswordProtected,
        String musicUrl,
        String musicProvider,
        String musicTrackId,
        LocalDateTime scheduledAt,
        LocalDateTime publishedAt,
        LocalDateTime createdAt,
        List<SlideResponse> slides,
        int slideCount,
        int viewCount
) {}
