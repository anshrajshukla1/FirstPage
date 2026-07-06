package com.firstpage.ai;

/**
 * Strategy interface for AI chat providers.
 * Each implementation wraps a specific AI provider (OpenAI, Gemini, etc.).
 */
public interface AIChatStrategy {

    /**
     * Generates text content using the AI provider.
     *
     * @param systemPrompt the system-level instructions for the AI
     * @param userPrompt   the user's input prompt
     * @return the generated text content
     */
    String generate(String systemPrompt, String userPrompt);

    /**
     * Returns the provider name for this strategy.
     *
     * @return the provider name (e.g., "openai", "gemini")
     */
    String getProviderName();
}
