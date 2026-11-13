ALTER TABLE applications ADD COLUMN enrollment_fee_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE applications ADD COLUMN approved_at TEXT;
ALTER TABLE applications ADD COLUMN paid_at TEXT;
ALTER TABLE applications ADD COLUMN removed_at TEXT;
