-- =============================================================================
-- Orienteering Management System - Database Schema
-- =============================================================================

-- Smazání staré tabulky users, pokud ještě existuje v DB
DROP TABLE IF EXISTS users CASCADE;

-- 1. Závody (races)
CREATE TABLE IF NOT EXISTS races (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    location VARCHAR(150),
    event_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_races_status ON races(status);

-- 2. Kategorie v závodě (categories)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    race_id INTEGER NOT NULL REFERENCES races(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    distance_km DOUBLE PRECISION,
    elevation_m INTEGER
);
CREATE INDEX IF NOT EXISTS idx_categories_race_id ON categories(race_id);

-- 3. Závodníci (competitors)
CREATE TABLE IF NOT EXISTS competitors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(80) NOT NULL,
    last_name VARCHAR(80) NOT NULL,
    club VARCHAR(80),
    reg_number VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_competitors_club ON competitors(club);

-- 4. Přihlášky do kategorií / startovní listina a výsledky (race_entries)
CREATE TABLE IF NOT EXISTS race_entries (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    competitor_id INTEGER NOT NULL REFERENCES competitors(id) ON DELETE CASCADE,
    bib_number INTEGER,
    started_at TIMESTAMP WITH TIME ZONE,
    finished_at TIMESTAMP WITH TIME ZONE,
    result_time_seconds INTEGER,
    status VARCHAR(20) NOT NULL DEFAULT 'REGISTERED',
    note VARCHAR(255)
);
CREATE INDEX IF NOT EXISTS idx_race_entries_category_id ON race_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_race_entries_competitor_id ON race_entries(competitor_id);
CREATE INDEX IF NOT EXISTS idx_race_entries_status ON race_entries(status);
