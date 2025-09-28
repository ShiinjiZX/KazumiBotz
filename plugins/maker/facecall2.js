/**
 * ✧ FakeCall - Maker ViaLink ✧ ───────────────────────
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * • C by   : SXZnightmare
 * • API    : https://api.zenzxz.my.id
 */

let handler = async (m, { conn, args, usedPrefix, command }) => {
await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });
try {
let input = args.join(" ").split("|")
if (input.length < 3) {
throw `*❗Format Salah!*\n*Gunakan:*\n*${usedPrefix + command} <nama>|<durasi>|<avatar_url>*\n\n*Contoh:*\n*${usedPrefix + command} Rafly|10|https://example.com/avatar.jpg*`
}
const [nama, durasi, avatar] = input.map(str => str.trim())
const url = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(nama)}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(avatar)}`
const res = await fetch(url)

if (!res.ok) throw '*❌ Gagal membuat fake call, pastikan input valid!*'

const buffer = await res.arrayBuffer()
await conn.sendMessage(m.chat, {
image: Buffer.from(buffer),
caption: `*📞Fake Call Wangsaf berhasil di buat coy!*\n\n*• Nama:* ${nama}\n*• Durasi:* ${durasi} detik\n*• Avatar:* ${avatar}\n\n*✨Fake Call siap dibagikan!*`
}, { quoted: m })
} catch (err) {
await conn.sendMessage(m.chat, {
text: typeof err === 'string' ? err : '*❌ Terjadi kesalahan saat memproses permintaan.*'
}, { quoted: m })
} finally {
await conn.sendMessage(m.chat, { react: { text: '', key: m.key } });
}
}

handler.help = ['fakecall2']
handler.tags = ['maker']
handler.command = /^(fakecall2)$/i
handler.limit = true
handler.register = true

export default handler