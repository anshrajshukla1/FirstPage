package com.firstpage.config;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StringUtils;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * Initializes Firebase Admin SDK on application startup.
 * Supports both classpath service account file and environment variable credentials.
 */
@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.service-account-path:firebase-service-account.json}")
    private String serviceAccountPath;

    /**
     * Initializes Firebase on startup. Checks environment variable first,
     * then falls back to classpath resource.
     */
    @PostConstruct
    public void initializeFirebase() {
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized, skipping.");
            return;
        }

        try {
            InputStream serviceAccount = getServiceAccountStream();
            if (serviceAccount == null) {
                log.warn("Firebase service account not found. Firebase authentication will not work. "
                    + "Set FIREBASE_CREDENTIALS_JSON env var or place {} on classpath.", serviceAccountPath);
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase initialized successfully.");

        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage(), e);
        }
    }

    /**
     * Resolves the service account credentials input stream.
     * Priority: FIREBASE_CREDENTIALS_JSON env var > classpath file.
     */
    private InputStream getServiceAccountStream() {
        // Try environment variable first (for deployment)
        String credentialsJson = System.getenv("FIREBASE_CREDENTIALS_JSON");
        if (StringUtils.hasText(credentialsJson)) {
            log.info("Using Firebase credentials from FIREBASE_CREDENTIALS_JSON environment variable.");
            return new ByteArrayInputStream(credentialsJson.getBytes(StandardCharsets.UTF_8));
        }

        // Fall back to classpath resource
        try {
            ClassPathResource resource = new ClassPathResource(serviceAccountPath);
            if (resource.exists()) {
                log.info("Using Firebase credentials from classpath: {}", serviceAccountPath);
                return resource.getInputStream();
            }
        } catch (IOException e) {
            log.debug("Could not load Firebase credentials from classpath: {}", e.getMessage());
        }

        return null;
    }
}
