import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Action = "upload" | "read";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // --- keep original contract ---
    const action = (body?.action || "upload") as Action;
    const expiresIn = Number(body?.expiresIn ?? 3600);

    // --- new optional inputs (won't break old callers) ---
    // 1) allow overriding bucket per request (still default to env/constant)
    const reqBucket = body?.bucket;
    const bucket = (typeof reqBucket === "string" && reqBucket.trim())
      ? reqBucket.trim()
      : (Deno.env.get("BUCKET_NAME") || "Product_images");

    // 2) support single path (original)
    const path = body?.path;

    // 3) support multiple paths (new)
    const paths = body?.paths;

    // 4) support product_id -> lookup cover image path in product_images_2 (new)
    const productId = body?.product_id;

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ------------------------------
    // upload signing (KEEP AS-IS)
    // ------------------------------
    if (action === "upload") {
      if (!path || typeof path !== "string") {
        return new Response(JSON.stringify({ error: "Missing path" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUploadUrl(path);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          action,
          bucket,
          filePath: path,
          signedUrl: data.signedUrl, // 給前端 PUT 用
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ------------------------------
    // read signing (ENHANCED)
    // ------------------------------

    // A) if product_id is provided, look up cover image path first
    if (typeof productId === "string" && productId.trim()) {
      const { data: img, error: imgErr } = await supabase
        .from("product_images_2")
        .select("image_path")
        .eq("product_id", productId.trim())
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (imgErr) {
        return new Response(JSON.stringify({ error: imgErr.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!img?.image_path) {
        return new Response(JSON.stringify({ error: "No image found for product_id" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(img.image_path, expiresIn);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          action,
          bucket,
          filePath: img.image_path,
          signedUrl: data.signedUrl,
          expiresIn,
          product_id: productId.trim(),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // B) if paths[] is provided, batch sign
    if (Array.isArray(paths)) {
      const cleanPaths = paths
        .filter((p: unknown) => typeof p === "string" && p.trim())
        .map((p: string) => p.trim());

      if (cleanPaths.length === 0) {
        return new Response(JSON.stringify({ error: "Missing paths" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Note: supabase-js doesn't have batch signed url API; do Promise.all safely
      const results = await Promise.all(
        cleanPaths.map(async (p) => {
          const { data, error } = await supabase.storage
            .from(bucket)
            .createSignedUrl(p, expiresIn);

          return {
            filePath: p,
            signedUrl: data?.signedUrl ?? null,
            error: error?.message ?? null,
          };
        })
      );

      return new Response(
        JSON.stringify({
          action,
          bucket,
          expiresIn,
          results, // [{filePath, signedUrl, error}]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // C) fallback to original single path behavior (KEEP COMPATIBILITY)
    if (!path || typeof path !== "string") {
      return new Response(JSON.stringify({ error: "Missing path" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        action,
        bucket,
        filePath: path,
        signedUrl: data.signedUrl, // 給 n8n/前端讀取用
        expiresIn,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err?.message ?? String(err) }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});