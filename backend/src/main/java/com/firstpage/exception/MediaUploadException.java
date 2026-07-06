package com.firstpage.exception;

/**
 * Thrown when a media upload operation fails.
 * Results in a 500 Internal Server Error response.
 */
public class MediaUploadException extends RuntimeException {

    /**
     * Creates a new MediaUploadException.
     *
     * @param message the error message
     */
    public MediaUploadException(String message) {
        super(message);
    }

    /**
     * Creates a new MediaUploadException with a cause.
     *
     * @param message the error message
     * @param cause   the underlying cause
     */
    public MediaUploadException(String message, Throwable cause) {
        super(message, cause);
    }
}
