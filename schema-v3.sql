ALTER TABLE legacy_students ADD COLUMN birth_date TEXT;
ALTER TABLE legacy_students ADD COLUMN email TEXT;
ALTER TABLE applications ADD COLUMN birth_date TEXT;
ALTER TABLE applications ADD COLUMN instagram TEXT;
ALTER TABLE applications ADD COLUMN modality_id TEXT;
ALTER TABLE applications ADD COLUMN modality_name TEXT;
ALTER TABLE applications ADD COLUMN payment_method TEXT;
ALTER TABLE applications ADD COLUMN invoice_requested INTEGER NOT NULL DEFAULT 0;
ALTER TABLE applications ADD COLUMN course_info_accepted_at TEXT;
ALTER TABLE applications ADD COLUMN student_consent_at TEXT;
ALTER TABLE applications ADD COLUMN schedule_text TEXT;
CREATE TABLE IF NOT EXISTS modalities (
 id TEXT PRIMARY KEY,
 name TEXT NOT NULL,
 description TEXT NOT NULL,
 price_per_course_cents INTEGER NOT NULL,
 active INTEGER NOT NULL DEFAULT 1
);
INSERT OR IGNORE INTO modalities (id,name,description,price_per_course_cents) VALUES
 ('indicacao','Modalidade 1 — Divulgação + indicação','Ajudar na divulgação e indicar um novo aluno que efetive a matrícula. Disponível até o dia 5.',15000),
 ('divulgacao','Modalidade 2 — Divulgação','Ajudar na divulgação do curso e compartilhar as marcações da escola.',20000),
 ('normal','Modalidade 3 — Normal','Sem compromisso de divulgação; apenas participar das aulas.',20000);
