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
  if (!text) throw '💬 Mau ngobrol apa dengan Ryo Yamada yang misterius?'

  // Ambil thumbnail Ryo sebagai buffer
  const thumb = await fetch('https://files.catbox.moe/qmy241.jpg').then(res => res.buffer())

  // Setup adReply global
  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 RYO - MD 」`,
        newsletterJid: '120363400306866480@newsletter'
      },
      externalAdReply: {
        title: `ʀʏᴏ ʏᴀᴍᴀᴅᴀ - ᴄᴜᴇᴋ`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: thumb,
        sourceUrl: 'https://chat.whatsapp.com/IYp4pHubQdX5A9ndOWN8Ae'
      }
    }
  }

  let prompt = `Kamu adalah Ryo Yamada dari anime Bocchi the Rock!. Kamu cewek cuek, misterius, dan kadang jawab seenaknya. Jawabanmu singkat dan kadang absurd.`
  let url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=${encodeURIComponent(prompt)}&content=${encodeURIComponent(text)}`
  let res = await fetch(url)
  let json = await res.json()

  if (!json.status || !json.data) throw '🪫 Ryo lagi ngeliatin semut, coba lagi nanti...'

  let reply = `🎸 *Ryo Yamada:*\n${json.data}`

  // Kirim pesan pakai adReply + thumbnail
  await conn.sendMessage(m.chat, {
    text: reply,
    contextInfo: global.adReply.contextInfo
  }, { quoted: m })
}

handler.help = ['ryoai <pesan>']
handler.tags = ['cai']
handler.command = /^ryoai$/i
handler.premium = false
export default handler