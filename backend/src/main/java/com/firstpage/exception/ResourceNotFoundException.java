package com.firstpage.exception;

/**
 * Thrown when a requested resource cannot be found.
 * Results in a 404 Not Found response.
 */
public class ResourceNotFoundException extends RuntimeException {

    private final String resource;
    private final Object identifier;

    /**
     * Creates a new ResourceNotFoundException.
     *
     * @param resource the type of resource that was not found
     * @param id       the identifier used to look up the resource
     */
    public ResourceNotFoundException(String resource, Object id) {
        super("%s not found with identifier: %s".formatted(resource, id));
        this.resource = resource;
        this.identifier = id;
    }

    public String getResource() {
        return resource;
    }

    public Object getIdentifier() {
        return identifier;
    }
}
