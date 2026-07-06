package com.firstpage.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Type-safe application properties bound from application.yml under the "app" prefix.
 */
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Ai ai = new Ai();
    private Cors cors = new Cors();
    private Media media = new Media();

    public Ai getAi() {
        return ai;
    }

    public void setAi(Ai ai) {
        this.ai = ai;
    }

    public Cors getCors() {
        return cors;
    }

    public void setCors(Cors cors) {
        this.cors = cors;
    }

    public Media getMedia() {
        return media;
    }

    public void setMedia(Media media) {
        this.media = media;
    }

    /**
     * AI-related configuration properties.
     */
    public static class Ai {
        private String defaultProvider = "gemini";
        private String geminiApiKey = "";

        public String getDefaultProvider() {
            return defaultProvider;
        }

        public void setDefaultProvider(String defaultProvider) {
            this.defaultProvider = defaultProvider;
        }

        public String getGeminiApiKey() {
            return geminiApiKey;
        }

        public void setGeminiApiKey(String geminiApiKey) {
            this.geminiApiKey = geminiApiKey;
        }
    }

    /**
     * CORS configuration properties.
     */
    public static class Cors {
        private List<String> allowedOrigins = List.of("http://localhost:3000", "http://localhost:5173");

        public List<String> getAllowedOrigins() {
            return allowedOrigins;
        }

        public void setAllowedOrigins(List<String> allowedOrigins) {
            this.allowedOrigins = allowedOrigins;
        }
    }

    /**
     * Media upload size limits in bytes.
     */
    public static class Media {
        private long maxImageSize = 10_485_760L;  // 10 MB
        private long maxVideoSize = 52_428_800L;  // 50 MB

        public long getMaxImageSize() {
            return maxImageSize;
        }

        public void setMaxImageSize(long maxImageSize) {
            this.maxImageSize = maxImageSize;
        }

        public long getMaxVideoSize() {
            return maxVideoSize;
        }

        public void setMaxVideoSize(long maxVideoSize) {
            this.maxVideoSize = maxVideoSize;
        }
    }
}
