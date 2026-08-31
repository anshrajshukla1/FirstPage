package com.firstpage.config;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;

import lombok.extern.slf4j.Slf4j;

/**
 * Configures the Cloudinary client for media uploads.
 */
@Slf4j
@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    /**
     * Creates a Cloudinary instance configured with cloud credentials.
     *
     * <p>Missing credentials are tolerated at startup — the app still boots so
     * every non-media feature keeps working — but uploads will fail, so we warn
     * loudly instead of failing silently at the first upload attempt.
     */
    @Bean
    public Cloudinary cloudinary() {
        if (isBlank(cloudName) || isBlank(apiKey) || isBlank(apiSecret)) {
            log.warn("Cloudinary credentials are not configured "
                    + "(CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET). "
                    + "Media uploads will fail until these are set.");
        }

        return new Cloudinary(Map.of(
            "cloud_name", cloudName,
            "api_key", apiKey,
            "api_secret", apiSecret,
            "secure", true
        ));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
