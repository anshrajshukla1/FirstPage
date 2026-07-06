package com.firstpage.controller;

import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.ThemeResponse;
import com.firstpage.service.ThemeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Public REST controller for browsing themes.
 * No authentication required — themes are publicly accessible.
 */
@Tag(name = "Themes", description = "Theme browsing APIs")
@RestController
@RequestMapping("/api/v1/public/themes")
@RequiredArgsConstructor
public class ThemeController {

    private final ThemeService themeService;

    @GetMapping
    @Operation(summary = "Get all active themes")
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(themeService.getActiveThemes()));
    }

    @GetMapping("/free")
    @Operation(summary = "Get free (non-premium) themes")
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getFree() {
        return ResponseEntity.ok(ApiResponse.success(themeService.getFreeThemes()));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get themes by category")
    public ResponseEntity<ApiResponse<List<ThemeResponse>>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(ApiResponse.success(themeService.getThemesByCategory(category)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get theme by ID")
    public ResponseEntity<ApiResponse<ThemeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(themeService.getById(id)));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get theme by slug")
    public ResponseEntity<ApiResponse<ThemeResponse>> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.success(themeService.getBySlug(slug)));
    }
}
