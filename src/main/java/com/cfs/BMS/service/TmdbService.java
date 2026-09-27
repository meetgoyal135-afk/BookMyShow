package com.cfs.BMS.service;

import com.cfs.BMS.config.TmdbConfig.TmdbProperties;
import com.cfs.BMS.entity.Movie;
import com.cfs.BMS.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.time.LocalDate;
import java.util.*;

/**
 * Pulls real movie data from TMDB and upserts it into the local movies table.
 * No-op (returns 0) when no API key is configured, so the app still runs on seed data.
 */
@Service
@RequiredArgsConstructor
public class TmdbService {

    private static final Logger log = LoggerFactory.getLogger(TmdbService.class);

    private final RestTemplate tmdbRestTemplate;
    private final TmdbProperties tmdb;
    private final MovieRepository movieRepository;

    private Map<Integer, String> genreCache;

    /** Language code -> readable name for a nicer UI. */
    private static final Map<String, String> LANG = Map.ofEntries(
            Map.entry("en", "English"), Map.entry("hi", "Hindi"), Map.entry("te", "Telugu"),
            Map.entry("ta", "Tamil"), Map.entry("kn", "Kannada"), Map.entry("ml", "Malayalam"),
            Map.entry("mr", "Marathi"), Map.entry("bn", "Bengali"), Map.entry("ja", "Japanese"),
            Map.entry("ko", "Korean"), Map.entry("fr", "French"), Map.entry("es", "Spanish"),
            Map.entry("de", "German"), Map.entry("zh", "Chinese"), Map.entry("pa", "Punjabi")
    );

    public boolean isConfigured() {
        return tmdb.isConfigured();
    }

    /**
     * Fetch now_playing + popular movies and upsert them. Returns number of movies imported/updated.
     */
    @SuppressWarnings("unchecked")
    public int syncMovies() {
        if (!tmdb.isConfigured()) {
            log.info("TMDB API key not set - skipping sync (using seed data). Set TMDB_API_KEY to enable.");
            return 0;
        }
        loadGenres();
        int count = 0;
        Set<String> seenTitles = new HashSet<>();
        String[] lists = {"movie/now_playing", "movie/popular"};
        for (String list : lists) {
            for (int page = 1; page <= Math.max(1, tmdb.getPages()); page++) {
                Map<String, Object> body = get(list, Map.of("page", String.valueOf(page)));
                if (body == null) continue;
                List<Map<String, Object>> results = (List<Map<String, Object>>) body.getOrDefault("results", List.of());
                for (Map<String, Object> m : results) {
                    String title = str(m.get("title"));
                    if (title == null || title.isBlank() || !seenTitles.add(title.toLowerCase())) continue;
                    try {
                        upsertFromTmdb(m);
                        count++;
                    } catch (Exception e) {
                        log.warn("Skipped movie '{}': {}", title, e.getMessage());
                    }
                }
            }
        }
        log.info("TMDB sync complete: {} movies imported/updated.", count);
        return count;
    }

    private void upsertFromTmdb(Map<String, Object> m) {
        String title = str(m.get("title"));
        Movie movie = movieRepository.findFirstByTitle(title).orElseGet(Movie::new);

        movie.setTitle(title);
        movie.setDescription(str(m.get("overview")));
        movie.setGenre(mapGenres(m.get("genre_ids")));
        movie.setLanguage(LANG.getOrDefault(str(m.get("original_language")), str(m.get("original_language"))));
        movie.setRating(round1(toDouble(m.get("vote_average"))));
        movie.setReleaseDate(parseDate(str(m.get("release_date"))));
        String poster = str(m.get("poster_path"));
        movie.setPosterUrl(poster != null && !poster.isBlank() ? tmdb.getImageBaseUrl() + poster : null);
        // runtime not in list payload; leave a sensible default if new
        if (movie.getDurationMinutes() == null) movie.setDurationMinutes(150);

        movieRepository.save(movie);
    }

    @SuppressWarnings("unchecked")
    private void loadGenres() {
        if (genreCache != null) return;
        genreCache = new HashMap<>();
        Map<String, Object> body = get("genre/movie/list", Map.of());
        if (body == null) return;
        List<Map<String, Object>> genres = (List<Map<String, Object>>) body.getOrDefault("genres", List.of());
        for (Map<String, Object> g : genres) {
            genreCache.put((int) toDouble(g.get("id")), str(g.get("name")));
        }
    }

    private String mapGenres(Object genreIds) {
        if (!(genreIds instanceof List<?> ids) || ids.isEmpty() || genreCache == null) return "Drama";
        List<String> names = new ArrayList<>();
        for (Object idObj : ids) {
            String name = genreCache.get((int) toDouble(idObj));
            if (name != null) names.add(name);
            if (names.size() == 2) break; // keep it short, like the UI expects
        }
        return names.isEmpty() ? "Drama" : String.join("/", names);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> get(String path, Map<String, String> params) {
        String url = UriComponentsBuilder.fromHttpUrl(tmdb.getBaseUrl() + "/" + path)
                .queryParam("api_key", tmdb.getApiKey())
                .queryParam("language", "en-US")
                .build().toUriString();
        for (var e : params.entrySet()) {
            url = UriComponentsBuilder.fromHttpUrl(url).queryParam(e.getKey(), e.getValue()).build().toUriString();
        }
        try {
            return tmdbRestTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            log.warn("TMDB request failed ({}): {}", path, e.getMessage());
            return null;
        }
    }

    // ---- helpers ----
    private static String str(Object o) { return o == null ? null : String.valueOf(o); }
    private static double toDouble(Object o) {
        if (o instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(String.valueOf(o)); } catch (Exception e) { return 0; }
    }
    private static Double round1(double v) { return Math.round(v * 10.0) / 10.0; }
    private static LocalDate parseDate(String s) {
        try { return (s == null || s.isBlank()) ? null : LocalDate.parse(s); } catch (Exception e) { return null; }
    }
}
