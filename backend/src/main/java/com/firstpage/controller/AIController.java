package com.firstpage.controller;

import com.firstpage.dto.request.AIGenerateRequest;
import com.firstpage.dto.response.AIGenerateResponse;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.service.AIContentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for AI-powered content generation.
 * Accepts a prompt with optional category and tone, generates heartfelt content,
 * and persists the interaction to prompt history.
 */
@Tag(name = "AI", description = "AI content generation")
@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AIController {

    private final AIContentService aiContentService;

    @PostMapping("/generate")
    @Operation(summary = "Generate AI-powered content for a microsite")
    public ResponseEntity<ApiResponse<AIGenerateResponse>> generate(
            Authentication auth,
            @Valid @RequestBody AIGenerateRequest request) {
        AIGenerateResponse response = aiContentService.generateContent(getUid(auth), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Content generated successfully"));
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
