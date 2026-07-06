package com.firstpage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import lombok.RequiredArgsConstructor;

/**
 * Web MVC configuration providing backup CORS support.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    private final AppProperties appProperties;

    /**
     * Configures CORS mappings as a backup to the SecurityConfig CORS configuration.
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = appProperties.getCors().getAllowedOrigins()
            .toArray(new String[0]);

        registry.addMapping("/**")
            .allowedOrigins(origins)
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Authorization", "Content-Type")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
