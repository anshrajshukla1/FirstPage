package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import com.firstpage.entity.enums.ReactionType;
import jakarta.persistence.*;
import lombok.*;

/**
 * Represents a visitor reaction to a microsite (heart, cry, laugh, etc.).
 * Reactions are anonymous — identified only by a visitor session ID.
 */
@Entity
@Table(name = "reactions", indexes = {
        @Index(name = "idx_reactions_microsite_id", columnList = "microsite_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "microsite_id", nullable = false)
    private Microsite microsite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReactionType type;

    @Column(name = "visitor_session_id")
    private String visitorSessionId;
}
