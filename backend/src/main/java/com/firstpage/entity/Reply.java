package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import lombok.Builder;

/**
 * Represents a reply from a visitor to the microsite creator.
 * Allows the recipient to respond ("Let's meet!" / "Thank you!") 
 * without public embarrassment — replies are private to the creator.
 */
@Entity
@Table(name = "replies", indexes = {
        @Index(name = "idx_replies_microsite_id", columnList = "microsite_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Reply extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microsite_id", nullable = false)
    private Microsite microsite;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "visitor_session_id")
    private String visitorSessionId;

    @Column(name = "is_read")
    @Builder.Default
    private boolean isRead = false;
}
