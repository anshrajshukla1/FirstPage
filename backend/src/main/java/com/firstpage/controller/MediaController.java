package com.firstpage.controller;

import com.firstpage.dto.request.ReorderMediaRequest;
import com.firstpage.dto.request.UpdateMediaRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.MediaResponse;
import com.firstpage.entity.enums.MediaType;
import com.firstpage.service.MediaUploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

/**
 * REST controller for managing media (images, videos, audio) attached to a microsite.
 * Supports upload, listing, and deletion with Cloudinary as the backing store.
 */
@Tag(name = "Media", description = "Media upload APIs")
@RestController
@RequestMapping("/api/v1/microsites/{micrositeId}/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaUploadService mediaUploadService;

    // ── Upload ──────────────────────────────────────────────────────────

    @PostMapping(consumes = "multipart/form-data")
    @Operation(summary = "Upload a media file to a microsite, optionally attached to one slide")
    public ResponseEntity<ApiResponse<MediaResponse>> upload(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @Parameter(description = "Media file to upload") @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String caption,
            @RequestParam MediaType type,
            @Parameter(description = "Attach to this slide's gallery; omit for microsite-level media")
            @RequestParam(required = false) UUID slideId) {
        MediaResponse response = mediaUploadService.upload(
                micrositeId, getUid(auth), file, caption, type, slideId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Media uploaded successfully"));
    }

    // ── List ────────────────────────────────────────────────────────────

    @GetMapping
    @Operation(summary = "List all media for a microsite")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> getAll(
            Authentication auth,
            @PathVariable UUID micrositeId) {
        List<MediaResponse> media = mediaUploadService.getMediaByMicrosite(
                micrositeId, getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(media));
    }

    // ── Update ──────────────────────────────────────────────────────────

    @PatchMapping("/{mediaId}")
    @Operation(summary = "Edit a media item's caption")
    public ResponseEntity<ApiResponse<MediaResponse>> updateCaption(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @PathVariable UUID mediaId,
            @Valid @RequestBody UpdateMediaRequest request) {
        MediaResponse response = mediaUploadService.updateCaption(
                micrositeId, mediaId, getUid(auth), request.caption());
        return ResponseEntity.ok(ApiResponse.success(response, "Caption updated"));
    }

    // ── Reorder ─────────────────────────────────────────────────────────

    @PostMapping("/reorder")
    @Operation(summary = "Reorder media within a gallery")
    public ResponseEntity<ApiResponse<List<MediaResponse>>> reorder(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @Valid @RequestBody ReorderMediaRequest request) {
        List<MediaResponse> media = mediaUploadService.reorder(
                micrositeId, getUid(auth), request.mediaIds());
        return ResponseEntity.ok(ApiResponse.success(media, "Media reordered"));
    }

    // ── Delete ──────────────────────────────────────────────────────────

    @DeleteMapping("/{mediaId}")
    @Operation(summary = "Delete a media item (removes from Cloudinary and database)")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth,
            @PathVariable UUID micrositeId,
            @PathVariable UUID mediaId) {
        mediaUploadService.deleteMedia(micrositeId, mediaId, getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(null, "Media deleted successfully"));
    }

    // ── Helpers ─────────────────────────────────────────────────────────

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
