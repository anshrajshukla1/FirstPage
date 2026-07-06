package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a single page/slide within a microsite experience.
 * Each slide has a type (intro, story, photos, countdown, etc.),
 * content stored as JSON, and an animation type for transitions.
 */
@Entity
@Table(name = "slides", indexes = {
        @Index(name = "idx_slides_microsite_id", columnList = "microsite_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Slide extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microsite_id", nullable = false)
    private Microsite microsite;

    @Column(name = "order_index", nullable = false)
    private int orderIndex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SlideType type;

    private String title;

    /** JSON content storing slide-specific data (text, links, config). */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "animation_type")
    @Builder.Default
    private AnimationType animationType = AnimationType.FADE;

    @Column(name = "background_type")
    private String backgroundType;

    @OneToMany(mappedBy = "slide", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Media> mediaItems = new ArrayList<>();
}
