const NOTIFY_EMAIL = "reports@michellesanchezrealtor.info";
const MAX_BODY_BYTES = 32000;
const { randomUUID } = require("node:crypto");

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function clean(value, max = 1200) {
  return String(value == null ? "" : value)
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim()
    .slice(0, max);
}

function parseUrlEncoded(rawBody) {
  const params = new URLSearchParams(rawBody);
  const data = {};

  for (const [key, value] of params.entries()) {
    data[key] = value;
  }

  return data;
}

function collectBody(req) {
  return new Promise((resolve, reject) => {
    if (typeof req.body === "string") {
      resolve(req.body.slice(0, MAX_BODY_BYTES));
      return;
    }

    if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
      resolve(new URLSearchParams(req.body).toString());
      return;
    }

    const chunks = [];
    let size = 0;

    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large."));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk)));
    });

    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function makeOrderId() {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = randomUUID().split("-")[0].toUpperCase();
  return `MAYA-${stamp}-${suffix}`;
}

function buildRecord(fields, orderId) {
  const mlsNumber = clean(fields.mls_number, 40);
  const propertyAddress = clean(fields.property_address, 260);

  return {
    order_id: orderId,
    submitted_at: new Date().toISOString(),
    package_type: clean(fields.package_type, 80) || "Maya 24-Hour Listing Launch Pack",
    agent_name: clean(fields.agent_name, 120),
    agent_email: clean(fields.agent_email, 180).toLowerCase(),
    agent_phone: clean(fields.agent_phone, 80),
    mls_number: mlsNumber,
    property_address: propertyAddress,
    listing_price: clean(fields.listing_price, 80),
    go_live_date: clean(fields.go_live_date, 80),
    media_link: clean(fields.media_link, 600),
    preferred_cta: clean(fields.preferred_cta, 160),
    compliance_notes: clean(fields.compliance_notes, 1200),
    source: "maya-listing-launch-pack",
  };
}

function validate(record, fields) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (clean(fields.website_url)) {
    return { bot: true, errors: [] };
  }

  if (!record.agent_name) errors.push("Agent name is required.");
  if (!emailPattern.test(record.agent_email)) errors.push("A valid agent email is required.");
  if (!record.agent_phone) errors.push("Agent phone is required.");
  if (!record.mls_number && !record.property_address)
    errors.push("MLS number or property address is required.");
  if (!record.media_link)
    errors.push("A listing photos, video, Dropbox, Google Drive, or media link is required.");
  if (clean(fields.approval_ack) !== "yes") errors.push("Agent review acknowledgment is required.");

  return { bot: false, errors };
}

function asMailto(record) {
  const body = [
    `Order ID: ${record.order_id}`,
    `Package: ${record.package_type}`,
    `Agent name: ${record.agent_name}`,
    `Agent email: ${record.agent_email}`,
    `Agent phone: ${record.agent_phone}`,
    `MLS number: ${record.mls_number}`,
    `Property address: ${record.property_address}`,
    `Listing price: ${record.listing_price}`,
    `Go-live date: ${record.go_live_date}`,
    `Media link: ${record.media_link}`,
    `Preferred CTA: ${record.preferred_cta}`,
    "",
    "Brokerage/compliance notes:",
    record.compliance_notes,
  ].join("\n");

  return `mailto:${NOTIFY_EMAIL}?subject=${encodeURIComponent(`Maya Listing Launch Pack ${record.order_id}`)}&body=${encodeURIComponent(body)}`;
}

