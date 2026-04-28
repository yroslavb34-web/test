// telegram-auth.js
// Браузерный клиент Supabase + Telegram авторизация

const SUPABASE_URL = 'https://vznzoismzrtipowpfigu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Y_5SAlZERayUWeg3sWe4Nw_v7ri5VFS';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const authTg = {
  user: null,

  // Получаем данные пользователя из Telegram WebApp
  getTelegramUser() {
    const tg = window.Telegram?.WebApp;
    if (!tg?.initDataUnsafe?.user) return null;
    return tg.initDataUnsafe.user;
  },

  // Регистрируем/логиним пользователя в Supabase
  async registerWithTelegram() {
    const tgUser = this.getTelegramUser();
    if (!tgUser) return { success: false, error: 'Telegram данные недоступны' };

    try {
      // Проверяем есть ли уже такой пользователь
      const { data: existing } = await supabaseClient
        .from('telegram_users')
        .select('*')
        .eq('tg_id', String(tgUser.id))
        .single();

      if (existing) {
        this.user = existing;
        return { success: true, isNew: false };
      }

      // Создаём нового пользователя
      const { data: newUser, error } = await supabaseClient
        .from('telegram_users')
        .insert({
          tg_id: String(tgUser.id),
          username: tgUser.username || `user_${tgUser.id}`,
          full_name: `${tgUser.first_name || ''} ${tgUser.last_name || ''}`.trim(),
          first_name: tgUser.first_name || '',
          last_name: tgUser.last_name || '',
          photo_url: tgUser.photo_url || '',
          is_premium: tgUser.is_premium || false,
          language_code: tgUser.language_code || 'ru',
        })
        .select()
        .single();

      if (error) return { success: false, error: error.message };

      this.user = newUser;
      return { success: true, isNew: true };

    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  isLoggedIn() {
    return !!this.user;
  },

  getUser() {
    return this.user;
  }
};
