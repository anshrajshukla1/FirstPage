package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Represents a notification sent to a microsite creator when their
 * microsite is viewed, receives a reaction, or gets a reply.
 * Supports read/unread tracking for the notification bell UI.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notifications_user_id", columnList = "user_id"),
        @Index(name = "idx_notifications_is_read", columnList = "user_id, is_read")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "microsite_id")
    private UUID micrositeId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;
}