async function forwardToFormSubmit(record) {
  if (process.env.DISABLE_FORMSUBMIT === "true") {
    return { configured: false, ok: false };
  }

  const payload = new URLSearchParams({
    _subject: `Maya Listing Launch Pack ${record.order_id}`,
    _template: "table",
    _captcha: "false",
    _replyto: record.agent_email,
    order_id: record.order_id,
    package_type: record.package_type,
    agent_name: record.agent_name,
    agent_email: record.agent_email,
    agent_phone: record.agent_phone,
    mls_number: record.mls_number,
    property_address: record.property_address,
    listing_price: record.listing_price,
    go_live_date: record.go_live_date,
    media_link: record.media_link,
    preferred_cta: record.preferred_cta,
    compliance_notes: record.compliance_notes,
  });

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${NOTIFY_EMAIL}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        Origin: "https://maya-listing-launch-pack.vercel.app",
        Referer: "https://maya-listing-launch-pack.vercel.app/",
      },
      body: payload.toString(),
    });
    const text = await response.text();
    const pendingActivation = /needs activation|activate form/i.test(text);

    return {
      configured: true,
      ok: response.ok && !pendingActivation && !/"success"\s*:\s*"false"/i.test(text),
      pendingActivation,
      status: response.status,
      detail: text.slice(0, 300),
    };
  } catch {
    return {
      configured: true,
      ok: false,
      status: 0,
      detail: error instanceof Error ? error.message : "FormSubmit delivery failed.",
    };
  }
}

async function forwardToWebhook(record) {
  const webhookUrl = process.env.MAYA_INTAKE_WEBHOOK_URL;
  if (!webhookUrl) return { configured: false, ok: false };

  try {
    const headers = {
      "Content-Type": "application/json",
    };
    if (process.env.MAYA_INTAKE_WEBHOOK_SECRET) {
      headers["X-Maya-Webhook-Secret"] = process.env.MAYA_INTAKE_WEBHOOK_SECRET;
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(record),
    });

    return {
      configured: true,
      ok: response.ok,
      status: response.status,
      detail: await response
        .text()
        .then((value) => value.slice(0, 300))
        .catch(() => ""),
    };
  } catch {
    return {
      configured: true,
      ok: false,
      status: 0,
      detail: error instanceof Error ? error.message : "Webhook delivery failed.",
    };
  }
}

async function insertIntoSupabase(record) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) return { configured: false, ok: false };

  try {
    const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/maya_listing_launch_orders`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(record),
    });

    return {
      configured: true,
      ok: response.ok,
      status: response.status,
      detail: await response
        .text()
        .then((value) => value.slice(0, 300))
        .catch(() => ""),
    };
  } catch (error) {
    return {
      configured: true,
      ok: false,
      status: 0,
      detail: error instanceof Error ? error.message : "Supabase insert failed.",
    };
  }
}

function renderPage({ title, heading, message, record, mailto, results, errors }) {
  const resultItems = (results || [])
    .filter((result) => result.configured)
    .map((result) => {
      const label = escapeHtml(result.label);
      const status = result.ok
        ? "Connected"
        : result.pendingActivation
          ? "Activation required"
          : "Needs attention";
      return `<li><strong>${label}:</strong> ${status}${result.status ? ` (${result.status})` : ""}</li>`;
    })
    .join("");

  const errorItems = (errors || []).map((error) => `<li>${escapeHtml(error)}</li>`).join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        --bg: #070b12;
        --panel: rgba(15, 22, 34, 0.94);
        --text: #f7f3ea;
        --muted: #b8c4d5;
        --gold: #d8b468;
        --blue: #66d9ff;
        --line: rgba(255,255,255,.13);
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 20% 10%, rgba(102,217,255,.14), transparent 30rem), var(--bg);
        color: var(--text);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      main {
        width: min(760px, calc(100% - 32px));
        border: 1px solid var(--line);
        border-radius: 22px;
        padding: clamp(26px, 5vw, 46px);
        background: linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.025)), var(--panel);
        box-shadow: 0 30px 90px rgba(0,0,0,.38);
      }

      h1 {
        margin: 0;
        font-family: Georgia, "Times New Roman", serif;
        font-size: clamp(38px, 7vw, 68px);
        line-height: .95;
      }

      p, li {
        color: var(--muted);
        line-height: 1.55;
      }

      .order {
        margin: 20px 0;
        border: 1px solid rgba(216,180,104,.36);
        border-radius: 16px;
        padding: 18px;
        color: var(--gold);
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 24px;
      }

      a {
        display: inline-flex;
        min-height: 44px;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(102,217,255,.55);
        border-radius: 999px;
        padding: 0 18px;
        color: var(--blue);
        text-decoration: none;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
      }

      a.secondary {
        border-color: rgba(216,180,104,.58);
        color: var(--text);
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(heading)}</h1>
      ${record && record.order_id ? `<div class="order">Order ID: ${escapeHtml(record.order_id)}</div>` : ""}
      <p>${escapeHtml(message)}</p>
      ${errorItems ? `<ul>${errorItems}</ul>` : ""}
      ${resultItems ? `<ul>${resultItems}</ul>` : ""}
      ${
        results && results.some((result) => result.pendingActivation)
          ? `<p>Action required: the first intake submission triggered a FormSubmit activation email to ${NOTIFY_EMAIL}. Click that activation link once, then future listing packets can forward automatically.</p>`
          : ""
      }
      ${
        record
          ? `<p>The 24-hour clock starts after the listing packet is complete and the agent confirms review requirements.</p>`
          : ""
      }
      <div class="actions">
        ${mailto ? `<a href="${escapeHtml(mailto)}">Send Backup Email</a>` : ""}
        <a class="secondary" href="/">Back to Offer Page</a>
      </div>
    </main>
  </body>
</html>`;
}

