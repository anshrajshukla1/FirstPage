package com.firstpage.dto.request;

import jakarta.validation.constraints.NotBlank;

/**
 * Request payload for submitting a reply to a microsite creator.
 */
public record CreateReplyRequest(
        @NotBlank(message = "Reply message is required")
        String message,

        String visitorSessionId
) {}
