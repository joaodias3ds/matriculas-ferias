CREATE TABLE IF NOT EXISTS enrollments (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 code TEXT NOT NULL UNIQUE,
 name TEXT NOT NULL,
 birth_date TEXT NOT NULL,
 email TEXT NOT NULL UNIQUE COLLATE NOCASE,
 phone TEXT NOT NULL,
 guardian_name TEXT,
 guardian_phone TEXT,
 school TEXT,
 notes TEXT,
 consent INTEGER NOT NULL,
 created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
