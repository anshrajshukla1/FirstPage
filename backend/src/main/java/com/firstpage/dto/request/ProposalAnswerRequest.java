package com.firstpage.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * The recipient's answer to a PROPOSAL slide.
 *
 * <p>Nothing is persisted — the answer only raises a notification, so the sender
 * hears it from their own dashboard rather than waiting to be told.
 */
public record ProposalAnswerRequest(
        @NotNull(message = "An answer is required")
        Boolean accepted
) {}
