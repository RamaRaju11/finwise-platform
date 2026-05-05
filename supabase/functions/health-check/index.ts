import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }

  return new Response(
    JSON.stringify({
      status: 'ok',
      platform: 'FinWise v2',
      version: '2.0.0',
      timestamp: new Date().toISOString()
    }),
    { headers: { ...cors, 'Content-Type': 'application/json' }, status: 200 }
  )
})
