import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const INCOME_CATEGORIES = ['INCOME', 'PAYROLL', 'TRANSFER_IN', 'DEPOSIT']

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

    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get stored access token
    const { data: conn } = await serviceSupabase
      .from('plaid_connections')
      .select('access_token')
      .eq('user_id', user.id)
      .single()

    if (!conn) return new Response(
      JSON.stringify({ error: 'No bank connected' }),
      { status: 404, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    // Fetch last 90 days of transactions
    const endDate   = new Date().toISOString().split('T')[0]
    const startDate = new Date(Date.now() - 90 * 86400000).toISOString().split('T')[0]

    const txRes = await fetch('https://sandbox.plaid.com/transactions/get', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id:    Deno.env.get('PLAID_CLIENT_ID'),
        secret:       Deno.env.get('PLAID_SECRET'),
        access_token: conn.access_token,
        start_date:   startDate,
        end_date:     endDate,
        options:      { count: 500 }
      })
    })

    const txData = await txRes.json()
    if (!txRes.ok) return new Response(
      JSON.stringify({ error: txData.error_message || 'Plaid sync failed' }),
      { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } }
    )

    const rows = txData.transactions.map((t: any) => ({
      user_id:              user.id,
      plaid_transaction_id: t.transaction_id,
      date:                 t.date,
      amount:               Math.abs(t.amount),
      category:             t.amount < 0 ? 'income' : 'expense',
      merchant_name:        t.merchant_name || t.name,
      account_id:           t.account_id,
      pending:              t.pending,
    }))

    // Upsert transactions
    if (rows.length > 0) {
      await serviceSupabase.from('transactions')
        .upsert(rows, { onConflict: 'plaid_transaction_id' })
    }

    // Compute summary using most recent 30 days in the actual transaction data
    const allDates    = rows.map((r: any) => r.date).sort()
    const latestDate  = allDates[allDates.length - 1] || new Date().toISOString().split('T')[0]
    const cutoff      = new Date(new Date(latestDate).getTime() - 30 * 86400000).toISOString().split('T')[0]
    const summaryMonth = latestDate.slice(0, 7) + '-01'
    const monthly     = rows.filter((r: any) => r.date >= cutoff)
    const revenue     = monthly.filter((r: any) => r.category === 'income').reduce((s: number, r: any) => s + r.amount, 0)
    const expenses    = monthly.filter((r: any) => r.category === 'expense').reduce((s: number, r: any) => s + r.amount, 0)

    await serviceSupabase.from('financial_summary').upsert({
      user_id:    user.id,
      month:      summaryMonth,
      revenue:    Math.round(revenue * 100) / 100,
      expenses:   Math.round(expenses * 100) / 100,
      net_profit: Math.round((revenue - expenses) * 100) / 100,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,month' })

    // Update last_synced_at
    await serviceSupabase.from('plaid_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ ok: true, transactions_imported: rows.length, revenue, expenses }),
      { headers: { ...cors, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } }
    )
  }
})
