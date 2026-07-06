package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.MediaType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents an uploaded media file (image, video, audio, voice note)
 * associated with a microsite and optionally with a specific slide.
 * Stores the Cloudinary URL and public ID for management.
 */
@Entity
@Table(name = "media", indexes = {
        @Index(name = "idx_media_microsite_id", columnList = "microsite_id"),
        @Index(name = "idx_media_slide_id", columnList = "slide_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Media extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microsite_id", nullable = false)
    private Microsite microsite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "slide_id")
    private Slide slide;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MediaType type;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id")
    private String publicId;

    private String caption;

    @Column(name = "order_index")
    @Builder.Default
    private int orderIndex = 0;

    @Column(name = "file_size")
    private Long fileSize;
}
