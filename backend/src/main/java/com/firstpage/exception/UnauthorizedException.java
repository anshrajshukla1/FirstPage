package com.firstpage.exception;

/**
 * Thrown when an authentication or authorization check fails.
 * Results in a 401 Unauthorized response.
 */
public class UnauthorizedException extends RuntimeException {

    /**
     * Creates a new UnauthorizedException.
     *
     * @param message the error message
     */
    public UnauthorizedException(String message) {
        super(message);
    }

    /**
     * Creates a new UnauthorizedException with default message.
     */
    public UnauthorizedException() {
        super("You are not authorized to perform this action.");
    }
}
