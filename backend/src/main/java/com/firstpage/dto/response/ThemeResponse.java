package com.firstpage.dto.response;

import java.util.UUID;

/**
 * Theme response DTO with CSS variables for client-side rendering.
 */
public record ThemeResponse(
        UUID id,
        String name,
        String slug,
        String category,
        String cssVariables,
        String previewImageUrl,
        boolean isPremium
) {}
