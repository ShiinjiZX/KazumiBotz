/**
 * ✧ Proxy - Tool ✧ ───────────────────────
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * • C by   : SXZnightmare
 * • API    : https://api.nekolabs.my.id/
 * • Note : code sebelumnya ada kesalahan, ini versi fiksnya, semoga bisa sama sc mu!😅
 */

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
        const apiUrl = 'https://api.nekolabs.my.id/tools/free-proxy';
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data.status || !data.result || data.result.length === 0) {
            return m.reply('*🍂 Gagal mengambil data proxy!*');
        }

        let proxyList = `🌍 *FREE PROXY LIST* 🌍\n\n`;
        data.result.slice(0, 10).forEach((proxy, index) => {
            proxyList += `*${index + 1}. IP: ${proxy.ip}:${proxy.port}*\n`;
            proxyList += `*📍 Negara: ${proxy.country} (${proxy.code})*\n`;
            proxyList += `*🕵️ Anonimitas: ${proxy.anonymity}*\n`;
            proxyList += `*🔍 Google: ${proxy.google}*\n`;
            proxyList += `*🔒 HTTPS: ${proxy.https}*\n`;
            proxyList += `*⏰ Terakhir: ${proxy.last}*\n`;
            proxyList += `*────────────────────*\n`;
        });

        proxyList += `\n*📊 Total ditemukan: ${data.result.length} proxy*\n*⚠️ Gunakan dengan bijak!*`;

        await m.reply(proxyList);
    } catch (error) {
        console.error(error);
        m.reply('*🍂 Gagal mengambil data proxy!*');
    } finally {
        await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
    }
};

handler.help = ['proxy'];
handler.command = /^(proxy)$/i;
handler.tags = ['tools'];
handler.limit = true;
handler.register = true;

export default handler;