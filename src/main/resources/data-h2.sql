-- =============================================
-- BookMyShow - H2-compatible Seed Data (rich)
-- Full seat maps + multiple showtimes so the
-- end-to-end booking flow works for real.
-- Avoids PostgreSQL-only syntax (no DO $$ / TRUNCATE CASCADE).
-- =============================================

-- Clear existing rows (child -> parent order)
DELETE FROM booking_seats;
DELETE FROM bookings;
DELETE FROM seats;
DELETE FROM shows;
DELETE FROM screens;
DELETE FROM theaters;
DELETE FROM movies;
DELETE FROM cities;
DELETE FROM users;

-- 1. Cities
INSERT INTO cities (name, state) VALUES
('Mumbai', 'Maharashtra'), ('Delhi', 'Delhi'), ('Bangalore', 'Karnataka'),
('Hyderabad', 'Telangana'), ('Chennai', 'Tamil Nadu'), ('Pune', 'Maharashtra'),
('Kolkata', 'West Bengal'), ('Ahmedabad', 'Gujarat');

-- 2. Users (demo account: rajeev@example.com / pass123)
INSERT INTO users (name, email, password, phone, created_at) VALUES
('Rajeev Mehra', 'rajeev@example.com', 'pass123', '9999999999', CURRENT_TIMESTAMP);

-- 3. Movies (Actual Hits with Verified TMDB Posters)
INSERT INTO movies (title, description, genre, language, duration_minutes, rating, release_date, poster_url) VALUES
('Pushpa 2: The Rule', 'The rule of Pushpa Raj.', 'Action', 'Telugu', 165, 9.2, '2024-12-05', 'https://image.tmdb.org/t/p/original/bhxZj3y59cK7JtGdV285dhDRaMe.jpg'),
('Stree 2', 'Sarkata returns to Chanderi.', 'Horror/Comedy', 'Hindi', 147, 8.5, '2024-08-15', 'https://image.tmdb.org/t/p/original/nfnhwfUEFuSOxxf4jDdBlY6Lccw.jpg'),
('Kalki 2898 AD', 'The battle for the future.', 'Sci-Fi/Action', 'Telugu', 181, 8.1, '2024-06-27', 'https://image.tmdb.org/t/p/original/4P3K5medethmTlsuN7UN5bmnATq.jpg'),
('Jawan', 'A social thriller of a man determined to rectify wrongs.', 'Action', 'Hindi', 169, 7.8, '2023-09-07', 'https://image.tmdb.org/t/p/original/gTV8RAYEKDcRwn4TFbUZfRk5Nsj.jpg'),
('Animal', 'A gripping father-son obsession drama.', 'Action/Drama', 'Hindi', 201, 7.6, '2023-12-01', 'https://image.tmdb.org/t/p/original/14zedCaF044yj3at1TJ2uHpaNQD.jpg'),
('RRR', 'Tale of two legendary revolutionaries.', 'Action', 'Telugu', 187, 8.7, '2022-03-25', 'https://image.tmdb.org/t/p/original/nEufeZlyAOLqO2brrs0yeF1lgXO.jpg'),
('Baahubali 2: The Conclusion', 'The epic conclusion to the legendary saga.', 'Action/Drama', 'Telugu', 167, 8.8, '2017-04-28', 'https://image.tmdb.org/t/p/original/21sC2assImQIYCEDA84Qh9d1RsK.jpg'),
('K.G.F: Chapter 2', 'Rockys supremacy challenged.', 'Action', 'Kannada', 168, 8.4, '2022-04-14', 'https://image.tmdb.org/t/p/original/au6Nq6kVr9NFICzpmYtMSyDA3Gi.jpg'),
('Kantara', 'Justice for the village through ancestral roots.', 'Action/Drama', 'Kannada', 148, 8.2, '2022-09-30', 'https://image.tmdb.org/t/p/original/lqkaDoxdKC9PhLtIfAdAVCtQTvM.jpg'),
('Vikram', 'Special Ops hunting a masked serial killer.', 'Action/Thriller', 'Tamil', 175, 8.3, '2022-06-03', 'https://image.tmdb.org/t/p/original/774UV1aCURb4s4JfEFg3IEMu5Zj.jpg'),
('Leo', 'A hero hiding from a dangerous past.', 'Action', 'Tamil', 164, 7.3, '2023-10-19', 'https://image.tmdb.org/t/p/original/t1oAdt8JjUs4sHEBvE8fKtjV7er.jpg'),
('Jailer', 'A retired jailer goes on a manhunt.', 'Action', 'Tamil', 168, 7.5, '2023-08-10', 'https://image.tmdb.org/t/p/original/p933oBZpchdX8KA29gPVKBxGlyU.jpg'),
('3 Idiots', 'Chasing excellence with Rancho.', 'Comedy/Drama', 'Hindi', 170, 8.4, '2009-12-25', 'https://image.tmdb.org/t/p/original/66A9MqXOyVFCssoloscw79z8Tew.jpg'),
('Dangal', 'The wrestling legacy.', 'Sport/Drama', 'Hindi', 161, 8.3, '2016-12-23', 'https://image.tmdb.org/t/p/original/3n8888uKuaxPBBuDUqJhfhrWlgA.jpg'),
('PK', 'A stranger logic about god.', 'Comedy/Sci-Fi', 'Hindi', 153, 8.1, '2014-12-19', 'https://image.tmdb.org/t/p/original/uqoAHhuKZnWxzXbXSUycgpLPmUW.jpg'),
('Bajrangi Bhaijaan', 'A journey of innocence across borders.', 'Drama', 'Hindi', 159, 8.1, '2015-07-17', 'https://image.tmdb.org/t/p/original/hGIlHgQC2RnS8xTlE3nuTDXanYC.jpg'),
('Drishyam 2', 'The case reopens.', 'Thriller', 'Hindi', 140, 8.2, '2022-11-18', 'https://image.tmdb.org/t/p/original/pcuGo5KfNkGhftnb1uFEXCN4Gpa.jpg'),
('Pathaan', 'Indian spy taking on a mercenary leader.', 'Action/Thriller', 'Hindi', 146, 7.1, '2023-01-25', 'https://image.tmdb.org/t/p/original/m1b97ofvnYpCH9uGguML986eUfS.jpg'),
('Gadar 2', 'Tara Singh returning for his son.', 'Action/Drama', 'Hindi', 170, 7.5, '2023-08-11', 'https://image.tmdb.org/t/p/original/unmYQ3t03AnS492iE9rWwV35N7t.jpg'),
('Pushpa: The Rise', 'The rise of a smuggler.', 'Action', 'Telugu', 179, 7.6, '2021-12-17', 'https://image.tmdb.org/t/p/original/oaRk2HgOirEeNuDCwwScmq7rKvS.jpg');

