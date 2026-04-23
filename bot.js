const { Telegraf } = require('telegraf');
const http = require('http');

const BOT_TOKEN = '8711976799:AAGX6_DMpNYCuscp_jZuzgdlMhh1kC0POvk';
const YOUR_CHAT_ID = '8196513650';
const SHOP_URL = 'https://telegramshop.vercel.app';

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
        const items = Array.isArray(data.items) ? data.items : [];
        const total = Number(data.total || 0);

        const itemLines = items.map((item, i) =>
          `${i + 1}. ${item.name} - £${item.price}`
        ).join('\n');

        const message =
          `New order\n\n${itemLines}\n\nTotal: £${total}`;

        await bot.telegram.sendMessage(YOUR_CHAT_ID, message);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error('Checkout error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false }));
      }
    });

    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Order server running on port ${PORT}`);
});