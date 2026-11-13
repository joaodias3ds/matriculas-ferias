DROP INDEX IF EXISTS idx_applications_legacy;
DROP INDEX IF EXISTS idx_applications_student_phone;
CREATE UNIQUE INDEX idx_applications_legacy ON applications(legacy_registration) WHERE legacy_registration IS NOT NULL AND removed_at IS NULL;
CREATE UNIQUE INDEX idx_applications_student_phone ON applications(lower(student_name),phone) WHERE removed_at IS NULL;
