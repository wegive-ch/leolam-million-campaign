/**
 * Webhook endpoint para atualização do contador da Missão 1 Milhão.
 *
 * Configure o contador da Leolam para enviar requisições para:
 *   POST https://project--<id>.lovable.app/api/public/campaign-stats
 *
 * Headers obrigatórios:
 *   Content-Type: application/json
 *   x-webhook-signature: <hmac_sha256_hex_do_body>
 *
 * O HMAC deve ser calculado com o raw body (string JSON) usando:
 *   algoritmo: SHA-256
 *   chave:     LEOLAM_WEBHOOK_SECRET (configurar no projeto Lovable)
 *   formato:   hex
 *
 * Payload esperado:
 *   {
 *     "raised":        985000.00,  // valor arrecadado (obrigatório)
 *     "goal":          1000000.00, // meta (opcional, padrão 1.000.000)
 *     "donors":        312,        // número de doadores (obrigatório)
 *     "organizations": 47          // número de organizações (obrigatório)
 *   }
 *
 * Respostas:
 *   200 { ok: true }           – atualizado com sucesso
 *   400 { error: ... }         – payload inválido
 *   401 { error: "Invalid signature" } – assinatura não confere
 *   500 { error: ... }         – erro interno
 */

import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-webhook-signature",
  "Access-Control-Max-Age": "86400",
};

const payloadSchema = z.object({
  raised: z.number().nonnegative(),
  goal: z.number().positive().optional(),
  donors: z.number().int().nonnegative(),
  organizations: z.number().int().nonnegative(),
});

function json(body: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...extra },
  });
}

export const Route = createFileRoute("/api/public/campaign-stats")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: corsHeaders }),

      GET: async () => {
        const { createClient } = await import("@supabase/supabase-js");
        const supabase = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data, error } = await supabase
          .from("campaign_stats")
          .select("raised, goal, donors, organizations, updated_at")
          .eq("id", "singleton")
          .maybeSingle();
        if (error) return json({ error: error.message }, 500);
        return json(data ?? {}, 200, { "Cache-Control": "public, max-age=10" });
      },

      POST: async ({ request }) => {
        const secret = process.env.LEOLAM_WEBHOOK_SECRET;
        if (!secret) return json({ error: "Webhook secret not configured" }, 500);

        const signatureHeader = request.headers.get("x-webhook-signature") ?? "";
        const rawBody = await request.text();

        const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
        const sig = Buffer.from(signatureHeader, "utf8");
        const exp = Buffer.from(expected, "utf8");
        if (sig.length !== exp.length || !timingSafeEqual(sig, exp)) {
          return json({ error: "Invalid signature" }, 401);
        }

        let parsed;
        try {
          parsed = payloadSchema.parse(JSON.parse(rawBody));
        } catch (e) {
          return json({ error: "Invalid payload", details: String(e) }, 400);
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin
          .from("campaign_stats")
          .upsert(
            {
              id: "singleton",
              raised: parsed.raised,
              goal: parsed.goal ?? 1_000_000,
              donors: parsed.donors,
              organizations: parsed.organizations,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" },
          );
        if (error) return json({ error: error.message }, 500);
        return json({ ok: true });
      },
    },
  },
});
