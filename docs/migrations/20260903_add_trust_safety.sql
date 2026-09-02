-- Additive migration for the provider trust, review moderation, and safety features.
-- Run this file against an existing PostgreSQL database after taking a backup.
-- It is idempotent for columns, tables, indexes, and constraints where practical.

BEGIN;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS background_checked BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS business_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE reviews
    ADD COLUMN IF NOT EXISTS moderation_status VARCHAR(20) NOT NULL DEFAULT 'published',
    ADD COLUMN IF NOT EXISTS moderation_note VARCHAR(500),
    ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS moderated_by_id INT;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_moderation_status_check'
    ) THEN
        ALTER TABLE reviews
            ADD CONSTRAINT reviews_moderation_status_check
            CHECK (moderation_status IN ('published', 'hidden'));
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reviews_moderated_by_id_fkey'
    ) THEN
        ALTER TABLE reviews
            ADD CONSTRAINT reviews_moderated_by_id_fkey
            FOREIGN KEY (moderated_by_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS user_blocks (
    id              SERIAL PRIMARY KEY,
    blocker_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_blocks_pair UNIQUE (blocker_id, blocked_user_id),
    CONSTRAINT ck_user_blocks_not_self CHECK (blocker_id <> blocked_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_user_id);

CREATE TABLE IF NOT EXISTS user_reports (
    id               SERIAL PRIMARY KEY,
    reporter_id      INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    listing_id       INT REFERENCES listings(id) ON DELETE SET NULL,
    category         VARCHAR(50) NOT NULL,
    description      VARCHAR(2000) NOT NULL,
    status           VARCHAR(30) NOT NULL DEFAULT 'open',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at      TIMESTAMP,
    resolved_by_id   INT REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT ck_user_reports_not_self CHECK (reporter_id <> reported_user_id),
    CONSTRAINT ck_user_reports_status CHECK (status IN ('open', 'under_review', 'resolved', 'rejected'))
);

CREATE INDEX IF NOT EXISTS idx_user_reports_status_created ON user_reports(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_reports_reporter ON user_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_reported_user ON user_reports(reported_user_id);

COMMIT;
