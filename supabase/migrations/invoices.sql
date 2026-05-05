-- Invoice Tracker table
CREATE TABLE IF NOT EXISTS invoices (
  id              TEXT PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  client          TEXT NOT NULL,
  client_email    TEXT,
  inv_no          TEXT,
  amount          NUMERIC NOT NULL,
  issued          DATE,
  due_date        DATE NOT NULL,
  notes           TEXT,
  status          TEXT DEFAULT 'pending',
  paid_date       DATE,
  recurring       TEXT,
  recurring_end   DATE,
  recurring_parent_id TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own invoices" ON invoices
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
