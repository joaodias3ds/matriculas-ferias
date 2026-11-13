CREATE TABLE IF NOT EXISTS legacy_students (
 registration TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 age INTEGER,
 phone TEXT,
 whatsapp TEXT,
 school TEXT,
 grade TEXT,
 mother_name TEXT,
 mother_phone TEXT,
 father_name TEXT,
 father_phone TEXT
);
CREATE TABLE IF NOT EXISTS applications (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 protocol TEXT NOT NULL UNIQUE,
 legacy_registration TEXT,
 student_name TEXT NOT NULL,
 student_age INTEGER NOT NULL,
 phone TEXT NOT NULL,
 whatsapp TEXT NOT NULL,
 school TEXT NOT NULL,
 grade TEXT NOT NULL,
 mother_name TEXT,
 mother_phone TEXT,
 father_name TEXT,
 father_phone TEXT,
 courses TEXT NOT NULL,
 plan_id TEXT NOT NULL,
 plan_name TEXT NOT NULL,
 plan_price_cents INTEGER,
 email TEXT NOT NULL,
 privacy_accepted_at TEXT NOT NULL,
 terms_accepted_at TEXT NOT NULL,
 info_accepted_at TEXT NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_legacy ON applications(legacy_registration) WHERE legacy_registration IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_student_phone ON applications(lower(student_name),phone);
CREATE TABLE IF NOT EXISTS rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS plans (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT NOT NULL,
 price_cents INTEGER,
 active INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO plans (id,name,description,price_cents) VALUES
 ('redacao','Redação','Segundas-feiras · dois encontros em novembro e dois em dezembro de 2026.',20000),
 ('gramatica','Gramática','Sextas-feiras · dois encontros em novembro e dois em dezembro de 2026.',20000),
 ('completo','Redação + Gramática','Os dois cursos, quatro encontros cada.',40000);


