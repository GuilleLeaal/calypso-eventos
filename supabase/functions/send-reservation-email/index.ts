import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ReservationEmailPayload = {
  reservation_id?: string;
  customer_name?: string;
  event_type?: string;
  phone?: string;
  email?: string;
  event_date?: string;
  event_date_label?: string;
  slot_label?: string;
  start_time?: string;
  end_time?: string;
  children_count?: number;
  adults_count?: number;
  discovery_source?: string;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const toEmail = Deno.env.get("RESERVATION_NOTIFICATION_TO") ||
      "santiagorivas2002@gmail.com";
    const fromEmail = Deno.env.get("RESERVATION_NOTIFICATION_FROM") ||
      "Calypso Eventos <onboarding@resend.dev>";

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY secret.");
    }

    const payload = (await req.json()) as ReservationEmailPayload;

    const customerName = payload.customer_name || "Cliente sin nombre";
    const dateLabel = payload.event_date_label || payload.event_date || "No indicada";
    const slotLabel = payload.slot_label ||
      `${payload.start_time || ""} a ${payload.end_time || ""}`.trim();

    const childrenCount = Number(payload.children_count ?? 0);
    const adultsCount = Number(payload.adults_count ?? 0);
    const totalGuests = childrenCount + adultsCount;

    const subject = `Nueva reserva Calypso - ${customerName}`;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #2f241e; line-height: 1.5;">
        <h2 style="margin-bottom: 12px;">Nueva solicitud de reserva</h2>
        <p>Se creó una nueva solicitud de reserva desde la web de Calypso Eventos.</p>

        <table style="border-collapse: collapse; width: 100%; max-width: 620px; margin-top: 18px;">
          <tbody>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Cliente</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(customerName)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Evento</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(payload.event_type || "No indicado")}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Fecha</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(dateLabel)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Horario</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(slotLabel)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Niños</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(childrenCount)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Adultos</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(adultsCount)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Total invitados</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(totalGuests)}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Teléfono</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(payload.phone || "No indicado")}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Email</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(payload.email || "No indicado")}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>Cómo conoció Calypso</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(payload.discovery_source || "No indicado")}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e4cfad;"><b>ID reserva</b></td><td style="padding: 8px; border: 1px solid #e4cfad;">${escapeHtml(payload.reservation_id || "No indicado")}</td></tr>
          </tbody>
        </table>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: "Email provider error", details: result }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ ok: true, result }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("send-reservation-email error:", error);

    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
