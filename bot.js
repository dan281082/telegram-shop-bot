const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = process.env.BOT_TOKEN || 'PASTE_NEW_BOT_TOKEN_HERE';
const YOUR_CHAT_ID = process.env.YOUR_CHAT_ID || 'PASTE_YOUR_CHAT_ID_HERE';
const SHOP_URL = process.env.SHOP_URL || 'https://telegramshop.vercel.app';

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  ctx.reply('Welcome 👋\n\nTap below to open the shop.', {
    reply_markup: {
      keyboard: [
        [{ text: '🛒 Open Shop' }],
        [{ text: '📦 Orders' }, { text: '💬 Support' }]
      ],
      resize_keyboard: true
    }
  });
});

bot.hears('🛒 Open Shop', (ctx) => {
  ctx.reply('Open the shop below:', {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open Shop',
            web_app: { url: SHOP_URL }
          }
        ]
      ]
    }
  });
});

bot.hears('📦 Orders', (ctx) => {
  ctx.reply('Orders section coming next.');
});

bot.hears('💬 Support', (ctx) => {
  ctx.reply('Support section coming next.');
});

bot.launch();

console.log('Bot is running...');

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/checkout') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        const cart = Array.isArray(data.cart) ? data.cart : [];
        const total = Number(data.total || 0);
        const customer = data.customer || {};

        if (cart.length === 0) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Empty cart' }));
          return;
        }

        const itemLines = cart.map((item, i) =>
          `${i + 1}. ${item.name} - £${item.price}`
        ).join('\n');

        const message =
`🧾 NEW ORDER

${itemLines}

💰 Total: £${total}

👤 Customer:
Name: ${customer.name || 'N/A'}
Telegram: ${customer.telegram || 'N/A'}
Address: ${customer.address || 'N/A'}

📝 Notes:
${customer.notes || 'None'}`;

        await bot.telegram.sendMessage(YOUR_CHAT_ID, message);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('Checkout error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: 'Checkout failed' }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'Not found' }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Order server running on port ${PORT}`);
});