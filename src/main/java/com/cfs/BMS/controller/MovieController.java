package com.cfs.BMS.controller;


import com.cfs.BMS.entity.Movie;
import com.cfs.BMS.service.MovieService;
import com.cfs.BMS.service.TmdbService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@Tag(name = "Movie Management", description = "Endpoints for browsing and searching movies")
public class MovieController {

    private final MovieService movieService;
    private final TmdbService tmdbService;


    @GetMapping
    @Operation(summary = "Get all movies", description = "Retrieves a list of all movies available in the system")
    public ResponseEntity<List<Movie>> getAllMovies()
    {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    @PostMapping("/sync-tmdb")
    @Operation(summary = "Sync movies from TMDB", description = "Imports/updates real movies from The Movie Database. Requires TMDB_API_KEY to be configured.")
    public ResponseEntity<Map<String, Object>> syncTmdb()
    {
        if (!tmdbService.isConfigured()) {
            return ResponseEntity.ok(Map.of(
                    "synced", 0,
                    "configured", false,
                    "message", "TMDB_API_KEY is not set. Set it and restart to import real movies."));
        }
        int n = tmdbService.syncMovies();
        return ResponseEntity.ok(Map.of("synced", n, "configured", true,
                "message", "Imported/updated " + n + " movies from TMDB."));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get movie by ID", description = "Retrieves detailed information about a specific movie")
    public ResponseEntity<Movie> getMovieById(@PathVariable Long id)
    {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }


    @GetMapping("/search")
    @Operation(summary = "Search movies by title", description = "Finds movies matching the provided title string")
    public ResponseEntity<List<Movie>> searchMovies(@RequestParam String title)
    {
        return ResponseEntity.ok(movieService.searchByTitle(title));
    }

    @GetMapping("/genre/{genre}")
    @Operation(summary = "Filter movies by genre", description = "Retrieves a list of movies belonging to a specific genre")
    public ResponseEntity<List<Movie>> getByGenre(@PathVariable String genre)
    {
        return ResponseEntity.ok(movieService.getByGenre(genre));
    }

    @GetMapping("/genre/{language}")
    @Operation(summary = "Filter movies by language", description = "Retrieves a list of movies available in a specific language")
    public ResponseEntity<List<Movie>> getByLanguage(@PathVariable String language)
    {
        return ResponseEntity.ok(movieService.getByLanguage(language));
    }
}
