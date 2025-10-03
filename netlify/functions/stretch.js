// /.netlify/functions/stretch.js
export async function handler() {
  const tips = [
    "Stand up, roll your shoulders, and look 20 seconds at something far.",
    "Neck: slow side stretches. Wrists: gentle circles. Breathe in and out.",
    "Check posture: feet flat, hips & knees ~90°, screen at eye level.",
    "Blink fast for 10 seconds to re-wet eyes. Relax jaw and drop shoulders.",
    "Reposition: change angle, adjust chair height, uncross legs."
  ];
  const tip = tips[Math.floor(Math.random() * tips.length)];
  return { statusCode: 200, headers:{'Content-Type':'application/json'}, body: JSON.stringify({ message: tip }) };
}
