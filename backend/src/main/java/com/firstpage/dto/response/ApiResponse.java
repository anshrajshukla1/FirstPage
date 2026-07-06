package com.firstpage.dto.response;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Generic API response wrapper providing consistent response structure.
 *
 * @param success   whether the operation was successful
 * @param message   optional human-readable message
 * @param data      the response payload
 * @param timestamp when the response was generated
 * @param <T>       the type of the response payload
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
    boolean success,
    String message,
    T data,
    LocalDateTime timestamp
) {

    /**
     * Creates a successful response with data.
     *
     * @param data the response payload
     * @param <T>  payload type
     * @return a success response
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, null, data, LocalDateTime.now());
    }

    /**
     * Creates a successful response with data and a message.
     *
     * @param data    the response payload
     * @param message a human-readable success message
     * @param <T>     payload type
     * @return a success response with message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<>(true, message, data, LocalDateTime.now());
    }

    /**
     * Creates an error response with a message.
     *
     * @param message a human-readable error message
     * @param <T>     payload type
     * @return an error response
     */
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, LocalDateTime.now());
    }
}
