const BOT_TOKEN = '7901382164:AAHlC2mn7iGO5jc01sHywQ9RyB-dVitSsEs';
const SUPABASE_URL = 'https://vznzoismzrtipowpfigu.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Y_5SAlZERayUWeg3sWe4Nw_v7ri5VFS';
const APP_URL = 'https://test-lime-eight-15.vercel.app';

async function sendMessage(chat_id, text, extra = {}) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id, text, parse_mode: 'Markdown', ...extra })
  });
}

async function saveUser(user) {
  await fetch(`${SUPABASE_URL}/rest/v1/telegram_users`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({
      tg_id: String(user.id),
      username: user.username || `user_${user.id}`,
      full_name: [user.first_name, user.last_name].filter(Boolean).join(' ') || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      language_code: user.language_code || 'ru'
    })
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(200).end();

  const update = req.body;
  const msg = update.message;

  if (!msg) return res.status(200).end();

  const user = msg.from;
  const text = msg.text || '';
  const chatId = msg.chat.id;

  // Сохраняем пользователя в БД при любом сообщении
  await saveUser(user);

  if (text.startsWith('/start')) {
    const name = user.first_name || 'друг';
    await sendMessage(chatId,
      `👋 Привет, *${name}*!\n\nДобро пожаловать в *Jober* — биржу труда в Telegram.\n\n` +
      `🔍 Здесь ты можешь:\n` +
      `• Находить вакансии\n` +
      `• Откликаться на них\n` +
      `• Размещать свои вакансии\n\n` +
      `Нажми кнопку ниже чтобы открыть приложение 👇`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Открыть Jober', web_app: { url: APP_URL } }
          ]]
        }
      }
    );
  } else {
    await sendMessage(chatId,
      `Используй кнопку ниже чтобы открыть Jober 👇`,
      {
        reply_markup: {
          inline_keyboard: [[
            { text: '🚀 Открыть Jober', web_app: { url: APP_URL } }
          ]]
        }
      }
    );
  }

  return res.status(200).end();
}
