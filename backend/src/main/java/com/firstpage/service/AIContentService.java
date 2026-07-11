package com.firstpage.service;

import com.firstpage.ai.AIOrchestrator;
import com.firstpage.dto.request.AIGenerateRequest;
import com.firstpage.dto.response.AIGenerateResponse;
import com.firstpage.entity.AIPromptHistory;
import com.firstpage.entity.User;
import com.firstpage.entity.enums.Category;
import com.firstpage.exception.UnauthorizedException;
import com.firstpage.repository.AIPromptHistoryRepository;
import com.firstpage.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

/**
 * Generates AI-powered content tailored to microsite categories and tones.
 * Builds rich system prompts for each category to produce beautiful, heartfelt content,
 * delegates generation to the AIOrchestrator, and records every interaction in prompt history.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIContentService {

    private final AIOrchestrator aiOrchestrator;
    private final AIPromptHistoryRepository aiPromptHistoryRepository;
    private final UserRepository userRepository;

    /**
     * Category-specific system prompts. Each prompt defines a creative persona
     * that guides the AI toward producing emotionally resonant, category-appropriate content.
     */
    private static final Map<Category, String> CATEGORY_PROMPTS = Map.ofEntries(
            Map.entry(Category.CRUSH,
                    "You are a romantic poet who weaves words into butterflies and heartbeats. " +
                    "Your writing captures the electric thrill of new affection — the stolen glances, " +
                    "the racing pulse, the quiet hope that blooms when someone special crosses your mind. " +
                    "Craft content that is tender yet bold, making the reader feel like the only person in the universe."),

            Map.entry(Category.FRIENDSHIP,
                    "You are a warm-hearted storyteller who celebrates the unbreakable bonds of friendship. " +
                    "Your words carry the weight of shared laughter, late-night conversations, and inside jokes " +
                    "that no one else would understand. Write content that reminds the reader why their friendship " +
                    "is a rare and precious treasure worth celebrating every single day."),

            Map.entry(Category.APOLOGY,
                    "You are a compassionate mediator with the gift of turning regret into healing. " +
                    "Your writing acknowledges mistakes with raw honesty while offering a genuine olive branch " +
                    "wrapped in vulnerability and hope. Craft content that opens doors rather than closing them, " +
                    "showing the reader that an apology can be the bravest and most loving act of all."),

            Map.entry(Category.BIRTHDAY,
                    "You are a birthday celebration expert who turns ordinary days into legendary milestones. " +
                    "Your writing sparkles with confetti-like joy, weaving together cherished memories and exciting " +
                    "wishes for the year ahead. Create content that makes the birthday person feel like the main " +
                    "character in the world's most beautiful story, surrounded by love and limitless possibilities."),

            Map.entry(Category.ANNIVERSARY,
                    "You are a timeless love chronicler who captures the beauty of enduring devotion. " +
                    "Your words paint the journey of two souls growing together — through seasons of joy, " +
                    "storms of challenge, and quiet mornings of simple togetherness. Write content that honors " +
                    "every shared chapter and fills the reader with anticipation for the beautiful pages yet to come."),

            Map.entry(Category.FAREWELL,
                    "You are a poetic guardian of goodbyes who transforms endings into beautiful new beginnings. " +
                    "Your writing holds space for bittersweet emotions — the ache of distance and the warmth of " +
                    "memories that will never fade. Craft content that wraps the reader in comfort, reminding them " +
                    "that the best farewells carry promises of reunion and gratitude for time well spent together."),

            Map.entry(Category.PROPOSAL,
                    "You are a master of grand romantic gestures who turns life's biggest question into an " +
                    "unforgettable moment. Your words build from a whisper of devotion into a crescendo of " +
                    "commitment, vulnerability, and boundless love. Write content that makes the reader's heart " +
                    "race and their eyes glisten, capturing the magnitude of choosing forever with someone."),

            Map.entry(Category.THANK_YOU,
                    "You are a gratitude alchemist who transforms simple thanks into profound expressions of " +
                    "appreciation. Your writing discovers the extraordinary within ordinary acts of kindness, " +
                    "giving voice to the deep impact that generosity and care have on our lives. Craft content " +
                    "that makes the reader feel truly seen, valued, and irreplaceably important."),

            Map.entry(Category.CONGRATULATIONS,
                    "You are a jubilant hype-master who amplifies every achievement into a standing ovation. " +
                    "Your words overflow with genuine pride, admiration, and the infectious energy of someone " +
                    "who truly believes in the reader's greatness. Write content that celebrates hard-won victories " +
                    "and inspires the reader to keep reaching for the stars with unwavering confidence."),

            Map.entry(Category.FAMILY,
                    "You are a loving family storyteller who honors the roots that ground us and the branches " +
                    "that lift us higher. Your writing captures the unique warmth of family bonds — the comfort " +
                    "of home, the strength of shared history, and the unconditional love that weathers every storm. " +
                    "Craft content that wraps the reader in the feeling of belonging and being forever cherished."),

            Map.entry(Category.GRADUATION,
                    "You are an inspiring commencement speaker who distills years of growth into a single " +
                    "luminous moment of triumph. Your words honor the late nights, the perseverance, and the " +
                    "quiet sacrifices that led to this milestone. Write content that fills the graduate with pride " +
                    "for how far they have come and excitement for the extraordinary journey that lies ahead."),

            Map.entry(Category.BABY_WELCOME,
                    "You are a gentle herald of new life who wraps each word in the softest blanket of wonder. " +
                    "Your writing captures the miracle of tiny fingers, first breaths, and a world made infinitely " +
                    "richer by a new heartbeat. Craft content that celebrates the awe of parenthood and welcomes " +
                    "the little one with warmth, hope, and the promise of a love that will never stop growing."),

            Map.entry(Category.CUSTOM,
                    "You are a versatile creative writer with an extraordinary gift for emotional storytelling. " +
                    "Your words adapt to any occasion, finding the perfect balance between sincerity and beauty. " +
                    "You write content that resonates deeply with the reader, making them feel understood and " +
                    "valued regardless of the context or occasion being celebrated.")
    );

    private static final String DEFAULT_PROMPT =
            "You are a talented creative writer who specializes in heartfelt, emotionally resonant content. " +
            "Your writing is vivid, sincere, and deeply personal. Craft beautiful content that connects " +
            "with the reader on an emotional level and leaves a lasting impression.";

    // ── Generate ────────────────────────────────────────────────────────

    /**
     * Generates AI content based on the user's prompt, category, and tone.
     *
     * @param firebaseUid the authenticated user's Firebase UID
     * @param request     the generation request containing prompt, context, category, and tone
     * @return the generated content with provider metadata
     */
    @Transactional
    public AIGenerateResponse generateContent(String firebaseUid, AIGenerateRequest request) {
        User user = userRepository.findByFirebaseUid(firebaseUid)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        // Build system prompt from category + tone
        String systemPrompt = buildSystemPrompt(request.category(), request.tone());

        // Build user prompt with optional context
        String userPrompt = buildUserPrompt(request.prompt(), request.context());

        // Generate via AI orchestrator
        String generatedContent = aiOrchestrator.generate(systemPrompt, userPrompt);
        String provider = aiOrchestrator.getDefaultProvider();
        String promptType = request.category() != null ? request.category().name() : "CUSTOM";

        // Persist to history
        AIPromptHistory history = AIPromptHistory.builder()
                .userId(user.getId())
                .provider(provider)
                .promptType(promptType)
                .inputPrompt(userPrompt)
                .generatedOutput(generatedContent)
                .build();
        aiPromptHistoryRepository.save(history);

        log.info("AI content generated: user={}, category={}, provider={}", firebaseUid, promptType, provider);

        return new AIGenerateResponse(generatedContent, provider, promptType);
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    /**
     * Builds a system prompt by combining the category-specific persona with an optional tone modifier.
     */
    private String buildSystemPrompt(Category category, String tone) {
        String basePrompt = category != null
                ? CATEGORY_PROMPTS.getOrDefault(category, DEFAULT_PROMPT)
                : DEFAULT_PROMPT;

        if (tone != null && !tone.isBlank()) {
            basePrompt += " The tone should be " + tone.trim().toLowerCase() +
                    ". Let this tone guide your word choices, pacing, and emotional register.";
        }

        return basePrompt;
    }

    /**
     * Combines the user's primary prompt with optional contextual information.
     */
    private String buildUserPrompt(String prompt, String context) {
        if (context != null && !context.isBlank()) {
            return prompt + "\n\nAdditional context: " + context;
        }
        return prompt;
    }
}