-- 4. Theaters
INSERT INTO theaters (name, address, city_id) VALUES
('PVR Phoenix', 'Lower Parel, Mumbai', 1),
('AMB Cinemas', 'Gachibowli, Hyderabad', 4),
('Sathyam Cinemas', 'Royapettah, Chennai', 5),
('INOX Mantri Square', 'Malleshwaram, Bangalore', 3),
('PVR Directors Cut', 'Vasant Kunj, Delhi', 2);

-- 5. Screens (theater 1 has 2 screens; theaters 2..5 one each)
INSERT INTO screens (name, total_seats, theater_id) VALUES
('IMAX 1', 120, 1),        -- screen 1  (theater 1)
('Audi 2', 120, 1),        -- screen 2  (theater 1)
('Screen A', 120, 2),      -- screen 3  (theater 2)
('Dolby Atmos', 120, 3),   -- screen 4  (theater 3)
('Insignia', 120, 4),      -- screen 5  (theater 4)
('Gold Class', 120, 5);    -- screen 6  (theater 5)

-- =============================================
-- 6. SEATS: full 8-row x 15-col map (120 seats) per screen.
-- Rows A-C = REGULAR, D-F = PREMIUM, G-H = VIP (recliner).
-- Generated with a recursive CTE cross join, one INSERT per screen.
-- =============================================
INSERT INTO seats (seat_number, seat_row, seat_col, seat_type, screen_id)
SELECT r.rc || c.cn, r.rc, c.cn,
       CASE WHEN r.rc IN ('A','B','C') THEN 'REGULAR'
            WHEN r.rc IN ('D','E','F') THEN 'PREMIUM'
            ELSE 'VIP' END,
       s.sid
FROM (VALUES ('A'),('B'),('C'),('D'),('E'),('F'),('G'),('H')) AS r(rc)
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12),(13),(14),(15)) AS c(cn)
CROSS JOIN (VALUES (1),(2),(3),(4),(5),(6)) AS s(sid);

-- =============================================
-- 7. SHOWS: give the first 12 movies several showtimes across screens/dates.
-- Prices vary by screen tier. Times: morning / afternoon / evening / night.
-- =============================================
-- Today - screen 1 (IMAX) morning + evening for movies 1..12
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 1, CURRENT_DATE, '10:00:00', '13:00:00', 350.00 FROM movies WHERE id <= 12;
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 1, CURRENT_DATE, '19:30:00', '22:30:00', 450.00 FROM movies WHERE id <= 12;

-- Today - screen 2 (Audi 2) afternoon for movies 1..12
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 2, CURRENT_DATE, '14:30:00', '17:30:00', 300.00 FROM movies WHERE id <= 12;

-- Today - screen 3 (Hyderabad) evening for movies 1..8
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 3, CURRENT_DATE, '18:00:00', '21:00:00', 320.00 FROM movies WHERE id <= 8;

-- Today - screen 4 (Dolby, Chennai) night for movies 1..8
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 4, CURRENT_DATE, '22:00:00', '01:00:00', 400.00 FROM movies WHERE id <= 8;

-- Tomorrow - screen 5 (Bangalore) afternoon + evening for movies 1..10
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 5, DATEADD('DAY', 1, CURRENT_DATE), '15:00:00', '18:00:00', 380.00 FROM movies WHERE id <= 10;
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 5, DATEADD('DAY', 1, CURRENT_DATE), '20:00:00', '23:00:00', 500.00 FROM movies WHERE id <= 10;

-- Tomorrow - screen 6 (Delhi, Gold Class) evening for movies 1..10
INSERT INTO shows (movie_id, screen_id, show_date, start_time, end_time, ticket_price)
SELECT id, 6, DATEADD('DAY', 1, CURRENT_DATE), '19:00:00', '22:00:00', 550.00 FROM movies WHERE id <= 10;

-- =============================================
-- 8. Pre-book a handful of seats on show 1 so "occupied" seats are visible.
-- (booking for demo user id 1 on show 1: seats A1,A2,A3 = seat ids 1,2,3 on screen 1)
-- =============================================
INSERT INTO bookings (user_id, show_id, total_price, status, booked_at)
VALUES (1, 1, 1050.00, 'CONFIRMED', CURRENT_TIMESTAMP);
INSERT INTO booking_seats (booking_id, seat_id)
SELECT (SELECT MAX(id) FROM bookings), s.id
FROM seats s WHERE s.screen_id = 1 AND s.seat_number IN ('A1','A2','A3');
