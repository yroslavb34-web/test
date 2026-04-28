const BOT_TOKEN = '7901382164:AAHlC2mn7iGO5jc01sHywQ9RyB-dVitSsEs';

export default async function handler(req, res) {
  const host = req.headers.host;
  const webhookUrl = `https://${host}/api/webhook`;

  const result = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${encodeURIComponent(webhookUrl)}`
  );
  const data = await result.json();

  return res.status(200).json({
    webhookUrl,
    telegramResponse: data
  });
}
