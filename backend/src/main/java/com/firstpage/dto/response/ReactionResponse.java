package com.firstpage.dto.response;

import com.firstpage.entity.enums.ReactionType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Individual reaction response DTO.
 */
public record ReactionResponse(
        UUID id,
        ReactionType type,
        LocalDateTime createdAt
) {}
