package com.firstpage.dto.response;

import com.firstpage.entity.enums.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Notification response DTO for the notification bell UI.
 */
public record NotificationResponse(
        UUID id,
        NotificationType type,
        String message,
        UUID micrositeId,
        boolean isRead,
        LocalDateTime createdAt
) {}
