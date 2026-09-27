package com.cfs.BMS.config;

import com.cfs.BMS.config.TmdbConfig.TmdbProperties;
import com.cfs.BMS.service.TmdbService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.ApplicationArguments;
import org.springframework.stereotype.Component;

/**
 * On startup, if a TMDB key is present and sync-on-startup is enabled,
 * import real movies. Runs after the datasource/seed initialization.
 */
@Component
@RequiredArgsConstructor
public class TmdbStartupSync implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(TmdbStartupSync.class);

    private final TmdbProperties tmdb;
    private final TmdbService tmdbService;

    @Override
    public void run(ApplicationArguments args) {
        if (tmdb.isConfigured() && tmdb.isSyncOnStartup()) {
            log.info("TMDB key detected - importing real movies on startup…");
            try {
                tmdbService.syncMovies();
            } catch (Exception e) {
                log.warn("TMDB startup sync failed (continuing with existing data): {}", e.getMessage());
            }
        }
    }
}
