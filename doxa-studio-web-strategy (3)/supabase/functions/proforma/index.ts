import { createClient } from "npm:@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const clean = (value: unknown, max = 4000) =>
  String(value ?? "").trim().slice(0, max);

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!,
  );

const tokenHash = async (token: string) => {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const createToken = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return [...bytes].map((x) => x.toString(16).padStart(2, "0")).join("");
};

const adminDb = () => {
  const url = Deno.env.get("SUPABASE_URL");
  let secret = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!secret) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
      secret = keys.default;
    } catch {
      secret = undefined;
    }
  }
  if (!url || !secret) throw new Error("Supabase server secrets are not configured.");
  return createClient(url, secret, { auth: { persistSession: false } });
};

async function sendEmail(params: Record<string, unknown>) {
  const key = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!key || !from) throw new Error("Resend is not configured on the server.");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...params, from }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    console.error("Resend error", result);
    throw new Error("L'envoi d'email a échoué. Vérifiez le domaine et la clé Resend.");
  }
  return result as { id?: string };
}

function makeApprovalUrl(id: string, token: string) {
  const site = Deno.env.get("DOXA_SITE_URL");
  if (!site) throw new Error("DOXA_SITE_URL is not configured on the server.");
  const url = new URL(site);
  url.searchParams.set("proforma", id);
  url.searchParams.set("token", token);
  return url.toString();
}

const formatXof = (amount: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " FCFA";

function pdfText(value: string) {
  return value
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[’]/g, "'")
    .replace(/€/g, "EUR")
    .replace(/\u202f/g, " ")
    .replace(/[^\u0000-\u00ff]/g, "?");
}

