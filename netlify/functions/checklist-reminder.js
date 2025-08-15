export const handler = async () => {
  const DISCORD = process.env.DISCORD_WEBHOOK_URL;
  const SLACK = process.env.SLACK_WEBHOOK_URL;
  const webhook = DISCORD || SLACK;

  const msg =
    `⏰ *Daily Checklist Reminder*\n` +
    `Please complete today's checklist: https://ohshaven.com/`;

  if (webhook) {
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DISCORD ? { content: msg } : { text: msg })
      });
    } catch (e) { console.error("Reminder webhook failed:", e); }
  }

  return { statusCode: 200, body: JSON.stringify({ ok:true }) };
};
