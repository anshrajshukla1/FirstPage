package com.firstpage.controller;

import com.firstpage.dto.request.CreateMicrositeRequest;
import com.firstpage.dto.request.UpdateMicrositeRequest;
import com.firstpage.dto.response.ApiResponse;
import com.firstpage.dto.response.MicrositeListResponse;
import com.firstpage.dto.response.MicrositeResponse;
import com.firstpage.entity.enums.MicrositeStatus;
import com.firstpage.service.MicrositeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * REST controller for microsite CRUD operations.
 * All endpoints (except public access) require Firebase authentication.
 */
@Tag(name = "Microsites", description = "Microsite management APIs")
@RestController
@RequestMapping("/api/v1/microsites")
@RequiredArgsConstructor
public class MicrositeController {

    private final MicrositeService micrositeService;

    // ── Create ──────────────────────────────────────────────────────────

    @PostMapping
    @Operation(summary = "Create a new microsite")
    public ResponseEntity<ApiResponse<MicrositeResponse>> create(
            Authentication auth,
            @Valid @RequestBody CreateMicrositeRequest request) {
        MicrositeResponse response = micrositeService.create(getUid(auth), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Microsite created successfully"));
    }

    // ── Read ────────────────────────────────────────────────────────────

    @GetMapping("/{id}")
    @Operation(summary = "Get microsite by ID (owner only)")
    public ResponseEntity<ApiResponse<MicrositeResponse>> getById(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(micrositeService.getById(id, getUid(auth))));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my microsites (paginated)")
    public ResponseEntity<ApiResponse<Page<MicrositeListResponse>>> getMyMicrosites(
            Authentication auth,
            @RequestParam(required = false) MicrositeStatus status,
            @PageableDefault(size = 12, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(micrositeService.getMyMicrosites(getUid(auth), status, pageable)));
    }

    @GetMapping("/me/count")
    @Operation(summary = "Count my total microsites")
    public ResponseEntity<ApiResponse<Map<String, Long>>> countMyMicrosites(Authentication auth) {
        long count = micrositeService.countMyMicrosites(getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(Map.of("total", count)));
    }

    // ── Update ──────────────────────────────────────────────────────────

    @PutMapping("/{id}")
    @Operation(summary = "Update a microsite")
    public ResponseEntity<ApiResponse<MicrositeResponse>> update(
            Authentication auth,
            @PathVariable UUID id,
            @RequestBody UpdateMicrositeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                micrositeService.update(id, getUid(auth), request),
                "Microsite updated successfully"));
    }

    // ── Delete ──────────────────────────────────────────────────────────

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a microsite")
    public ResponseEntity<ApiResponse<Void>> delete(
            Authentication auth,
            @PathVariable UUID id) {
        micrositeService.delete(id, getUid(auth));
        return ResponseEntity.ok(ApiResponse.success(null, "Microsite deleted successfully"));
    }

    // ── Lifecycle ───────────────────────────────────────────────────────

    @PostMapping("/{id}/publish")
    @Operation(summary = "Publish a microsite (makes it live)")
    public ResponseEntity<ApiResponse<MicrositeResponse>> publish(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                micrositeService.publish(id, getUid(auth)),
                "Microsite published successfully"));
    }

    @PostMapping("/{id}/unpublish")
    @Operation(summary = "Unpublish a microsite (back to draft)")
    public ResponseEntity<ApiResponse<MicrositeResponse>> unpublish(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                micrositeService.unpublish(id, getUid(auth)),
                "Microsite unpublished"));
    }

    @PostMapping("/{id}/schedule")
    @Operation(summary = "Schedule a microsite for future publishing")
    public ResponseEntity<ApiResponse<MicrositeResponse>> schedule(
            Authentication auth,
            @PathVariable UUID id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledAt) {
        return ResponseEntity.ok(ApiResponse.success(
                micrositeService.schedule(id, getUid(auth), scheduledAt),
                "Microsite scheduled"));
    }

    @PostMapping("/{id}/archive")
    @Operation(summary = "Archive a microsite")
    public ResponseEntity<ApiResponse<MicrositeResponse>> archive(
            Authentication auth,
            @PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                micrositeService.archive(id, getUid(auth)),
                "Microsite archived"));
    }

    // ── Helpers ──────────────────────────────────────────────────────────

    private String getUid(Authentication auth) {
        return auth.getPrincipal().toString();
    }
}
