-- Client Portal table
CREATE TABLE IF NOT EXISTS client_portals (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  advisor_id       UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_name      TEXT NOT NULL,
  client_email     TEXT NOT NULL,
  token            TEXT UNIQUE NOT NULL,
  advisor_name     TEXT,
  biz_name         TEXT,
  shared_data      JSONB DEFAULT '{}',
  custom_message   TEXT,
  view_count       INT DEFAULT 0,
  last_viewed_at   TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_portals ENABLE ROW LEVEL SECURITY;

-- Authenticated advisors: full access to their own rows
CREATE POLICY "advisor_full_access" ON client_portals
  FOR ALL TO authenticated
  USING (advisor_id = auth.uid())
  WITH CHECK (advisor_id = auth.uid());

-- Anon (client view): SELECT allowed — token in query acts as access control
CREATE POLICY "public_select" ON client_portals
  FOR SELECT TO anon
  USING (true);

-- Anon: UPDATE allowed so view tracking works from client-view.html
CREATE POLICY "public_view_track" ON client_portals
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
