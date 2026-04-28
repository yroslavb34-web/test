const SUPABASE_URL = 'https://vznzoismzrtipowpfigu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y_5SAlZERayUWeg3sWe4Nw_v7ri5VFS';
const BOT_TOKEN = '7901382164:AAHlC2mn7iGO5jc01sHywQ9RyB-dVitSsEs';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { chatId, code } = req.body;
  if (!chatId || !code) return res.status(400).json({ error: 'chatId and code required' });

  const dbRes = await fetch(
    `${SUPABASE_URL}/rest/v1/auth_codes?tg_id=eq.${chatId}&code=eq.${code}&select=*`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const rows = await dbRes.json();

  if (!rows || rows.length === 0) {
    return res.status(400).json({ error: 'invalid_code', message: 'Неверный код' });
  }

  const row = rows[0];
  if (new Date(row.expires_at) < new Date()) {
    return res.status(400).json({ error: 'expired_code', message: 'Код истёк, запросите новый' });
  }

  await fetch(`${SUPABASE_URL}/rest/v1/auth_codes?tg_id=eq.${chatId}`, {
    method: 'DELETE',
    headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
  });

  let userInfo = { id: chatId, username: row.username, first_name: row.username };
  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=${chatId}`);
    const tgData = await tgRes.json();
    if (tgData.ok) {
      userInfo = {
        id: tgData.result.id,
        username: tgData.result.username || row.username,
        first_name: tgData.result.first_name || row.username,
        last_name: tgData.result.last_name || ''
      };
    }
  } catch(e) {}

  // Сохраняем пользователя в telegram_users
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/telegram_users`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({
        tg_id: String(userInfo.id),
        username: userInfo.username || row.username,
        full_name: [userInfo.first_name, userInfo.last_name].filter(Boolean).join(' '),
        first_name: userInfo.first_name || '',
        last_name: userInfo.last_name || ''
      })
    });
  } catch(e) {}

  return res.status(200).json({ ok: true, user: userInfo });
}