async function handleIntake(req, res) {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Allow", "POST");
    res.end(
      renderPage({
        title: "Submit a Listing Pack",
        heading: "Use the intake form.",
        message: "This endpoint accepts listing packets from the public order form.",
      }),
    );
    return;
  }

  let fields;
  try {
    fields = parseUrlEncoded(await collectBody(req));
  } catch {
    res.statusCode = 413;
    res.end(
      renderPage({
        title: "Submission Too Large",
        heading: "Submission too large.",
        message:
          "The intake packet exceeded the current size limit. Use a media link instead of pasting long raw content.",
      }),
    );
    return;
  }

  const orderId = makeOrderId();
  const record = buildRecord(fields, orderId);
  const validation = validate(record, fields);

  if (validation.bot) {
    res.statusCode = 200;
    res.end(
      renderPage({
        title: "Submission Received",
        heading: "Submission received.",
        message: "Thank you. Your listing packet has been received.",
      }),
    );
    return;
  }

  if (validation.errors.length > 0) {
    res.statusCode = 400;
    res.end(
      renderPage({
        title: "Fix Listing Packet",
        heading: "Complete the required fields.",
        message: "A few required fields are missing before Maya can start the listing launch pack.",
        errors: validation.errors,
      }),
    );
    return;
  }

  const [formSubmit, webhook, supabase] = await Promise.all([
    forwardToFormSubmit(record),
    forwardToWebhook(record),
    insertIntoSupabase(record),
  ]);

  const results = [
    { label: "Email intake relay", ...formSubmit },
    { label: "Webhook automation", ...webhook },
    { label: "Supabase order log", ...supabase },
  ];
  const hasConnectedSink = results.some((result) => result.configured && result.ok);

  res.statusCode = hasConnectedSink ? 200 : 202;
  res.end(
    renderPage({
      title: hasConnectedSink ? "Listing Pack Submitted" : "Listing Packet Prepared",
      heading: hasConnectedSink
        ? "Your listing pack is in motion."
        : "Packet prepared. Finish the email backup.",
      message: hasConnectedSink
        ? "Maya generated an order ID and forwarded the listing packet to the intake workflow."
        : "The order ID was generated, but no delivery sink confirmed receipt. Use the backup email button so the lead is not lost.",
      record,
      mailto: asMailto(record),
      results,
    }),
  );
}

module.exports = function handler(req, res) {
  handleIntake(req, res).catch((error) => {
    const message = error instanceof Error ? error.message : "Unexpected intake error.";
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      renderPage({
        title: "Intake Error",
        heading: "Intake needs attention.",
        message:
          process.env.VERCEL_ENV === "production"
            ? "The intake endpoint hit a server error. Use the backup email path while the endpoint is reviewed."
            : `Development error: ${message}`,
      }),
    );
  });
};
