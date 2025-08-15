// netlify/functions/daily-tip.js
// Runs on the schedule you set in netlify.toml (e.g. 05:00 UTC ≈ 07:00 SAST)

export const handler = async () => {
  // Rotate any tips you like here
  const tips = [
    "Check spill kits at shift start: seals intact, absorbents stocked, PPE correct sizes.",
    "Keep fire exits unlocked and clear — no ‘temporary’ boxes. Test the door swing.",
    "Log Near Loss Incidents (NLIs) daily — 1 minute now prevents a future incident.",
    "Three-point contact on ladders. Inspect feet, rungs, tags before use.",
    "Label all containers. No mystery liquids. Drips and stains mean investigate now.",
    "First-aid box: plasters, gloves, eye-wash within expiry, inventory card updated.",
    "Housekeeping = safety: dry floors, cables managed, spill signs removed when done.",
    "Decanting fuels/chems? Ventilated area, correct funnel, and absorbents within reach.",
    "PPE audit: correct gloves/visors for the task. Replace damaged gear immediately.",
    "Emergency numbers visible at phones and notice boards; test at least monthly."
  ];

  const tip = tips[Math.floor(Math.random() * tips.length)];
  const ranAt = new Date().toISOString();

  // Optional: send to Discord or Slack if a webhook is configured
  const DISCORD = process.env.DISCORD_WEBHOOK_URL;
  const SLACK = process.env.SLACK_WEBHOOK_URL;
  const webhook = DISCORD || SLACK;

  if (webhook) {
    const msg = `🟢 *OHS Daily Tip* (${ranAt})\n${tip}`;
    try {
      await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(DISCORD ? { content: msg } : { text: msg })
      });
    } catch (err) {
      // Don't fail the whole function if the webhook hiccups
      console.error("Webhook post failed:", err);
    }
  }

  // Function response (useful for manual test calls)
  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, tip, ranAt })
  };
};
