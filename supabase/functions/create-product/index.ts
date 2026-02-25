import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const N8N_WEBHOOK_URL = Deno.env.get("N8N_WEBHOOK_URL")

    if (!N8N_WEBHOOK_URL) {
      return new Response(
        JSON.stringify({ error: "Missing env: N8N_WEBHOOK_URL" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const body = await req.json()

    // ✅ 1. 驗證 line_user_id 是否存在
    if (!body.line_user_id) {
      return new Response(
        JSON.stringify({ error: "Missing line_user_id in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // ✅ 2. 強制標準化 payload 結構（避免後面抓不到欄位）
    const payload = {
      line_user_id: body.line_user_id,
      user_id: body.user_id ?? body.line_user_id, // 保留兼容
      batch_id: body.batch_id,
      description: body.description ?? "",
      price: body.price ?? null,
      images: body.images ?? [],
      created_at: new Date().toISOString(),
    }

    console.log("Forwarding to n8n:", payload)

    // ✅ 3. 轉發給 n8n
    const r = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const text = await r.text()

    return new Response(text, {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (e) {
    return new Response(
      JSON.stringify({ error: e.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})