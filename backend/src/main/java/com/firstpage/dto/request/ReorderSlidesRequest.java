package com.firstpage.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request payload for reordering slides within a microsite.
 * The list contains slide IDs in the desired order.
 */
public record ReorderSlidesRequest(
        @NotNull(message = "Slide IDs are required")
        List<UUID> slideIds
) {}
