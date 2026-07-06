package com.firstpage.dto.request;

import java.util.UUID;

/**
 * Request payload for updating an existing microsite.
 * All fields are optional — only non-null fields are applied.
 */
public record UpdateMicrositeRequest(
        String title,
        String recipientName,
        UUID themeId,
        String password,
        Boolean isAnonymous,
        Boolean isOneTimeView,
        String musicUrl
) {}