async function makePdf(quote: Record<string, unknown>, lines: QuoteLine[], total: number) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Facture pro forma ${quote.quote_number}`);
  pdf.setAuthor("Doxa Studio");
  pdf.setSubject("Facture pro forma - devis client");
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageSize: [number, number] = [595.28, 841.89];
  const red = rgb(0.88, 0.08, 0.08);
  const ink = rgb(0.08, 0.08, 0.09);
  const muted = rgb(0.38, 0.38, 0.4);
  const pale = rgb(0.96, 0.95, 0.93);
  const left = 44;
  const right = pageSize[0] - 44;
  let page = pdf.addPage(pageSize);
  let y = pageSize[1] - 52;

  const wrap = (text: string, fontSize: number, maxWidth: number, font = regular) => {
    const words = pdfText(text).split(/\s+/);
    const out: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, fontSize) > maxWidth && line) {
        out.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) out.push(line);
    return out;
  };

  const text = (value: string, x: number, yPos: number, size = 10, font = regular, color = ink) => {
    page.drawText(pdfText(value), { x, y: yPos, size, font, color });
  };

  const paragraph = (value: string, x: number, yPos: number, width: number, size = 9.5, leading = 14, font = regular, color = muted) => {
    let pos = yPos;
    for (const line of wrap(value, size, width, font)) {
      if (pos < 65) {
        page = pdf.addPage(pageSize);
        pos = pageSize[1] - 55;
      }
      text(line, x, pos, size, font, color);
      pos -= leading;
    }
    return pos;
  };

  const line = (yPos: number, color = rgb(0.85, 0.84, 0.81), thickness = 0.7) =>
    page.drawLine({ start: { x: left, y: yPos }, end: { x: right, y: yPos }, thickness, color });

  // Brand header.
  page.drawRectangle({ x: left, y: y - 18, width: 34, height: 34, color: ink });
  text("D", left + 11, y - 7, 18, bold, rgb(1, 1, 1));
  text("DOXA STUDIO", left + 44, y + 3, 16, bold, ink);
  text("ABIDJAN, COTE D'IVOIRE", left + 44, y - 11, 8.5, regular, muted);
  text("FACTURE PRO FORMA", 376, y + 4, 17, bold, red);
  text(`N° ${String(quote.quote_number)}`, 376, y - 12, 9.5, bold, ink);
  y -= 42;
  text(`Emise le ${new Date().toLocaleDateString("fr-FR")}`, 376, y, 8.5, regular, muted);
  text("Devis valable 30 jours", 376, y - 12, 8.5, regular, muted);
  y -= 25;
  line(y, ink, 1.6);
  y -= 24;

  text("CLIENT", left, y, 8, bold, red);
  y -= 15;
  text(String(quote.client_name), left, y, 11, bold, ink);
  y -= 14;
  if (quote.client_company) {
    text(String(quote.client_company), left, y, 9.5, regular, muted);
    y -= 13;
  }
  text(String(quote.client_email), left, y, 9, regular, muted);
  y -= 26;

  page.drawRectangle({ x: left, y: y - 56, width: right - left, height: 64, color: pale });
  text("INTENTION DU PROJET", left + 12, y - 8, 8, bold, red);
  const intentionEnd = paragraph(String(quote.intention), left + 12, y - 24, right - left - 24, 9, 12, regular, ink);
  y = Math.min(y - 76, intentionEnd - 14);

  // Item table.
  if (y < 230) {
    page = pdf.addPage(pageSize);
    y = pageSize[1] - 55;
  }
  page.drawRectangle({ x: left, y: y - 19, width: right - left, height: 22, color: ink });
  text("PRESTATION", left + 9, y - 11, 8, bold, rgb(1, 1, 1));
  text("DESCRIPTION", 232, y - 11, 8, bold, rgb(1, 1, 1));
  text("MONTANT", 474, y - 11, 8, bold, rgb(1, 1, 1));
  y -= 29;

  for (const item of lines) {
    const descriptionLines = wrap(item.description || "Prestation selon le brief valide", 8.5, 230);
    const rowHeight = Math.max(30, descriptionLines.length * 11 + 16);
    if (y - rowHeight < 135) {
      page = pdf.addPage(pageSize);
      y = pageSize[1] - 55;
    }
    text(item.label, left + 9, y - 10, 9, bold, ink);
    let dy = y - 10;
    for (const description of descriptionLines) {
      text(description, 232, dy, 8.5, regular, muted);
      dy -= 11;
    }
    const amountText = formatXof(item.amount);
    const amountW = regular.widthOfTextAtSize(pdfText(amountText), 9);
    text(amountText, right - 9 - amountW, y - 10, 9, regular, ink);
    y -= rowHeight;
    line(y, rgb(0.9, 0.89, 0.87));
  }

  y -= 22;
  text("TOTAL A PAYER", 360, y, 9, bold, muted);
  const totalText = formatXof(total);
  text(totalText, right - bold.widthOfTextAtSize(pdfText(totalText), 15), y - 21, 15, bold, red);
  y -= 47;

  if (y < 110) {
    page = pdf.addPage(pageSize);
    y = pageSize[1] - 55;
  }
  page.drawRectangle({ x: left, y: y - 44, width: right - left, height: 50, color: pale });
  text("CONDITIONS", left + 10, y - 9, 7.5, bold, muted);
  paragraph(
    "Cette facture pro forma confirme l'estimation decrite ci-dessus. La production debute apres validation du devis et accord sur les modalites de paiement. Document genere par Doxa Studio, Abidjan, Cote d'Ivoire.",
    left + 10,
    y - 24,
    right - left - 20,
    8,
    10,
    regular,
    muted,
  );

  for (const p of pdf.getPages()) {
    p.drawLine({ start: { x: left, y: 35 }, end: { x: right, y: 35 }, thickness: 0.6, color: rgb(0.85, 0.84, 0.81) });
    p.drawText("DOXA STUDIO  |  ABIDJAN, COTE D'IVOIRE  |  gondodanjaures@gmail.com", {
      x: left,
      y: 21,
      size: 7.5,
      font: regular,
      color: muted,
    });
    p.drawText(`Ref. ${String(quote.quote_number)}`, {
      x: 465,
      y: 21,
      size: 7.5,
      font: regular,
      color: muted,
    });
  }

  return await pdf.save();
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function resend(params: Record<string, unknown>) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) throw new Error("Le service d'email Resend n'est pas configure.");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ ...params, from }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("Resend error", data);
    throw new Error("Envoi email impossible. Verifiez le domaine d'expedition Resend.");
  }
  return data;
}

async function sha256(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function reply(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors(), "Content-Type": "application/json" },
  });
}

function escapeHtml(input: string) {
  return input.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function main(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors() });
  if (req.method !== "POST") return reply({ error: "Method not allowed." }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  let serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!serviceKey) {
    try {
      const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
      serviceKey = keys.default;
    } catch {
      serviceKey = undefined;
    }
  }
  const adminEmail = Deno.env.get("DOXA_ADMIN_EMAIL") ?? "gondodanjaures@gmail.com";
  const siteUrl = Deno.env.get("DOXA_SITE_URL");
  if (!supabaseUrl || !serviceKey || !siteUrl) {
    return reply({ error: "La fonction pro forma n'est pas configuree cote serveur." }, 503);
  }

  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return reply({ error: "Requete invalide." }, 400);
  }

  try {
    if (body.action === "health") {
      return reply({
        ok: true,
        configured: Boolean(
          Deno.env.get("RESEND_API_KEY") &&
            Deno.env.get("RESEND_FROM_EMAIL") &&
            Deno.env.get("DOXA_SITE_URL"),
        ),
      });
    }

    if (body.action === "request") {
      // Honeypot: bots that fill the hidden field get a fake success.
      if (clean(body.website, 200)) return reply({ ok: true });
      const name = clean(body.name, 160);
      const email = clean(body.email, 254).toLowerCase();
      const company = clean(body.company, 200);
      const intention = clean(body.intention, 5000);
      const needs = Array.isArray(body.needs)
        ? [...new Set(body.needs.map((n) => clean(n, 100)).filter(Boolean))].slice(0, 12)
        : [];

      if (name.length < 2) return reply({ error: "Indiquez votre nom complet." }, 400);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: "Adresse email invalide." }, 400);
      if (intention.length < 80) return reply({ error: "Decrivez votre intention en au moins 80 caracteres." }, 400);
      if (needs.length === 0) return reply({ error: "Choisissez au moins une expertise." }, 400);

      const id = crypto.randomUUID();
      const number = `PF-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`;
      const token = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const hash = await sha256(token);

      const { error: insertError } = await supabase.from("proforma_requests").insert({
        id,
        quote_number: number,
        client_name: name,
        client_email: email,
        client_company: company,
        needs,
        intention,
        status: "pending",
        approval_token_hash: hash,
        token_expires_at: expires,
      });
      if (insertError) {
        console.error("Quote insert error", insertError);
        return reply({ error: "Impossible d'enregistrer la demande. Reessayez ou contactez-nous directement." }, 500);
      }

      const approvalUrl = new URL(siteUrl);
      approvalUrl.searchParams.set("proforma", id);
      approvalUrl.searchParams.set("token", token);

      await resend({
        to: [adminEmail],
        subject: `Action requise - Demande de devis ${number} - ${name}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#16161a">
            <div style="background:#0b0b0b;padding:24px;color:#fff"><b style="font-size:22px">DOXA <span style="color:#ff2a2a">STUDIO</span></b></div>
            <div style="padding:28px;border:1px solid #eee">
              <p style="color:#e11414;font-size:12px;font-weight:bold;letter-spacing:2px">NOUVELLE DEMANDE DE DEVIS</p>
              <h1 style="font-size:24px">${escapeHtml(number)} - ${escapeHtml(name)}</h1>
              <p><b>Client :</b> ${escapeHtml(name)} ${company ? `(${escapeHtml(company)})` : ""}<br><b>Email :</b> ${escapeHtml(email)}</p>
              <p><b>Expertises :</b> ${needs.map(escapeHtml).join(" · ")}</p>
              <div style="background:#f5f4f0;padding:16px;border-left:3px solid #e11414;white-space:pre-wrap">${escapeHtml(intention)}</div>
              <p style="margin-top:24px">Ouvrez la demande, renseignez vos prix et validez : la facture PDF sera envoyee automatiquement au client.</p>
              <a href="${approvalUrl.toString()}" style="display:inline-block;background:#e11414;color:white;text-decoration:none;padding:14px 24px;border-radius:24px;font-weight:bold">OUVRIR ET CHIFFRER LA DEMANDE</a>
              <p style="font-size:12px;color:#777;margin-top:16px">Ce lien prive expire dans 7 jours et ne peut etre utilise qu'une fois.</p>
            </div>
          </div>`,
      });

      // Client receives confirmation only; the final invoice follows admin approval.
      await resend({
        to: [email],
        subject: `Votre demande de devis Doxa Studio - ${number}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#16161a">
            <h2>Bonjour ${escapeHtml(name)},</h2>
            <p>Nous avons bien recu votre demande <b>${escapeHtml(number)}</b>.</p>
            <p>Notre equipe etudie votre brief et vous enverra la facture pro forma PDF apres validation du chiffrage.</p>
            <p><b>Expertises :</b> ${needs.map(escapeHtml).join(" · ")}</p>
            <p>Nous vous recontactons sous 24 heures ouvrees.</p>
            <p>Doxa Studio<br>Abidjan, Cote d'Ivoire</p>
          </div>`,
      });

      return reply({ ok: true, number });
    }

    if (body.action === "read") {
      const id = clean(body.id, 80);
      const token = clean(body.token, 200);
      if (!id || !token) return reply({ error: "Lien de validation incomplet." }, 400);
      const hash = await sha256(token);
      const { data, error } = await supabase
        .from("proforma_requests")
        .select("id,quote_number,client_name,client_email,client_company,needs,intention,status,token_expires_at,created_at")
        .eq("id", id)
        .eq("approval_token_hash", hash)
        .eq("status", "pending")
        .maybeSingle();
      if (error || !data) return reply({ error: "Lien invalide, expire ou deja utilise." }, 404);
      if (new Date(data.token_expires_at).getTime() < Date.now()) {
        await supabase.from("proforma_requests").update({ status: "expired", approval_token_hash: null }).eq("id", id);
        return reply({ error: "Ce lien a expire. Demandez au client de soumettre une nouvelle demande." }, 410);
      }
      return reply({ quote: data });
    }

    if (body.action === "approve") {
      const id = clean(body.id, 80);
      const token = clean(body.token, 200);
      const items = Array.isArray(body.items) ? body.items as QuoteLine[] : [];
      const validUntil = clean(body.validUntil, 40) || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
      if (!id || !token || !items.length) return reply({ error: "Renseignez au moins une ligne de prix." }, 400);
      if (items.length > 12 || items.some((i) => !clean(i.label, 120) || !Number.isSafeInteger(i.amount) || i.amount <= 0)) {
        return reply({ error: "Chaque prestation doit avoir un montant entier positif en FCFA." }, 400);
      }
      const hash = await sha256(token);
      const { data: quote, error: quoteError } = await supabase
        .from("proforma_requests")
        .select("*")
        .eq("id", id)
        .eq("approval_token_hash", hash)
        .eq("status", "pending")
        .maybeSingle();
      if (quoteError || !quote) return reply({ error: "Lien invalide ou deja utilise." }, 404);
      if (new Date(quote.token_expires_at).getTime() < Date.now()) return reply({ error: "Lien de validation expire." }, 410);

      const needs = quote.needs as string[];
      if (needs.length !== items.length || needs.some((n) => !items.some((i) => i.label === n))) {
        return reply({ error: "Ajoutez un prix pour chaque expertise demandee, sans en omettre." }, 400);
      }
      const total = items.reduce((sum, item) => sum + item.amount, 0);
      const { data: claimed, error: claimError } = await supabase
        .from("proforma_requests")
        .update({ status: "processing" })
        .eq("id", id)
        .eq("approval_token_hash", hash)
        .eq("status", "pending")
        .select("id")
        .maybeSingle();
      if (claimError || !claimed) return reply({ error: "Cette demande est deja en cours de traitement." }, 409);

      try {
        const pdfBytes = await makePdf(quote, items, total);
        const pdf64 = bytesToBase64(pdfBytes);
        const attachmentName = `${quote.quote_number}-Doxa-Studio.pdf`;
        const validDate = new Date(validUntil + "T00:00:00").toLocaleDateString("fr-FR");
        const emailResult = await resend({
          to: [quote.client_email],
          subject: `Votre facture pro forma ${quote.quote_number} - Doxa Studio`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:640px;margin:auto;color:#16161a">
              <div style="background:#0b0b0b;padding:24px;color:#fff"><b style="font-size:22px">DOXA <span style="color:#ff2a2a">STUDIO</span></b></div>
              <div style="padding:28px;border:1px solid #eee">
                <p>Bonjour ${escapeHtml(quote.client_name)},</p>
                <h1 style="font-size:24px">Votre pro forma est prete.</h1>
                <p>Veuillez trouver en piece jointe la facture pro forma <b>${escapeHtml(quote.quote_number)}</b>, etablie selon votre brief.</p>
                <div style="background:#f5f4f0;padding:16px;border-left:3px solid #e11414">
                  <b>Total : ${escapeHtml(formatXof(total))}</b><br>
                  Valable jusqu'au ${escapeHtml(validDate)}
                </div>
                <p>Pour toute question ou pour confirmer le demarrage du projet, repondez directement a cet email.</p>
                <p>Doxa Studio<br>Abidjan, Cote d'Ivoire<br>gondodanjaures@gmail.com</p>
              </div>
            </div>`,
          attachments: [{ filename: attachmentName, content: pdf64, content_type: "application/pdf" }],
        }) as { id?: string };

        const { error: updateError } = await supabase
          .from("proforma_requests")
          .update({
            status: "approved",
            line_items: items,
            total_xof: total,
            approved_at: new Date().toISOString(),
            approval_token_hash: null,
            resend_email_id: emailResult.id ?? null,
          })
          .eq("id", id)
          .eq("status", "processing");
        if (updateError) throw new Error("Email envoye, mais la demande n'a pas pu etre finalisee en base.");
        return reply({ ok: true, number: quote.quote_number, total });
      } catch (error) {
        await supabase.from("proforma_requests").update({ status: "pending" }).eq("id", id).eq("status", "processing");
        throw error;
      }
    }

    return reply({ error: "Action inconnue." }, 400);
  } catch (error) {
    console.error("Proforma function error", error);
    return reply({ error: error instanceof Error ? error.message : "Erreur serveur." }, 500);
  }
}

Deno.serve(main);