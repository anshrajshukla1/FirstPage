package com.firstpage.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Reply response DTO for private visitor-to-creator messages.
 */
public record ReplyResponse(
        UUID id,
        String message,
        boolean isRead,
        LocalDateTime createdAt
) {}
