package com.firstpage.controller;

import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.NotificationResponse;
import com.firstpage.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for user notifications.
 * Notifications are automatically created when someone views, reacts to,
 * or replies to one of the user's microsites.
 */
@Tag(name = "Notifications", description = "Notification management APIs")
@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get all notifications (paginated)")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getAll(
            Authentication auth,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getNotifications(getUid(auth), pageable)));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", count)));
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Mark a notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            Authentication auth,
            @PathVariable UUID id) {
        notificationService.markAsRead(id, getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
