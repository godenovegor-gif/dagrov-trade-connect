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

        const resendKey = process.env["RESEND_API_KEY"];
        if (!resendKey) {
          console.error("RESEND_API_KEY is not configured");
          return json({ ok: false, error: "email_not_configured" }, 500);
        }

        const from = process.env["CONTACT_FROM_EMAIL"] || "DAGROV TRADE <onboarding@resend.dev>";
        const to = process.env["CONTACT_TO_EMAIL"] || "dtcompany@inbox.ru";

        const row = (label: string, value: string) =>
          `<tr><td style="padding:10px 16px;border-bottom:1px solid #eae6d9;color:#6b6a5e;font:600 13px Helvetica,Arial,sans-serif;white-space:nowrap">${label}</td><td style="padding:10px 16px;border-bottom:1px solid #eae6d9;color:#20240f;font:400 14px Helvetica,Arial,sans-serif">${esc(value)}</td></tr>`;

        const html = `<div style="background:#f4f1e6;padding:28px">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #eae6d9">
    <div style="background:#4d5622;padding:20px 24px;color:#ffffff;font:700 18px Helvetica,Arial,sans-serif">DAGROV TRADE — новая заявка</div>
    <table style="width:100%;border-collapse:collapse">
      ${row("Имя", data.name)}
      ${row("Компания", data.company || "—")}
      ${row("Email", data.email)}
      ${row("Телефон", data.phone)}
      ${row("Язык", data.lang.toUpperCase())}
    </table>
    <div style="padding:16px 24px">
      <div style="color:#6b6a5e;font:600 13px Helvetica,Arial,sans-serif;margin-bottom:6px">Сообщение</div>
      <div style="color:#20240f;font:400 14px/1.6 Helvetica,Arial,sans-serif;white-space:pre-wrap">${esc(data.message)}</div>
    </div>
    <div style="padding:14px 24px;background:#f8f7f2;color:#6b6a5e;font:400 12px Helvetica,Arial,sans-serif">Отправлено с сайта dagrovtrade</div>
  </div>
</div>`;

        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from,
            to: [to],
            reply_to: data.email,
            subject: `Новая заявка: ${data.name}${data.company ? ` (${data.company})` : ""}`,
            html,
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`Resend send failed [${res.status}]: ${body}`);
          return json({ ok: false, error: "email_failed" }, 502);
        }

        return json({ ok: true });

      },
    },
  },
});
