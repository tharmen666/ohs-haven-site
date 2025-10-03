// netlify/functions/submission-created.js
// Fires automatically on every Netlify Forms submission.
// Sends you an email (via Netlify Emails add-on) and optionally a Slack ping.

export async function handler(event) {
  try {
    const payload = JSON.parse(event.body);
    const form = payload?.payload?.form_name || 'unknown';
    const data = payload?.payload?.data || {};
    const when = new Date().toLocaleString();

    // Build a readable summary
    const pairs = Object.entries(data).map(([k,v]) => `• ${k}: ${v}`).join('\n');
    const subject = `✅ ${form} submitted`;
    const text =
`Form: ${form}
When: ${when}

${pairs}

— OHS Haven (Netlify Forms event)`;

    // --- 1) Email via Netlify Emails add-on (recommended)
    // Set NOTIFY_TO in Netlify env vars (comma separated for multiple recipients)
    const recipientsCSV = process.env.NOTIFY_TO || '';
    if (recipientsCSV) {
      const recipients = recipientsCSV.split(',').map(s => s.trim()).filter(Boolean);
      try {
        const { send } = await import('@netlify/emails');
        // Send to each recipient (simplest & reliable)
        for (const to of recipients) {
          await send({
            from: 'no-reply@ohshaven.com',
            to,
            subject,
            text
          });
        }
        console.log('[MELLY] Email sent to:', recipients.join(', '));
      } catch (e) {
        console.log('[MELLY] Netlify Emails not enabled or package missing. Skipping email.', e?.message || e);
      }
    } else {
      console.log('[MELLY] NOTIFY_TO env var not set — no email sent.');
    }

    // --- 2) Optional Slack ping (set SLACK_WEBHOOK_URL if you want this too)
    const slack = process.env.SLACK_WEBHOOK_URL;
    if (slack) {
      await fetch(slack, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: `New *${form}* submission:\n${pairs}` })
      });
      console.log('[MELLY] Slack ping sent');
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('[MELLY] submission-created error', err);
    return { statusCode: 200, body: JSON.stringify({ ok: false, error: String(err) }) };
  }
}
