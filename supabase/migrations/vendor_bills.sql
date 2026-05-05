-- Vendor Bill Tracker table
CREATE TABLE IF NOT EXISTS vendor_bills (
  id                  TEXT PRIMARY KEY,
  user_id             UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vendor              TEXT NOT NULL,
  amount              NUMERIC NOT NULL,
  due_day             INTEGER NOT NULL,
  category            TEXT DEFAULT 'Other',
  auto_pay            BOOLEAN DEFAULT FALSE,
  contract_expiry     DATE,
  scheduled_pay_date  DATE,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE vendor_bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bills" ON vendor_bills
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS vendor_bills_user_id_idx ON vendor_bills(user_id);
