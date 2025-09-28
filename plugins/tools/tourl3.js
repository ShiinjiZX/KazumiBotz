// • Feature : Short url api.ungu.in 
// • Scrape : https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/456
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} <url>`;

  try {
    const urlToShorten = text.trim();
    const response = await unguShort(urlToShorten);

    if (response.error) {
      throw new Error(
        typeof response.error === 'string'
          ? response.error
          : JSON.stringify(response.error)
      );
    }

    await conn.sendMessage(
      m.chat,
      {
        text: `🔗 URL Pendek:\n${response.shorten}`,
      },
      { quoted: m }
    );
  } catch (e) {
    console.error('Error:', e);
    m.reply('🚨 Error: ' + (e.message || e));
  }
};

async function unguShort(url, alias = '') {
  const response = await fetch(`https://api.ungu.in/api/v1/links/for-guest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      original: url,
      shorten: alias, // harus string, kosongkan kalau auto
    }),
  });

  const data = await response.json();

  if (data.message) return { error: data.message };

  if (data?.data?.ip) delete data.data.ip;

  return {
    ...data.data,
    shorten: 'https://ungu.in/' + data.data.shorten,
  };
}

handler.help = ['shorturl3 <url>'];
handler.tags = ['tools'];
handler.command = ['shorturl3','tourl3'];
handler.limit = true;

export default handler;