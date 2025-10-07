// netlify/functions/ping-email.js
export default async (req, context) => {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const FROM = process.env.FROM_EMAIL || 'info@ohshaven.com';
    const TO = (process.env.NOTIFY_TO || 'info@ohshaven.com, tharmendesigan36@gmail.com')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (!RESEND_API_KEY) {
      return new Response('Missing RESEND_API_KEY env var', { status: 500 });
    }

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif">
        <table width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
          <tr><td style="background:#0b1c2e;color:#fff;padding:14px 18px;border-bottom:2px solid #FF6A00">
            <div style="font-weight:900;font-size:18px">OHS Haven</div>
            <div style="color:#9fb4c9;font-size:13px">Ping from Netlify function</div>
          </td></tr>
          <tr><td style="padding:18px">
            <p>It works. Resend is sending from <b>${FROM}</b>.</p>
            <p>Time: ${new Date().toLocaleString()}</p>
          </td></tr>
          <tr><td style="background:#0b1626;color:#9fb4c9;padding:12px 18px;font-size:12px">
            © 2025 OHS Haven
          </td></tr>
        </table>
      </div>
    `;

    // Send one email per recipient (keeps headers clean)
    const results = [];
    for (const recipient of TO) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `OHS Haven <${FROM}>`,
          to: recipient,
          subject: 'OHS Haven • Ping OK',
          html
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(json));
      results.push(json.id || 'ok');
    }

    return new Response(`OK — sent ${results.length} email(s)`, { status: 200 });
  } catch (e) {
    return new Response(`Ping failed: ${e.message}`, { status: 500 });
  }
};
