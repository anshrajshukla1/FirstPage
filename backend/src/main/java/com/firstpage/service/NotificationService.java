package com.firstpage.service;

import com.firstpage.dto.response.NotificationResponse;
import com.firstpage.entity.Notification;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.NotificationType;
import com.firstpage.exception.ResourceNotFoundException;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.mapper.NotificationMapper;
import com.firstpage.repository.NotificationRepository;
import com.firstpage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for managing user notifications.
 * Notifications are created automatically when someone views, reacts to,
 * or replies to a microsite.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    // ── Create ──────────────────────────────────────────────────────────

    /**
     * Creates a notification for a microsite owner.
     *
     * <p>Runs in its own transaction so a failure here can never roll back the
     * visitor action (view / reaction / reply) that triggered it. Callers are
     * expected to invoke this in a try/catch and treat failures as non-fatal.
     *
     * @param ownerId     the owning {@link User}'s id
     * @param micrositeId the microsite the event relates to
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyOwner(UUID ownerId, UUID micrositeId, NotificationType type, String message) {
        User owner = userRepository.findById(ownerId).orElse(null);
        if (owner == null) {
            log.warn("Skipping notification — owner {} not found", ownerId);
            return;
        }
        notificationRepository.save(Notification.builder()
                .user(owner)
                .micrositeId(micrositeId)
                .type(type)
                .message(message)
                .isRead(false)
                .build());
        log.debug("Notification created: type={}, owner={}, microsite={}", type, ownerId, micrositeId);
    }

    // ── Read ────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String firebaseUid, Pageable pageable) {
        User user = findUser(firebaseUid);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(notificationMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String firebaseUid) {
        User user = findUser(firebaseUid);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Transactional
    public void markAsRead(UUID notificationId, String firebaseUid) {
        User user = findUser(firebaseUid);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("Not your notification");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String firebaseUid) {
        User user = findUser(firebaseUid);
        notificationRepository.markAllAsReadByUserId(user.getId());
        log.info("Marked all notifications as read for user={}", user.getId());
    }

    private User findUser(String firebaseUid) {
        return userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }
}
