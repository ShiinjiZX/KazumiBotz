// • Feature : cek link phising
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
// • Scrape : https://whatsapp.com/channel/0029Vae6iYe30LKGkbTvBC3E

import axios from 'axios';
import FormData from 'form-data';

const checkPhishing = async (url) => {
  try {
    const form = new FormData();
    form.append('url', url);

    const { data } = await axios.post('https://cekwebphishing.my.id/scan.php', form, {
      headers: {
        ...form.getHeaders(),
        "User-Agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        "sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
        "Accept": "application/json",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Accept-Language": "id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7"
      }
    });

    return {
      status: data.status,
      url: data.url,
      result: {
        score: data.score,
        status_text: data.status_text,
        phishing: data.totals.phishing,
        malicious: data.totals.malicious,
        clean: data.totals.clean
      }
    };
  } catch (err) {
    throw err;
  }
};

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} https://api.platform.web.id`;

  try {
    const result = await checkPhishing(text);
    const response = `
*URL:* ${result.url}
*Status:* ${result.status}
*Score:* ${result.result.score}
*Status Text:* ${result.result.status_text}
*Phishing:* ${result.result.phishing}
*Malicious:* ${result.result.malicious}
*Clean:* ${result.result.clean}
    `;
    m.reply(response);
  } catch (e) {
    console.error('Error:', e);
    m.reply('🚨 Error: ' + (e.message || e));
  }
};

handler.help = ['checkphishing <url>'];
handler.tags = ['tools'];
handler.command = ['checkphishing', 'cekpising'];
handler.limit = true;

export default handler;