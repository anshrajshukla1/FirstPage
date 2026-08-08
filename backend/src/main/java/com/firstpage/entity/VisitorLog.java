package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Tracks visitor analytics for a microsite: device info, location,
 * time spent, slide progress, and replay count. Used to build
 * the analytics dashboard for creators.
 */
@Entity
@Table(name = "visitor_logs", indexes = {
        @Index(name = "idx_visitor_logs_microsite_id", columnList = "microsite_id"),
        @Index(name = "idx_visitor_logs_session_id", columnList = "session_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class VisitorLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microsite_id", nullable = false)
    private Microsite microsite;

    @Column(name = "session_id", nullable = false)
    private String sessionId;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    private String country;

    private String device;

    private String browser;

    @Column(name = "current_slide_index")
    @Builder.Default
    private int currentSlideIndex = 0;

    @Column(name = "time_spent_seconds")
    @Builder.Default
    private int timeSpentSeconds = 0;

    @Column(name = "replay_count")
    @Builder.Default
    private int replayCount = 0;

    @Column(name = "visited_at", nullable = false)
    @Builder.Default
    private LocalDateTime visitedAt = LocalDateTime.now();
}
