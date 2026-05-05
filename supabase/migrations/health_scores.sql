-- Business Health Score table
CREATE TABLE IF NOT EXISTS health_scores (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  overall_score   NUMERIC NOT NULL,
  score_date      DATE NOT NULL DEFAULT CURRENT_DATE,
  dimension_data  JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, score_date)
);

ALTER TABLE health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own health scores" ON health_scores
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS health_scores_user_id_idx ON health_scores(user_id);
CREATE INDEX IF NOT EXISTS health_scores_date_idx ON health_scores(user_id, score_date DESC);
