-- =============================================================================
-- Orienteering Management System - Initial / Demo Data
-- =============================================================================

-- Vyčištění existujících dat (reset stavu při každém spuštění setupu)
DELETE FROM race_entries;
DELETE FROM categories;
DELETE FROM races;
DELETE FROM competitors;

-- Reset čítačů sekvencí
ALTER SEQUENCE races_id_seq RESTART WITH 1;
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE competitors_id_seq RESTART WITH 1;
ALTER SEQUENCE race_entries_id_seq RESTART WITH 1;

-- 1. Závodníci
INSERT INTO competitors (id, first_name, last_name, club, reg_number) VALUES
    (1, 'Jan', 'Novák', 'ZBM', 'ZBM9801'),
    (2, 'Tomáš', 'Dvořák', 'TBM', 'TBM0002'),
    (3, 'Petr', 'Svoboda', 'TUR', 'TUR9501'),
    (4, 'Lukáš', 'Kučera', 'PGP', 'PGP0103'),
    (5, 'Martin', 'Černý', 'PHK', 'PHK9904'),
    (6, 'Tereza', 'Procházková', 'ZBM', 'ZBM0251'),
    (7, 'Eliška', 'Němcová', 'TBM', 'TBM0152'),
    (8, 'Kateřina', 'Horáková', 'TUR', 'TUR9953'),
    (9, 'Adéla', 'Pospíšilová', 'PGP', 'PGP0354'),
    (10, 'David', 'Královský', 'ZBM', 'ZBM9705');

-- 2. Závody
INSERT INTO races (id, name, location, event_date, status, description) VALUES
    (1, 'Mistrovství oddílu 2026 - Lesní sprint', 'Brno - Holedná', NOW() - INTERVAL '2 days', 'FINISHED', 'Klasický jarní lesní sprint v terénu obory Holedná. Závod je již ukončen a výsledky jsou oficiální.'),
    (2, 'Jarní pohár 2026 - Královo Pole', 'Brno - Zaječí hora', NOW() + INTERVAL '1 hour', 'IN_PROGRESS', 'Městský parkový a lesní závod. Přejděte do detailu závodu pro vyzkoušení stopek, startování závodníků a ukončení závodu.');

-- 3. Kategorie
INSERT INTO categories (id, race_id, name, distance_km, elevation_m) VALUES
    (1, 1, 'H21', 4.2, 130),
    (2, 1, 'D21', 3.6, 95),
    (3, 2, 'H21', 3.8, 80),
    (4, 2, 'OPEN', 2.5, 40);

-- 4. Přihlášky a výsledky (Race entries)
-- Kategorie 1 (H21 v ukončeném závodě)
INSERT INTO race_entries (category_id, competitor_id, bib_number, started_at, finished_at, result_time_seconds, status, note) VALUES
    (1, 1, 101, NOW() - INTERVAL '2 days 2 hours', NOW() - INTERVAL '2 days 2 hours' + INTERVAL '24 minutes 15 seconds', 1455, 'FINISHED', NULL),
    (1, 2, 102, NOW() - INTERVAL '2 days 1 hour 58 minutes', NOW() - INTERVAL '2 days 1 hour 58 minutes' + INTERVAL '25 minutes 2 seconds', 1502, 'FINISHED', NULL),
    (1, 3, 103, NOW() - INTERVAL '2 days 1 hour 56 minutes', NOW() - INTERVAL '2 days 1 hour 56 minutes' + INTERVAL '26 minutes 35 seconds', 1595, 'FINISHED', NULL),
    (1, 4, 104, NOW() - INTERVAL '2 days 1 hour 54 minutes', NULL, NULL, 'DISQ', 'Chybějící kontrola 34'),
    (1, 5, 105, NOW() - INTERVAL '2 days 1 hour 52 minutes', NULL, NULL, 'DNF', 'Zranění kotníku');

-- Kategorie 2 (D21 v ukončeném závodě)
INSERT INTO race_entries (category_id, competitor_id, bib_number, started_at, finished_at, result_time_seconds, status, note) VALUES
    (2, 6, 201, NOW() - INTERVAL '2 days 1 hour 59 minutes', NOW() - INTERVAL '2 days 1 hour 59 minutes' + INTERVAL '22 minutes 40 seconds', 1360, 'FINISHED', NULL),
    (2, 7, 202, NOW() - INTERVAL '2 days 1 hour 57 minutes', NOW() - INTERVAL '2 days 1 hour 57 minutes' + INTERVAL '23 minutes 55 seconds', 1435, 'FINISHED', NULL),
    (2, 8, 203, NOW() - INTERVAL '2 days 1 hour 55 minutes', NOW() - INTERVAL '2 days 1 hour 55 minutes' + INTERVAL '26 minutes 10 seconds', 1570, 'FINISHED', NULL);

-- Kategorie 3 (H21 v probíhajícím závodě pro živou stopku)
INSERT INTO race_entries (category_id, competitor_id, bib_number, started_at, finished_at, result_time_seconds, status, note) VALUES
    (3, 1, 1, NOW() - INTERVAL '5 minutes', NULL, NULL, 'RUNNING', NULL),
    (3, 2, 2, NULL, NULL, NULL, 'REGISTERED', NULL),
    (3, 10, 3, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '2 minutes', 780, 'FINISHED', NULL);

-- Kategorie 4 (OPEN v probíhajícím závodě - Jan Novák běží ve dvou kategoriích)
INSERT INTO race_entries (category_id, competitor_id, bib_number, started_at, finished_at, result_time_seconds, status, note) VALUES
    (4, 1, 51, NULL, NULL, NULL, 'REGISTERED', NULL),
    (4, 9, 52, NULL, NULL, NULL, 'REGISTERED', NULL);

-- Posunutí sekvencí po vložení fixních ID (aby další nově vytvořené záznamy nekolidovaly)
SELECT setval('competitors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM competitors));
SELECT setval('races_id_seq', (SELECT COALESCE(MAX(id), 1) FROM races));
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));
SELECT setval('race_entries_id_seq', (SELECT COALESCE(MAX(id), 1) FROM race_entries));
