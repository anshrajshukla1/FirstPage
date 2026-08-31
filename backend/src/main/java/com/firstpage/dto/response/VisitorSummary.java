package com.firstpage.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Per-microsite visitor aggregate, read in one grouped query for a whole page
 * of dashboard cards.
 *
 * <p>{@code distinctVisitors} counts sessions rather than rows, so a recipient
 * who reloads the page four times is still one visitor. {@code lastVisitedAt}
 * is what the card actually leads with — "Opened 4 minutes ago" tells the sender
 * something a bare count never does.
 */
public record VisitorSummary(
        UUID micrositeId,
        long distinctVisitors,
        LocalDateTime lastVisitedAt
) {}
