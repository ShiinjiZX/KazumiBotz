/**
  ✧ Upscale/hd - tool ✧ ───────────────────────
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

let handler = async (m, { conn, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime || !/image\/(jpeg|png)/i.test(mime)) {
      return m.reply(
        `🖼️ *Balas gambar JPG/PNG atau kirim gambar dengan caption: ${usedPrefix + command}*`
      )
    }

    let media = await q.download()
    if (!media) return m.reply('🍂 *Gagal mengunduh gambar. Coba lagi!*')

    let up
    try {
      up = await uploader(media)
    } catch (e) {
      console.error('[Uploader Error]', e)
    }

    if (!up) return m.reply('🍂 *Gagal mengunggah gambar ke server. Coba lagi nanti yaa!*')

    let apiUrl = `https://api.zenzxz.my.id/tools/upscale?url=${encodeURIComponent(up)}`
    let res = await fetch(apiUrl)
    if (!res.ok) {
      console.error('[Upscale API Error]', res.status)
      return m.reply('🍂 *Gagal menghubungi API upscale!*')
    }

    let json = await res.json()
    if (!json?.status || !json?.result) {
      console.error('[Upscale API Response]', json)
      return m.reply('🍂 *Gagal memperbesar resolusi gambar!*')
    }

    let resultUrl = json.result
    const imgRes = await fetch(resultUrl)
    if (!imgRes.ok) {
      console.error('[Fetch Image Error]', imgRes.status)
      return m.reply('🍂 *Gagal mengambil hasil gambar dari server.*')
    }

    let buffer = Buffer.from(await imgRes.arrayBuffer())
    await conn.sendFile(
      m.chat,
      buffer,
      'upscale.png',
      `*✨ Gambar berhasil di-upscale!*\n📈 *Resolusi lebih tinggi dari aslinya*`,
      m
    )
  } catch (e) {
    console.error('[Upscale Handler Error]', e)
    m.reply('🍂 *Ups, gagal upscale gambarnya!*')
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['upscale']
handler.tags = ['tools']
handler.command = /^(upscale|hdr)$/i
handler.limit = true
handler.register = true

export default handler