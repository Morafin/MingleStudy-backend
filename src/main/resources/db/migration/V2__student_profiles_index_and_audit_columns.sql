-- Index used by GroupController.myGroup (findByUniversity_Id) on every group page load.
CREATE INDEX IF NOT EXISTS idx_student_profiles_university_id ON student_profiles (university_id);

-- Audit columns for StudentProfile. Added nullable first so the migration works against
-- existing rows, backfilled, then locked down to NOT NULL with a default for new rows.
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP;
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP;

UPDATE student_profiles SET created_at = now() WHERE created_at IS NULL;
UPDATE student_profiles SET updated_at = now() WHERE updated_at IS NULL;

ALTER TABLE student_profiles ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE student_profiles ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE student_profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE student_profiles ALTER COLUMN updated_at SET DEFAULT now();
