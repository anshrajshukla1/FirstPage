package com.firstpage.ai;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.firstpage.config.AppProperties;

import lombok.extern.slf4j.Slf4j;

/**
 * Orchestrates AI generation requests across multiple providers.
 * Supports configurable default provider with automatic fallback.
 */
@Slf4j
@Service
public class AIOrchestrator {

    private final Map<String, AIChatStrategy> strategies;
    private final String defaultProvider;

    /**
     * Auto-injects all AIChatStrategy beans keyed by their Spring bean names.
     */
    public AIOrchestrator(List<AIChatStrategy> strategyList, AppProperties appProperties) {
        this.strategies = strategyList.stream()
            .collect(Collectors.toMap(AIChatStrategy::getProviderName, Function.identity()));
        this.defaultProvider = appProperties.getAi().getDefaultProvider();
        log.info("AI Orchestrator initialized with providers: {}, default: {}",
            strategies.keySet(), defaultProvider);
    }

    /**
     * Generates content using the default provider with fallback to other available providers.
     *
     * @param systemPrompt the system prompt
     * @param userPrompt   the user prompt
     * @return the generated content
     * @throws RuntimeException if all providers fail
     */
    public String generate(String systemPrompt, String userPrompt) {
        return generate(defaultProvider, systemPrompt, userPrompt);
    }

    /**
     * Generates content using a specific provider with fallback.
     *
     * @param provider     the preferred AI provider name
     * @param systemPrompt the system prompt
     * @param userPrompt   the user prompt
     * @return the generated content
     * @throws RuntimeException if all providers fail
     */
    public String generate(String provider, String systemPrompt, String userPrompt) {
        AIChatStrategy primaryStrategy = strategies.get(provider);

        if (primaryStrategy != null) {
            try {
                log.debug("Generating content with provider: {}", provider);
                String result = primaryStrategy.generate(systemPrompt, userPrompt);
                log.debug("Successfully generated content with provider: {}", provider);
                return result;
            } catch (Exception e) {
                log.warn("Primary provider '{}' failed: {}. Attempting fallback...",
                    provider, e.getMessage());
            }
        } else {
            log.warn("Requested provider '{}' not found. Attempting fallback...", provider);
        }

        // Fallback to other available providers
        for (Map.Entry<String, AIChatStrategy> entry : strategies.entrySet()) {
            if (!entry.getKey().equals(provider)) {
                try {
                    log.info("Falling back to provider: {}", entry.getKey());
                    String result = entry.getValue().generate(systemPrompt, userPrompt);
                    log.info("Fallback to '{}' succeeded.", entry.getKey());
                    return result;
                } catch (Exception e) {
                    log.warn("Fallback provider '{}' also failed: {}",
                        entry.getKey(), e.getMessage());
                }
            }
        }

        throw new RuntimeException("All AI providers failed to generate content.");
    }

    /**
     * Returns the name of the default AI provider.
     *
     * @return the default provider name
     */
    public String getDefaultProvider() {
        return defaultProvider;
    }

    /**
     * Checks whether a specific provider is available.
     *
     * @param provider the provider name to check
     * @return true if the provider is registered
     */
    public boolean isProviderAvailable(String provider) {
        return strategies.containsKey(provider);
    }
}
