package com.firstpage.dto.request;

import com.firstpage.entity.enums.Category;
import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for AI content generation.
 * The prompt describes what the user wants, context provides additional info,
 * category and tone guide the AI's output style.
 */
public record AIGenerateRequest(
        @NotBlank(message = "Prompt is required")
        String prompt,

        String context,

        Category category,

        String tone
) {}
