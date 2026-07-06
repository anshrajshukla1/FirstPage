package com.firstpage.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for user profile information.
 */
public record UserResponse(
    UUID id,
    String email,
    String displayName,
    String photoUrl,
    String role,
    LocalDateTime lastLoginAt,
    LocalDateTime createdAt
) {}
