package com.firstpage.exception;

import java.net.URI;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;

/**
 * Global exception handler providing consistent RFC 7807 ProblemDetail error responses.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    /**
     * Handles resource not found exceptions with 404 status.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Resource Not Found");
        problem.setType(URI.create("https://firstpage.app/errors/not-found"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("resource", ex.getResource());
        return problem;
    }

    /**
     * Handles business rule violations with 422 status.
     */
    @ExceptionHandler(BusinessException.class)
    public ProblemDetail handleBusinessException(BusinessException ex) {
        log.warn("Business rule violation: {}", ex.getMessage());
        var problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage());
        problem.setTitle("Business Rule Violation");
        problem.setType(URI.create("https://firstpage.app/errors/business-error"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("errorCode", ex.getErrorCode());
        return problem;
    }

    /**
     * Handles unauthorized access with 401 status.
     */
    @ExceptionHandler(UnauthorizedException.class)
    public ProblemDetail handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized access: {}", ex.getMessage());
        var problem = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, ex.getMessage());
        problem.setTitle("Unauthorized");
        problem.setType(URI.create("https://firstpage.app/errors/unauthorized"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    /**
     * Handles media upload failures with 500 status.
     */
    @ExceptionHandler(MediaUploadException.class)
    public ProblemDetail handleMediaUploadException(MediaUploadException ex) {
        log.error("Media upload failed: {}", ex.getMessage(), ex);
        var problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage());
        problem.setTitle("Media Upload Failed");
        problem.setType(URI.create("https://firstpage.app/errors/media-upload"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }

    /**
     * Handles bean validation failures with 400 status and field-level error details.
     */
    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        log.warn("Validation failed: {}", ex.getMessage());

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                error -> error.getDefaultMessage() != null ? error.getDefaultMessage() : "Invalid value",
                (first, second) -> first
            ));

        var problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Validation failed for one or more fields.");
        problem.setTitle("Validation Error");
        problem.setType(URI.create("https://firstpage.app/errors/validation"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("fieldErrors", fieldErrors);

        return ResponseEntity.badRequest().body(problem);
    }

    /**
     * Handles constraint violation exceptions with 400 status.
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ProblemDetail handleConstraintViolationException(ConstraintViolationException ex) {
        log.warn("Constraint violation: {}", ex.getMessage());

        Map<String, String> violations = ex.getConstraintViolations().stream()
            .collect(Collectors.toMap(
                v -> v.getPropertyPath().toString(),
                v -> v.getMessage(),
                (first, second) -> first
            ));

        var problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.BAD_REQUEST, "Constraint validation failed.");
        problem.setTitle("Constraint Violation");
        problem.setType(URI.create("https://firstpage.app/errors/constraint-violation"));
        problem.setProperty("timestamp", Instant.now());
        problem.setProperty("violations", violations);
        return problem;
    }

    /**
     * Catch-all handler for unexpected exceptions with 500 status.
     */
    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGenericException(Exception ex) {
        log.error("Unexpected error occurred: {}", ex.getMessage(), ex);
        var problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred. Please try again later.");
        problem.setTitle("Internal Server Error");
        problem.setType(URI.create("https://firstpage.app/errors/internal"));
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}
