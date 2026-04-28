const BOT_TOKEN = '7901382164:AAHlC2mn7iGO5jc01sHywQ9RyB-dVitSsEs';
const SUPABASE_URL = 'https://vznzoismzrtipowpfigu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y_5SAlZERayUWeg3sWe4Nw_v7ri5VFS';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { jobId, jobTitle, jobCompany, applicantName, applicantContact, creatorId } = req.body;
  if (!creatorId) return res.status(200).json({ ok: true, skipped: 'no creatorId' });

  // Находим chat_id работодателя
  let chatId = null;

  // Если creatorId это tg_id напрямую
  if (/^\d+$/.test(creatorId)) {
    chatId = creatorId;
  } else {
    // Ищем в telegram_users
    const dbRes = await fetch(
      `${SUPABASE_URL}/rest/v1/telegram_users?tg_id=eq.${creatorId}&select=tg_id`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const rows = await dbRes.json();
    if (rows && rows.length > 0) chatId = rows[0].tg_id;
  }

  if (!chatId) return res.status(200).json({ ok: true, skipped: 'employer not found' });

  const text =
    `🔔 *Новый отклик на вашу вакансию!*\n\n` +
    `📋 *${jobTitle}* — ${jobCompany}\n\n` +
    `👤 *Кандидат:* ${applicantName}\n` +
    `📞 *Контакт:* ${applicantContact}\n\n` +
    `Свяжитесь с кандидатом как можно скорее 👍`;

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });

  return res.status(200).json({ ok: true });
}
