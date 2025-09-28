import fetch from 'node-fetch'
import moment from 'moment-timezone'

function momentGreeting() {
  const hour = moment().tz('Asia/Jakarta').hour()
  if (hour >= 4 && hour < 10) return 'Selamat pagi 🌅'
  if (hour >= 10 && hour < 15) return 'Selamat siang ☀️'
  if (hour >= 15 && hour < 18) return 'Selamat sore 🌇'
  if (hour >= 18 || hour < 4) return 'Selamat malam 🌙'
  return 'Halo~'
}

let handler = async (m, { conn, text }) => {
  if (!text) throw '💬 Mau ngobrol apa sama Bocchi-chan?'

  const thumb = await fetch('https://files.catbox.moe/8o5zc7.jpg').then(res => res.buffer()) // Ganti kalau ada link lain

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 BOCCHI 」`,
        newsletterJid: '120363395114168746@newsletter'
      },
      externalAdReply: {
        title: `ʙᴏᴄᴄʜɪ ᴛʜᴇ ʀᴏᴄᴋ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://chat.whatsapp.com/IYp4pHubQdX5A9ndOWN8Ae'
      }
    }
  }

  let prompt = `Kamu adalah Bocchi dari anime Bocchi the Rock. Kamu sangat pemalu, cemas, dan sering panik. Namun kamu suka bermain gitar. Balaslah dengan gaya gugup yang khas.`

  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '😰 Bocchi lagi sembunyi di bawah meja...'

  let reply = `🎸 *Bocchi:*\n${json.data}`
  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['bocchiai <teks>']
handler.tags = ['cai']
handler.command = /^bocchiai$/i
handler.premium = false
export default handler