package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.Category;
import com.firstpage.entity.enums.MicrositeStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Core entity representing a microsite — the personal page a user creates
 * for someone special. Contains all configuration, metadata, and relationships
 * to slides, media, reactions, and replies.
 */
@Entity
@Table(name = "microsites", indexes = {
        @Index(name = "idx_microsites_user_id", columnList = "userId"),
        @Index(name = "idx_microsites_slug", columnList = "slug", unique = true),
        @Index(name = "idx_microsites_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Microsite extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(name = "recipient_name")
    private String recipientName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MicrositeStatus status = MicrositeStatus.DRAFT;

    @Column(name = "user_id", nullable = false)
    private java.util.UUID userId;

    @Column(name = "theme_id")
    private java.util.UUID themeId;

    @Column(name = "password_hash")
    private String passwordHash;

    @Column(name = "is_anonymous")
    @Builder.Default
    private boolean isAnonymous = false;

    @Column(name = "is_one_time_view")
    @Builder.Default
    private boolean isOneTimeView = false;

    @Column(name = "has_been_viewed")
    @Builder.Default
    private boolean hasBeenViewed = false;

    @Column(name = "music_url")
    private String musicUrl;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // === Relationships ===

    @OneToMany(mappedBy = "microsite", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Slide> slides = new ArrayList<>();

    @OneToMany(mappedBy = "microsite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Media> mediaItems = new ArrayList<>();

    @OneToMany(mappedBy = "microsite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "microsite", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reply> replies = new ArrayList<>();

    // === Helper Methods ===

    /** Publish the microsite and record the timestamp. */
    public void publish() {
        this.status = MicrositeStatus.PUBLISHED;
        this.publishedAt = LocalDateTime.now();
    }

    /** Archive the microsite. */
    public void archive() {
        this.status = MicrositeStatus.ARCHIVED;
    }

    /** Check if this microsite is password-protected. */
    public boolean isPasswordProtected() {
        return this.passwordHash != null && !this.passwordHash.isBlank();
    }

    /** Get the number of slides. */
    public int getSlideCount() {
        return slides != null ? slides.size() : 0;
    }
}
