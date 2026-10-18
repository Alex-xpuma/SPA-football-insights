-- Database schema for the Football Match Management System.
-- Executed automatically by the Postgres container on first start.

CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  elo INTEGER NOT NULL DEFAULT 1500,
  goals_avg DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  conceded_avg DOUBLE PRECISION NOT NULL DEFAULT 1.0
);

CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  team_home_id INTEGER NOT NULL REFERENCES teams(id),
  team_away_id INTEGER NOT NULL REFERENCES teams(id),
  score_home INTEGER,
  score_away INTEGER,
  match_date DATE NOT NULL,
  elo_home_before INTEGER,
  elo_away_before INTEGER
);

-- Sample teams (illustrative Elo ratings) so the app is usable right after start
INSERT INTO teams (name, elo, goals_avg, conceded_avg) VALUES
  ('Real Madrid',     1650, 2.1, 0.9),
  ('Barcelona',       1630, 2.0, 1.0),
  ('Bayern Munich',   1640, 2.3, 1.0),
  ('Manchester City', 1660, 2.4, 0.8),
  ('Liverpool',       1620, 2.0, 1.1),
  ('Juventus',        1580, 1.6, 0.8);
