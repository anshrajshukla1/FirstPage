package com.firstpage.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.time.LocalDateTime;

/**
 * Health check endpoint for external monitoring services.
 */
@RestController
public class HealthController {

    private final LocalDateTime startedAt = LocalDateTime.now();

    @GetMapping({"/api/v1/health", "/health"})
    public ResponseEntity<Map<String, Object>> healthCheck() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "FirstPage API",
            "timestamp", LocalDateTime.now(),
            "startedAt", startedAt
        ));
    }
}
