package com.firstpage.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for updating user profile information.
 */
public record UpdateUserRequest(
    @NotBlank(message = "Display name is required")
    String displayName,

    String photoUrl
) {}
