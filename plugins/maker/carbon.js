/**
 * ✧ Snapcode - Maker ✧ ───────────────────────
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * • C by   : SXZnightmare
 * • API    : https://carbonara.solopov.dev/api/cook
 */

let handler = async (m, { conn, text, usedPrefix, command }) => { 
if (!text) return m.reply(`*❗Contoh: ${usedPrefix + command} console.log("hello world")*`)
       
try {
await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
let apiUrl = 'https://carbonara.solopov.dev/api/cook'
let res = await fetch(apiUrl, {
method: 'POST',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ code: text })
})
        
if (!res.ok) throw new Error('*🚨 API ERROR!*')
        
let imageBuffer = await res.arrayBuffer()
await conn.sendMessage(m.chat, {
image: Buffer.from(imageBuffer),
caption: `*✨Snapcode berhasil dibuat!*`
}, { quoted: m })
        
} catch (e) {
m.reply('*🍂Gagal membuat gambar code gambar*')
} finally {
await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
}
}

handler.help = ['snapcode']
handler.command = /^(snapcode|carbon)$/i
handler.tags = ['maker']
handler.limit = true
handler.register = true

export default handler