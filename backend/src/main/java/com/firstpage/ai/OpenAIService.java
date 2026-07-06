package com.firstpage.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * AI chat strategy using OpenAI REST API.
 * Only activates when an OpenAI API key is configured.
 */
@Slf4j
@Service("openai")
@ConditionalOnProperty(name = "spring.ai.openai.api-key", matchIfMissing = false)
public class OpenAIService implements AIChatStrategy {

    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    @Value("${spring.ai.openai.api-key:}")
    private String apiKey;

    @Value("${spring.ai.openai.chat.options.model:gpt-4o-mini}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper;

    public OpenAIService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        log.debug("Generating content with OpenAI. Model: {}", model);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "temperature", 0.7,
                    "max_tokens", 4096
            );

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(OPENAI_API_URL, HttpMethod.POST, request, String.class);

            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode choices = root.path("choices");
            if (choices.isArray() && !choices.isEmpty()) {
                String content = choices.get(0).path("message").path("content").asText();
                log.debug("OpenAI response received. Length: {}", content.length());
                return content;
            }

            log.warn("OpenAI returned no choices");
            return "";

        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("OpenAI content generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "openai";
    }
}
