package com.firstpage.exception;

/**
 * Thrown when a business rule is violated.
 * Results in a 422 Unprocessable Entity response.
 */
public class BusinessException extends RuntimeException {

    private final String errorCode;

    /**
     * Creates a new BusinessException with an error code.
     *
     * @param message   human-readable error message
     * @param errorCode machine-readable error code
     */
    public BusinessException(String message, String errorCode) {
        super(message);
        this.errorCode = errorCode;
    }

    /**
     * Creates a new BusinessException without an error code.
     *
     * @param message human-readable error message
     */
    public BusinessException(String message) {
        super(message);
        this.errorCode = "BUSINESS_ERROR";
    }

    public String getErrorCode() {
        return errorCode;
    }
}
