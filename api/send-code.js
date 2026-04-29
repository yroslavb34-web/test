const BOT_TOKEN = '7901382164:AAHlC2mn7iGO5jc01sHywQ9RyB-dVitSsEs';
const SUPABASE_URL = 'https://vznzoismzrtipowpfigu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6bnpvaXNtenJ0aXBvd3BmaWd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzczMTU3NzYsImV4cCI6MjA5Mjg5MTc3Nn0._qyN2g_nThgNtDv42kRsByk_D4TIDVTadWfvmbQdU68';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const cleanUsername = username.replace('@', '').trim().toLowerCase();

  // Ищем пользователя в Supabase
  const dbRes = await fetch(
    `${SUPABASE_URL}/rest/v1/telegram_users?username=eq.${cleanUsername}&select=tg_id`,
    { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
  );
  const dbData = await dbRes.json();

  let chatId = null;

  if (dbData && dbData.length > 0) {
    chatId = dbData[0].tg_id;
  } else {
    // Ищем через getUpdates
    const updRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`);
    const updData = await updRes.json();
    if (updData.ok) {
      for (const upd of updData.result) {
        const msg = upd.message || upd.callback_query?.message;
        if (msg?.from?.username?.toLowerCase() === cleanUsername) {
          chatId = msg.from.id;  // ИСПРАВЛЕНО
          break;
        }
      }
    }
  }

  if (!chatId) {
    return res.status(404).json({
      error: 'not_found',
      message: 'Сначала напишите боту /start в Telegram, затем попробуйте снова'
    });
  }

  // Генерируем 6-значный код
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // ИСПРАВЛЕНО

  // Сохраняем код в Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/auth_codes`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      tg_id: String(chatId),
      code,
      expires_at: expiresAt,
      username: cleanUsername
    })
  });

  // Отправляем код пользователю
  const text = `🔐 *Ваш код для входа в Jobic:*\n\n\`${code}\`\n\n_Код действителен 10 минут. Никому не сообщайте его._`;
  const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  });
  const tgData = await tgRes.json();

  if (!tgData.ok) {
    return res.status(500).json({ error: 'telegram_error', message: tgData.description });
  }

  return res.status(200).json({ ok: true, chatId: String(chatId) });
}
