package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

/**
 * Represents a visual theme that can be applied to a microsite.
 * Themes define the look and feel (colors, fonts, backgrounds) via
 * CSS variables stored as JSON. Includes 12 built-in themes seeded
 * via Flyway migration, plus support for premium themes.
 */
@Entity
@Table(name = "themes", indexes = {
        @Index(name = "idx_themes_slug", columnList = "slug", unique = true),
        @Index(name = "idx_themes_category", columnList = "category")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Theme extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;

    private String category;

    /** JSON object storing CSS variables for this theme. */
    @Column(name = "css_variables", columnDefinition = "TEXT")
    private String cssVariables;

    @Column(name = "preview_image_url")
    private String previewImageUrl;

    @Column(name = "is_premium")
    @Builder.Default
    private boolean isPremium = false;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;
}
