package com.firstpage.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for verifying a password-protected microsite.
 */
public record VerifyPasswordRequest(
        @NotBlank(message = "Password is required")
        String password
) {}
