package com.firstpage.dto.request;

import com.firstpage.entity.enums.AnimationType;

/**
 * Request payload for updating an existing slide.
 */
public record UpdateSlideRequest(
        String title,
        String content,
        AnimationType animationType,
        String backgroundType
) {}
