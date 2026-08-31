package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.AnimationType;
import com.firstpage.entity.enums.SlideType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.Builder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Represents a single page/slide within a microsite experience.
 * Each slide has a type (intro, story, photos, countdown, etc.),
 * free prose in {@code content}, structured per-type settings in
 * {@code config}, and an animation type for transitions.
 */
@Entity
@Table(name = "slides", indexes = {
        @Index(name = "idx_slides_microsite_id", columnList = "microsite_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
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

    /** Free prose for the narrative slide types (STORY, CUSTOM). */
    @Column(columnDefinition = "TEXT")
    private String content;

    /**
     * Structured, type-specific settings — a countdown's target instant, a
     * quote's attribution, a proposal's question and button labels, a
     * timeline's entries. The shape is determined by {@link #type} and is
     * validated on the client; the column itself stays schema-free so a new
     * slide type needs no migration.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> config = new LinkedHashMap<>();

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
