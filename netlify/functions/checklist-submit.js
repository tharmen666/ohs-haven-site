// netlify/functions/checklist-submit.js
export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const body = JSON.parse(event.body || '{}');

    // Optional: Discord/Slack alert
    const DISCORD = process.env.DISCORD_WEBHOOK_URL;
    const SLACK = process.env.SLACK_WEBHOOK_URL;
    const webhook = DISCORD || SLACK;
    if (webhook) {
      const summary =
        `📝 OHS Checklist: ${body.checklist_type || 'daily'}\n` +
        `🏢 ${body.org || 'Org ?'} • 📍 ${body.site || 'Site ?'}\n` +
        `✅ ${body.score ?? 0}/${body.total ?? 0}  •  ⚠️ ${body.noncompliance ?? 0}`;
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DISCORD ? { content: summary } : { text: summary })
      }).catch(() => {});
    }

    // Optional: Supabase persistence (auto-on when env vars exist)
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE) {
      const row = {
        org: body.org?.slice(0,120) || null,
        site: body.site?.slice(0,120) || null,
        checklist_type: body.checklist_type || 'daily',
        items: body.items || [],
        score: body.score ?? 0,
        total: body.total ?? 0,
        noncompliance_count: body.noncompliance ?? 0,
        ua: body.ua || null,
        path: body.path || null
      };
      const res = await fetch(`${SUPABASE_URL}/rest/v1/checklist_submissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE}`,
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(row)
      });
      if (!res.ok) console.error('DB insert failed:', await res.text());
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: 'Server error' };
  }
};
