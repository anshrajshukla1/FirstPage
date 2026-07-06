package com.firstpage.controller;

import com.firstpage.dto.request.CreateSlideRequest;
import com.firstpage.dto.request.ReorderSlidesRequest;
import com.firstpage.dto.request.UpdateSlideRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.SlideResponse;
import com.firstpage.service.SlideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for slide management within a microsite.
 * All endpoints are nested under /api/v1/microsites/{micrositeId}/slides.
 */
@Tag(name = "Slides", description = "Slide management APIs")
@RestController
@RequestMapping("/api/v1/microsites/{micrositeId}/slides")
@RequiredArgsConstructor
public class SlideController {

    private final SlideService slideService;

    @PostMapping
    @Operation(summary = "Add a slide to a microsite")
    public ResponseEntity<ApiResponse<SlideResponse>> create(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @Valid @RequestBody CreateSlideRequest request) {
        SlideResponse response = slideService.create(micrositeId, getUid(auth), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Slide added successfully"));
    }

    @GetMapping
    @Operation(summary = "Get all slides for a microsite")
    public ResponseEntity<ApiResponse<List<SlideResponse>>> getAll(
            Authentication auth,
            @PathVariable UUID micrositeId) {
        return ResponseEntity.ok(ApiResponse.success(slideService.getSlides(micrositeId, getUid(auth))));
    }

    @GetMapping("/{slideId}")
    @Operation(summary = "Get a specific slide")
    public ResponseEntity<ApiResponse<SlideResponse>> getById(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @PathVariable UUID slideId) {
        return ResponseEntity.ok(ApiResponse.success(slideService.getById(micrositeId, slideId, getUid(auth))));
    }

    @PutMapping("/{slideId}")
    @Operation(summary = "Update a slide")
    public ResponseEntity<ApiResponse<SlideResponse>> update(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @PathVariable UUID slideId,
            @RequestBody UpdateSlideRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                slideService.update(micrositeId, slideId, getUid(auth), request),
                "Slide updated successfully"));
    }

    @DeleteMapping("/{slideId}")
    @Operation(summary = "Delete a slide")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @PathVariable UUID slideId) {
        slideService.delete(micrositeId, slideId, getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(null, "Slide deleted successfully"));
    }

    @PostMapping("/reorder")
    @Operation(summary = "Reorder slides via drag-and-drop")
    public ResponseEntity<ApiResponse<List<SlideResponse>>> reorder(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @Valid @RequestBody ReorderSlidesRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                slideService.reorder(micrositeId, getUid(auth), request),
                "Slides reordered successfully"));
    }

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
