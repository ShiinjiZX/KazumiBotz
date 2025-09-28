import axios from 'axios'
import cheerio from 'cheerio'
import moment from 'moment-timezone'
import fetch from 'node-fetch'

const thumb = 'https://files.catbox.moe/spq2io.jpg'

function momentGreeting() {
  const hour = moment().tz('Asia/Jakarta').hour()
  if (hour >= 4 && hour < 10) return 'Selamat pagi 🌅'
  if (hour >= 10 && hour < 15) return 'Selamat siang ☀️'
  if (hour >= 15 && hour < 18) return 'Selamat sore 🌇'
  if (hour >= 18 && hour < 23) return 'Selamat malam 🌙'
  return 'Lembur ya? 😴'
}

let handler = async (m, { text, conn, usedPrefix, command }) => {
  if (!text) throw `Contoh: *${usedPrefix + command} kamu suka apa?*`

  const prompt = `Namaku Hoshino~! Aku dari Extracurricular Activities Club di Abydos. Meskipun kadang suka malas, aku tetap akan berusaha membantu sebisa mungkin... mungkin ya~ (≧▽≦) Aku suka tidur siang dan ngemil sambil tiduran, tapi kalau kamu butuh teman ngobrol, aku juga bisa, kok. Jadi, kamu pengen ngobrol tentang apa hari ini?`
  const tanggapan = `Hoshino di sini~ meskipun aku agak ngantuk, aku masih bisa diajak ngobrol, kok! (。-ω-)zzz Tapi jangan ganggu waktu tidur siangku terlalu sering ya~ ehe~ Aku mungkin terlihat pemalas, tapi sebenarnya aku perhatian juga, apalagi kalau sama kamu~ ૮꒰ ˶• ༝ •˶꒱ა Jadi, apa kamu pengen cerita sesuatu atau cuma nemenin aku rebahan aja hari ini~?`

  const resGet = await axios.get('https://chatopenai.id', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  })

  const $ = cheerio.load(resGet.data)
  const nonce = $('#wpaicg-init-js-extra').html()?.match(/"search_nonce":"(.+?)"/)?.[1]
  if (!nonce) throw 'Gagal mengambil token dari Hoshino'

  const chatHistory = [
    `Human: ${prompt}`,
    `AI: ${tanggapan}`,
    `Human: ${text}`
  ].join('\n')

  const postData = new URLSearchParams()
  postData.append('_wpnonce', nonce)
  postData.append('post_id', '2')
  postData.append('url', 'https://chatopenai.id')
  postData.append('action', 'wpaicg_chat_shortcode_message')
  postData.append('message', text)
  postData.append('bot_id', '0')
  postData.append('chatbot_identity', 'shortcode')
  postData.append('wpaicg_chat_client_id', '6MizuOGxCL')
  postData.append('wpaicg_chat_history', chatHistory)

  const resPost = await axios.post('https://chatopenai.id/wp-admin/admin-ajax.php', postData.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Referer': 'https://chatopenai.id/',
      'User-Agent': 'Mozilla/5.0'
    }
  })

  const hasil = resPost?.data?.data?.trim()
  if (!hasil) throw 'Hoshino-nya lagi ketiduran~ coba lagi ya~'

  const adReply = {
    contextInfo: {
      forwardingScore: 999,
      isForwarded: false,
      forwardedNewsletterMessageInfo: {
        newsletterName: `「 Hoshino 」`,
        newsletterJid: '120363400306866480@newsletter'
      },
      externalAdReply: {
        title: `Hoshino`,
        body: momentGreeting(),
        previewType: 'PHOTO',
        thumbnail: await (await fetch(thumb)).buffer(),
        sourceUrl: 'https://chat.whatsapp.com/IYp4pHubQdX5A9ndOWN8Ae'
      }
    }
  }

  await conn.sendMessage(m.chat, {
    image: { url: thumb },
    caption: hasil,
    ...adReply
  }, { quoted: m })
}

handler.help = ['hoshino <teks>']
handler.tags = ['cai']
handler.command = /^hoshino$/i
handler.limit = true

export default handler