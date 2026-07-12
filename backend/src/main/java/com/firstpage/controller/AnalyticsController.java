package com.firstpage.controller;

import com.firstpage.dto.response.ApiResponse;
import com.firstpage.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST controller for microsite analytics.
 * Provides per-microsite detailed stats and a dashboard-level overview.
 */
@Tag(name = "Analytics", description = "Analytics and insights APIs")
@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/microsites/{micrositeId}")
    @Operation(summary = "Get detailed analytics for a specific microsite")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMicrositeAnalytics(
            Authentication auth,
            @PathVariable UUID micrositeId) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getMicrositeAnalytics(micrositeId, getUid(auth))));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get aggregated analytics for all user microsites")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardAnalytics(
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success(
                analyticsService.getDashboardAnalytics(getUid(auth))));
    }

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
