package com.firstpage.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.firstpage.config.AppProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * AI chat strategy using Google Gemini REST API.
 * Uses the generativelanguage.googleapis.com endpoint with an API key.
 * This avoids the heavyweight Spring AI Vertex dependency.
 */
@Slf4j
@Service("gemini")
public class GeminiService implements AIChatStrategy {

    private static final String GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private final String apiKey;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public GeminiService(AppProperties appProperties, ObjectMapper objectMapper) {
        this.apiKey = appProperties.getAi().getGeminiApiKey();
        this.restTemplate = new RestTemplate();
        this.objectMapper = objectMapper;
    }

    @Override
    public String generate(String systemPrompt, String userPrompt) {
        log.debug("Generating content with Gemini. System prompt length: {}, User prompt length: {}",
                systemPrompt.length(), userPrompt.length());

        try {
            String url = GEMINI_API_URL + "?key=" + apiKey;

            // Build request body per Gemini API spec
            Map<String, Object> requestBody = Map.of(
                    "system_instruction", Map.of(
                            "parts", List.of(Map.of("text", systemPrompt))
                    ),
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", userPrompt)))
                    ),
                    "generationConfig", Map.of(
                            "temperature", 0.7,
                            "maxOutputTokens", 4096
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

            // Parse the response
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                String content = candidates.get(0).path("content").path("parts").get(0).path("text").asText();
                log.debug("Gemini response received. Length: {}", content.length());
                return content;
            }

            log.warn("Gemini returned no candidates");
            return "";

        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Gemini content generation failed: " + e.getMessage(), e);
        }
    }

    @Override
    public String getProviderName() {
        return "gemini";
    }
}
