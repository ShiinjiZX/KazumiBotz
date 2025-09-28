/**  
  ✧ Ytcomment - maker ✧ ───────────────────────  
  𖣔 Type   : Plugin ESM  
  𖣔 Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05  
  𖣔 Create by : SXZnightmare (mod by Shannz)  
  𖣔 API    : https://api.zenzxz.my.id  
 */  

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'

async function getToken() {
  const response = await axios.get('https://freeimage.host/', {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    },
  })
  const htmlContent = response.data
  const regex = /PF\.obj\.config\.auth_token = "([a-f0-9]+)"/
  const match = htmlContent.match(regex)
  if (match && match[1]) return match[1]
  throw new Error('Gagal menemukan auth_token')
}

async function uploader(buffer) {
  const tmpPath = `./tmp_${Date.now()}.jpg`
  await fs.promises.writeFile(tmpPath, buffer)

  try {
    const authToken = await getToken()
    const data = new FormData()
    data.append('source', fs.createReadStream(tmpPath))
    data.append('type', 'file')
    data.append('action', 'upload')
    data.append('timestamp', Date.now().toString())
    data.append('auth_token', authToken)

    const res = await axios.post('https://freeimage.host/json', data, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
        'Accept': 'application/json',
        'Origin': 'https://freeimage.host',
        'Referer': 'https://freeimage.host/',
        ...data.getHeaders(),
      },
    })
    return res.data.image?.url || null
  } finally {
    fs.unlinkSync(tmpPath)
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  try {
    if (!args[0]) {
      return m.reply(
        `🍀 *Masukkan username dan komentar untuk fake YouTube!*\n\n🧩 *Contoh: ${usedPrefix + command} Sxz|Halo*`
      )
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime || !/image\/(jpeg|png)/.test(mime)) {
      return m.reply('☘️ *Balas gambar JPG/PNG atau kirim gambar dengan caption perintahnya!*')
    }

    let media = await q.download()
    let up = await uploader(media).catch(() => null)
    if (!up) return m.reply('⚠️ *Gagal mengunggah ke server. Coba lagi nanti yaa!*')

    let [username, text] = args.join(' ').split('|')
    if (!username || !text) {
      return m.reply(`🌱 *Format salah!*\n\n🌼 *Contoh: ${usedPrefix + command} Satria|Halo*`)
    }

    let apiUrl = `https://api.zenzxz.my.id/maker/ytcomment?text=${encodeURIComponent(
      text
    )}&avatar=${encodeURIComponent(up)}&username=${encodeURIComponent(username)}`
    let buffer = Buffer.from(await (await fetch(apiUrl)).arrayBuffer())

    await conn.sendFile(
      m.chat,
      buffer,
      'ytcomment.jpg',
      `*✨ Fake YouTube Comment Berhasil Dibuat!*\n\n👤 *Username: ${username}*\n💬 *Komentar: ${text}*`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply('🍂 *Yaaah, gagal buat fake YouTube comment-nya!*')
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['ytcomment']
handler.tags = ['maker']
handler.command = /^ytcomment$/i
handler.limit = true
handler.register = true

export default handler