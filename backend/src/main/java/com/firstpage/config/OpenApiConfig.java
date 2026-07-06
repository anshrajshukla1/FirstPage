package com.firstpage.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * OpenAPI / Swagger UI configuration for API documentation.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Configures OpenAPI specification with application info and Firebase Bearer JWT security scheme.
     */
    @Bean
    public OpenAPI openAPI() {
        var securitySchemeName = "Firebase JWT";

        return new OpenAPI()
            .info(new Info()
                .title("FirstPage API")
                .description("AI-powered personalized microsite generator API")
                .version("1.0.0")
                .contact(new Contact()
                    .name("FirstPage Team")
                    .email("support@firstpage.app"))
                .license(new License()
                    .name("Proprietary")))
            .addSecurityItem(new SecurityRequirement()
                .addList(securitySchemeName))
            .components(new Components()
                .addSecuritySchemes(securitySchemeName,
                    new SecurityScheme()
                        .name(securitySchemeName)
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Firebase ID token obtained from client-side authentication")));
    }
}
