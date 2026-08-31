package com.firstpage.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Request payload for editing a media item's caption after upload.
 *
 * <p>A blank caption is meaningful — it removes the one that was there.
 */
public record UpdateMediaRequest(
        @Size(max = 500, message = "Caption must be at most 500 characters")
        String caption
) {}
