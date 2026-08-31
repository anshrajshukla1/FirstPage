package com.firstpage.dto.request;

import jakarta.validation.constraints.Min;

/**
 * Heartbeat payload sent by the public viewer to record how far a visitor got
 * and how long they stayed. Both fields are optional so the client can send
 * partial updates.
 *
 * <p>Replay count is intentionally absent — the server derives it from repeat
 * visits rather than trusting the visitor to report it.
 */
public record TrackVisitRequest(
        @Min(value = 0, message = "Slide index cannot be negative")
        Integer currentSlideIndex,

        @Min(value = 0, message = "Time spent cannot be negative")
        Integer timeSpentSeconds
) {}
