-- RPC used by health-drop-alert Edge Function
-- Returns users whose health score dropped >= min_drop points between their last two entries

CREATE OR REPLACE FUNCTION get_health_drops(min_drop integer DEFAULT 10)
RETURNS TABLE (
  user_id       uuid,
  prev_score    numeric,
  curr_score    numeric,
  drop_points   numeric,
  email         text,
  biz_profile   text
)
LANGUAGE sql SECURITY DEFINER AS $$
  SELECT
    h.user_id,
    h2.overall_score   AS prev_score,
    h1.overall_score   AS curr_score,
    (h2.overall_score - h1.overall_score) AS drop_points,
    p.email,
    p.biz_profile
  FROM (
    SELECT user_id, overall_score, score_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score_date DESC) AS rn
    FROM health_scores
  ) h1
  JOIN (
    SELECT user_id, overall_score, score_date,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY score_date DESC) AS rn
    FROM health_scores
  ) h2 ON h1.user_id = h2.user_id AND h2.rn = 2
  JOIN profiles p ON p.id = h1.user_id
  WHERE h1.rn = 1
    AND (h2.overall_score - h1.overall_score) >= min_drop
    AND p.email IS NOT NULL;
$$;
