package com.firstpage.dto.request;

import com.firstpage.entity.enums.Category;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

/**
 * Request payload for creating a new microsite.
 * Uses Java record for immutability and conciseness.
 */
public record CreateMicrositeRequest(
        @NotBlank(message = "Title is required")
        String title,

        String recipientName,

        @NotNull(message = "Category is required")
        Category category,

        UUID themeId,

        String password,

        boolean isAnonymous,

        boolean isOneTimeView,

        String musicUrl
) {}
