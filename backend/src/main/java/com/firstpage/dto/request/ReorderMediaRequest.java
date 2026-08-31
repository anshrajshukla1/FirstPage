package com.firstpage.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

/**
 * Request payload for reordering the media in one gallery.
 * The list contains media IDs in the desired order.
 */
public record ReorderMediaRequest(
        @NotNull(message = "Media IDs are required")
        List<UUID> mediaIds
) {}
