-- Organized Motion asset vault
-- Every row carries provenance and cost. A compliance or budget question
-- should be one query, not archaeology.

CREATE TABLE IF NOT EXISTS briefs (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  shot_count   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS generations (
  id               TEXT PRIMARY KEY,
  brief_id         TEXT NOT NULL REFERENCES briefs(id),
  generator        TEXT NOT NULL,          -- higgsfield | meshy | manual
  external_job_id  TEXT,
  status           TEXT NOT NULL,          -- queued|running|succeeded|failed|gated
  asset_key        TEXT,                   -- R2 key
  cost_credits     REAL NOT NULL DEFAULT 0,
  prompt           TEXT NOT NULL,
  provenance_json  TEXT NOT NULL,          -- full ShotBrief as submitted
  created_at       TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_gen_brief ON generations(brief_id);
CREATE INDEX IF NOT EXISTS idx_gen_status ON generations(status);

CREATE TABLE IF NOT EXISTS shots (
  brief_id       TEXT NOT NULL,
  shot_index     INTEGER NOT NULL,
  beat           TEXT NOT NULL,            -- hook|evidence|mechanism|value|payoff|cta
  aspect         TEXT NOT NULL,
  duration_s     REAL NOT NULL,
  generation_id  TEXT REFERENCES generations(id),
  PRIMARY KEY (brief_id, shot_index)
);

CREATE TABLE IF NOT EXISTS scores (
  generation_id   TEXT PRIMARY KEY REFERENCES generations(id),
  motion_quality  REAL NOT NULL,
  on_brief        REAL NOT NULL,
  hook_match      REAL NOT NULL,
  composite       REAL NOT NULL,
  raw_json        TEXT,
  scored_at       TEXT NOT NULL,
  -- Phase 8 writeback: real ad performance, joined on creative_id
  observed_cpa    REAL,
  observed_ctr    REAL,
  observed_thumbstop REAL
);

CREATE TABLE IF NOT EXISTS licenses (
  asset_key        TEXT PRIMARY KEY,
  source           TEXT NOT NULL,          -- artlist | higgsfield | meshy | openart | original
  license_type     TEXT,
  download_date    TEXT,
  clearlist_status TEXT,
  certificate_url  TEXT,
  notes            TEXT
);

CREATE TABLE IF NOT EXISTS renders (
  id            TEXT PRIMARY KEY,
  brief_id      TEXT NOT NULL REFERENCES briefs(id),
  aspect        TEXT NOT NULL,
  asset_key     TEXT,
  frames_total  INTEGER,
  status        TEXT NOT NULL,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS creatives (
  creative_id   TEXT PRIMARY KEY,
  render_id     TEXT NOT NULL REFERENCES renders(id),
  platform      TEXT,                      -- meta | google | tiktok | organic
  external_id   TEXT,
  launched_at   TEXT
);
CREATE INDEX IF NOT EXISTS idx_creative_render ON creatives(render_id);
