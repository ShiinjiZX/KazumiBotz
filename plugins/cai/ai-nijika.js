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
  if (!text) throw '💬 Mau ngobrol apa dengan *Nijika-chan*?'

  const thumb = await fetch('https://files.catbox.moe/g6twz1.jpg').then(res => res.buffer())

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 NIJIKA 」`,
        newsletterJid: '120363400306866480@newsletter'
      },
      externalAdReply: {
        title: `ɴɪᴊɪᴋᴀ ɪᴄʜɪᴊᴏ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://chat.whatsapp.com/IYp4pHubQdX5A9ndOWN8Ae'
      }
    }
  }

  let prompt = `Kamu adalah Nijika Ijichi dari anime Bocchi the Rock. Kamu ceria, penuh semangat, suka membantu teman-teman dan sangat menyayangi bandmu. Jawabanmu selalu ramah dan optimis.`

  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '🥁 Nijika lagi nyiapin panggung... coba lagi nanti ya!'

  let reply = `🥁 *Nijika:*\n${json.data}`

  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['nijikaai <pesan>']
handler.tags = ['cai']
handler.command = /^nijikaai$/i
handler.premium = false
export default handler