package com.firstpage.entity;

import com.firstpage.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

/**
 * Tracks AI prompt history — every AI generation request and its output.
 * Useful for: user history, analytics on AI usage, debugging prompt quality,
 * and potential future features like "undo" or "regenerate from history."
 */
@Entity
@Table(name = "ai_prompt_history", indexes = {
        @Index(name = "idx_ai_prompt_history_user_id", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class AIPromptHistory extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "prompt_type", nullable = false, length = 50)
    private String promptType;

    @Column(name = "input_prompt", nullable = false, columnDefinition = "TEXT")
    private String inputPrompt;

    @Column(name = "generated_output", nullable = false, columnDefinition = "TEXT")
    private String generatedOutput;
}
