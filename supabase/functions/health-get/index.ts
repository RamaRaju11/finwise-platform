import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } })

    // Latest score
    const { data: score } = await supabase.from('health_scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false }).limit(1).maybeSingle()

    // Latest priorities
    const { data: priorities } = await supabase.from('daily_priorities').select('*').eq('user_id', user.id).order('priority_date', { ascending: false }).order('priority_rank', { ascending: true }).limit(3)

    // Score history (last 30 days)
    const { data: history } = await supabase.from('health_scores').select('score_date, overall_score').eq('user_id', user.id).order('score_date', { ascending: true }).limit(30)

    return new Response(
      JSON.stringify({ score: score || null, priorities: priorities || [], history: history || [] }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } })
  }
})
