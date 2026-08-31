package com.firstpage.dto.request;

import com.firstpage.entity.enums.AnimationType;

import java.util.Map;

/**
 * Request payload for updating an existing slide. Every field is optional —
 * a null field leaves the stored value untouched.
 */
public record UpdateSlideRequest(
        String title,
        String content,
        /** Merged key-by-key into the stored config rather than replacing it. */
        Map<String, Object> config,
        AnimationType animationType,
        String backgroundType
) {}
