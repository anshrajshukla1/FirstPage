package com.firstpage.dto.request;

import com.firstpage.entity.enums.ReactionType;
import jakarta.validation.constraints.NotNull;

/**
 * Request payload for submitting a reaction to a microsite.
 */
public record CreateReactionRequest(
        @NotNull(message = "Reaction type is required")
        ReactionType type,

        String visitorSessionId
) {}
