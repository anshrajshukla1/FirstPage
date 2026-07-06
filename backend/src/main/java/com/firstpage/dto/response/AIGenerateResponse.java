package com.firstpage.dto.response;

/**
 * Response DTO for AI-generated content.
 */
public record AIGenerateResponse(
        String generatedContent,
        String provider,
        String promptType
) {}
