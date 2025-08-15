function isoDaysAgo(n){ return new Date(Date.now() - n*86400000).toISOString(); }

export const handler = async () => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;
  const DISCORD = process.env.DISCORD_WEBHOOK_URL;
  const SLACK = process.env.SLACK_WEBHOOK_URL;
  const webhook = DISCORD || SLACK;

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    if (webhook){
      const txt = "📊 Weekly Summary: DB not configured yet. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE.";
      await fetch(webhook, { method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(DISCORD ? { content: txt } : { text: txt }) }).catch(()=>{});
    }
    return { statusCode: 200, body: JSON.stringify({ ok:true, note:"no-db" }) };
  }

  const since = isoDaysAgo(7);
  const url = `${SUPABASE_URL}/rest/v1/checklist_submissions?select=org,site,noncompliance_count,score,total,created_at&created_at=gte.${since}`;

  const res = await fetch(url, {
    headers: {
      "apikey": SUPABASE_SERVICE_ROLE,
      "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE}`
    }
  });
  if (!res.ok) return { statusCode: 500, body: "fetch-failed" };
  const rows = await res.json();

  const key = r => `${r.org||"Unknown"}|${r.site||"Unknown"}`;
  const map = new Map();
  for (const r of rows) {
    const k = key(r);
    if (!map.has(k)) map.set(k, { org: r.org||"Unknown", site: r.site||"Unknown", score:0, total:0, noncomp:0, count:0 });
    const m = map.get(k);
    m.score += (r.score||0);
    m.total += (r.total||0);
    m.noncomp += (r.noncompliance_count||0);
    m.count += 1;
  }

  const lines = [];
  for (const {org,site,score,total,noncomp,count} of map.values()) {
    const pct = total ? Math.round(100*score/total) : 0;
    lines.push(`• ${org} / ${site}: ${pct}% (${score}/${total}) • NLIs: ${noncomp} • Runs: ${count}`);
  }
  const summary = lines.length
    ? `📊 *Weekly Compliance Summary* (last 7 days)\n${lines.join("\n")}`
    : "📊 Weekly Compliance Summary: no submissions in the last 7 days.";

  if (webhook) {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(DISCORD ? { content: summary } : { text: summary })
    }).catch(()=>{});
  }

  return { statusCode: 200, body: JSON.stringify({ ok:true, lines: lines.length }) };
};
