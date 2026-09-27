package com.cfs.BMS.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * TMDB (The Movie Database) integration config.
 *
 * Set your free API key via env var TMDB_API_KEY or property tmdb.api-key.
 * When no key is present, TMDB features are simply skipped and the app keeps
 * using its seeded movie data.
 */
@Configuration
public class TmdbConfig {

    @Bean
    public RestTemplate tmdbRestTemplate() {
        RestTemplate rt = new RestTemplate();
        rt.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("Accept", "application/json");
            return execution.execute(request, body);
        });
        return rt;
    }

    @Bean
    @ConfigurationProperties(prefix = "tmdb")
    public TmdbProperties tmdbProperties() {
        return new TmdbProperties();
    }

    public static class TmdbProperties {
        /** TMDB v3 API key (from env TMDB_API_KEY / property tmdb.api-key). */
        private String apiKey = "";
        /** Base API url. */
        private String baseUrl = "https://api.themoviedb.org/3";
        /** Base image url (poster paths are appended). */
        private String imageBaseUrl = "https://image.tmdb.org/t/p/original";
        /** Auto-sync movies from TMDB on startup when a key is present. */
        private boolean syncOnStartup = true;
        /** How many list pages to pull (20 movies per page). */
        private int pages = 2;
        /** Optional read timeout. */
        private Duration timeout = Duration.ofSeconds(10);

        public boolean isConfigured() {
            return apiKey != null && !apiKey.isBlank();
        }

        public String getApiKey() { return apiKey; }
        public void setApiKey(String apiKey) { this.apiKey = apiKey; }
        public String getBaseUrl() { return baseUrl; }
        public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }
        public String getImageBaseUrl() { return imageBaseUrl; }
        public void setImageBaseUrl(String imageBaseUrl) { this.imageBaseUrl = imageBaseUrl; }
        public boolean isSyncOnStartup() { return syncOnStartup; }
        public void setSyncOnStartup(boolean syncOnStartup) { this.syncOnStartup = syncOnStartup; }
        public int getPages() { return pages; }
        public void setPages(int pages) { this.pages = pages; }
        public Duration getTimeout() { return timeout; }
        public void setTimeout(Duration timeout) { this.timeout = timeout; }
    }
}
