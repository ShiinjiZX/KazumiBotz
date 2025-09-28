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
  if (!text) throw '💬 Mau ngobrol apa dengan *Kita-chan*?'

  const thumb = await fetch('https://files.catbox.moe/y5b7l6.jpg').then(res => res.buffer())

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 KITA 」`,
        newsletterJid: '120363400306866480@newsletter'
      },
      externalAdReply: {
        title: `ᴋɪᴛᴀ ɪᴋᴜʏᴏ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://chat.whatsapp.com/IYp4pHubQdX5A9ndOWN8Ae'
      }
    }
  }

  let prompt = `Kamu adalah Kita Ikuyo dari anime Bocchi the Rock. Kamu ceria, populer, semangat, dan sangat perhatian pada teman-temanmu. Kamu suka menyemangati orang lain. Jawabanmu selalu positif dan menyenangkan.`

  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '🎤 Kita-chan lagi latihan vokal... coba lagi nanti ya!'

  let reply = `🎤 *Kita:*\n${json.data}`

  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['kitaai <pesan>']
handler.tags = ['cai']
handler.command = /^kitaai$/i
handler.premium = false
export default handler