package com.firstpage.dto.request;

import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

/**
 * Request payload for creating a new slide within a microsite.
 */
public record CreateSlideRequest(
        @NotNull(message = "Slide type is required")
        SlideType type,

        String title,

        String content,

        /** Structured per-type settings; shape depends on {@code type}. */
        Map<String, Object> config,

        AnimationType animationType,

        String backgroundType
) {}
