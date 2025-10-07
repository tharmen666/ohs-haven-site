// netlify/functions/submission-created.js
export default async (req, context) => {
  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await req.json(); // Netlify sends JSON with payload + data
    const { payload } = body || {};
    if (!payload) return new Response('No payload', { status: 400 });

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM = process.env.FROM_EMAIL || 'info@ohshaven.com';
    const NOTIFY = (process.env.NOTIFY_TO || 'info@ohshaven.com, tharmendesigan36@gmail.com')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (!RESEND_API_KEY) {
      // Soft-success so form still works even if email isn’t configured
      return new Response('Missing RESEND_API_KEY; skipping mail', { status: 200 });
    }

    const formName = (payload.form_name || payload.form_name || '').toLowerCase();
    const data = payload.data || {};
    const submitterEmail =
      data.email || data.Email || data.user_email || '';

    const subject =
      formName === 'contact'
        ? `New contact: ${data.name || 'Visitor'}`
        : formName === 'daily-checklist'
        ? `Daily checklist — ${data.site || 'Unknown Site'} (${data.shift || ''})`
        : `New form: ${formName}`;

    const rows = Object.entries(data)
      .map(([k, v]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;background:#fafafa">${k}</td><td style="padding:6px 10px;border:1px solid #e5e7eb">${String(v || '')}</td></tr>`)
      .join('');

    const adminHtml = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <tr><td style="background:#0b1c2e;color:#fff;padding:14px 18px;border-bottom:2px solid #FF6A00">
            <div style="font-weight:900;font-size:18px">OHS Haven</div>
            <div style="color:#9fb4c9;font-size:13px">New ${formName} submission</div>
          </td></tr>
          <tr><td style="padding:0">
            <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table>
          </td></tr>
          <tr><td style="padding:14px 18px">
            <div style="font-size:12px;color:#6b7280">Form: ${formName} • Path: ${payload.url || ''}</div>
          </td></tr>
          <tr><td style="background:#0b1626;color:#9fb4c9;padding:12px 18px;font-size:12px">
            © 2025 OHS Haven • Auto-email by Netlify + Resend
          </td></tr>
        </table>
      </div>
    `;

    // Send admin alert (one email per NOTIFY)
    for (const recipient of NOTIFY) {
      await sendEmail(RESEND_API_KEY, {
        from: `OHS Haven <${FROM}>`,
        to: recipient,
        subject,
        html: adminHtml
      });
    }

    // Send visitor receipt (if they gave an email)
    if (submitterEmail && /@/.test(submitterEmail)) {
      const receiptHtml = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
          <table width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
            <tr><td style="background:#0b1c2e;color:#fff;padding:14px 18px;border-bottom:2px solid #FF6A00">
              <div style="font-weight:900;font-size:18px">OHS Haven</div>
              <div style="color:#9fb4c9;font-size:13px">Thanks — we received your ${formName} submission</div>
            </td></tr>
            <tr><td style="padding:16px">
              <p>Hi ${escapeHtml(data.name || '').trim() || 'there'},</p>
              <p>Thanks for getting in touch. We’ve received your details and will respond ASAP. A copy is below:</p>
              <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden">
                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse">${rows}</table>
              </div>
              <p style="margin-top:14px">Need something urgent? WhatsApp us: +27 71 123 4567</p>
            </td></tr>
            <tr><td style="background:#0b1626;color:#9fb4c9;padding:12px 18px;font-size:12px">
              © 2025 OHS Haven
            </td></tr>
          </table>
        </div>
      `;
      await sendEmail(RESEND_API_KEY, {
        from: `OHS Haven <${FROM}>`,
        to: submitterEmail,
        subject: `OHS Haven — ${formName} received`,
        html: receiptHtml
      });
    }

    return new Response('OK', { status: 200 });
  } catch (e) {
    // Don’t fail the form—log and return OK
    return new Response(`Skipped mail: ${e.message}`, { status: 200 });
  }
};

function escapeHtml(str='') {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;');
}

async function sendEmail(API_KEY, payload){
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}
