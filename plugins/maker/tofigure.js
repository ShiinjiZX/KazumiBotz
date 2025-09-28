// • Feature : to figure
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import axios from 'axios'
import FormData from 'form-data'
import fetch from 'node-fetch'

const freeimage = {
  getToken: async () => {
    try {
      const response = await axios.get('https://freeimage.host/', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
        }
      })
      const htmlContent = response.data
      const regex = /PF\.obj\.config\.auth_token = "([a-f0-9]+)"/
      const match = htmlContent.match(regex)

      if (match && match[1]) {
        return match[1]
      } else {
        throw new Error('Gagal menemukan auth_token pada halaman web.')
      }
    } catch (error) {
      throw new Error(`Gagal mengambil token: ${error.message}`)
    }
  },

  upload: async (buffer, filename = 'file.jpg') => {
    try {
      const authToken = await freeimage.getToken()
      const data = new FormData()
      data.append('source', buffer, { filename })
      data.append('type', 'file')
      data.append('action', 'upload')
      data.append('timestamp', Date.now().toString())
      data.append('auth_token', authToken)

      const config = {
        method: 'POST',
        url: 'https://freeimage.host/json',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
          'Accept': 'application/json',
          'Origin': 'https://freeimage.host',
          'Referer': 'https://freeimage.host/',
          ...data.getHeaders()
        },
        data
      }

      const response = await axios.request(config)
      return response.data
    } catch (error) {
      let errorMessage = `Upload gagal: ${error.message}`
      if (error.response) {
        errorMessage += ` - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
      }
      throw new Error(errorMessage)
    }
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || q.mediaType || ''

    if (/^image/.test(mime) && !/webp/.test(mime)) {
      m.reply('⏳ Mohon tunggu, sedang memproses...')
      const img = await q.download()
      const uploaded = await freeimage.upload(img, 'tofigure.jpg')
      if (!uploaded || !uploaded.image?.url) throw new Error('Gagal upload gambar!')

      const out = uploaded.image.url
      const response = await fetch(`https://api.nekolabs.my.id/ai/convert/tofigure?imageUrl=${encodeURIComponent(out)}`)
      const data = await response.json()

      if (!data.status) throw new Error('Gagal mendapatkan data dari API!')

      const resultUrl = data.result

      await conn.sendMessage(m.chat, {
        image: { url: resultUrl },
        caption: 'done!'
      }, { quoted: m })

    } else {
      m.reply(`📷 Kirim gambar dengan caption *${usedPrefix + command}* atau tag gambar yang sudah dikirim.`)
    }
  } catch (e) {
    console.error('Error:', e)
    m.reply('🚨 Error: ' + (e.message || e))
  }
}

handler.help = ['tofigure']
handler.tags = ['ai']
handler.command = ['tofigure']
handler.limit = true

export default handler