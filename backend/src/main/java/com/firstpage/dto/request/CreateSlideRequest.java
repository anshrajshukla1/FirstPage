package com.firstpage.dto.request;

import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for creating a new slide within a microsite.
 */
public record CreateSlideRequest(
        @NotNull(message = "Slide type is required")
        SlideType type,

        String title,

        String content,

        AnimationType animationType,

        String backgroundType
) {}
