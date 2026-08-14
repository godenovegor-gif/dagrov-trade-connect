import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  company: z.string().trim().max(150).optional().default(""),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(7).max(40),
  message: z.string().trim().min(2).max(2000),
  lang: z.enum(["ru", "en"]).optional().default("ru"),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: unknown;
        try {
          payload = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        const parsed = schema.safeParse(payload);
        if (!parsed.success) {
          return json({ ok: false, error: "validation_failed" }, 400);
        }

        const data = parsed.data;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { error } = await supabaseAdmin.from("contact_requests").insert({
          name: data.name,
          company: data.company || null,
          email: data.email,
          phone: data.phone,
          message: data.message,
          lang: data.lang,
          user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? null,
        });

        if (error) {
          console.error("contact_requests insert failed", error.message);
          return json({ ok: false, error: "storage_failed" }, 500);
        }

        return json({ ok: true });
      },
    },
  },
});
