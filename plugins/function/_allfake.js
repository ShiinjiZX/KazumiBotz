import moment from 'moment-timezone'
import fetch from 'node-fetch'

let handler = m => m

handler.all = async function (m) {
  global.xwm = 'Kazumi WhatsApp Assistance'

  const thumbnailUrl = "https://files.catbox.moe/43keur.jpg"
  const thumb = await fetch(thumbnailUrl).then(res => res.buffer())

  global.adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: true,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 IkyyKzy || Info Update 」`,
        newsletterJid: "120363400306866480@newsletter"
      },
      externalAdReply: {
        title: global.xwm,
        body: momentGreeting(),
        previewType: "PHOTO",
        thumbnail: thumb
      }
    }
  }
}

export default handler

function momentGreeting() {
  const hour = moment.tz('Asia/Jakarta').hour()
  if (hour >= 18) return 'Konbanwa🍃'       // Malam
  if (hour >= 15) return 'Konnichiwa🌾'     // Sore
  if (hour >= 11) return 'Konnichiwa🍂'     // Siang
  if (hour >= 4) return 'Ohayou Gozaimasu🌿' // Pagi
  return 'Oyasuminasai🪷'                   // Tengah malam
}