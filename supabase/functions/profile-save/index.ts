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
    if (!authHeader) return new Response(
      JSON.stringify({ error: 'Not authenticated' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const body = await req.json()
    const { rev, exp, emi, bizName, industry } = body

    const revenue   = parseFloat(rev)  || 0
    const expenses  = parseFloat(exp)  || 0
    const emiAmt    = parseFloat(emi)  || 0
    const runway    = expenses > 0 ? Math.floor((revenue - expenses) / expenses) : 0

    const today = new Date().toISOString().split('T')[0]

    const { error: finError } = await supabase
      .from('financial_data')
      .upsert({
        user_id:       user.id,
        snapshot_date: today,
        revenue,
        expenses,
        emi:           emiAmt,
        runway_months: runway,
      }, { onConflict: 'user_id,snapshot_date' })

    if (finError) throw new Error(finError.message)

    const bizProfile = JSON.stringify({ rev, exp, emi, bizName, industry })
    await supabase
      .from('profiles')
      .upsert({ id: user.id, biz_profile: bizProfile }, { onConflict: 'id' })

    return new Response(
      JSON.stringify({ ok: true, runway_months: runway }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
