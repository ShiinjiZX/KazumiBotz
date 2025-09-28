/*
* Base: https://freeimage.host/
* Author: Shannz
* Note: Jan lupa follow official saluran: https://whatsapp.com/channel/0029Vb2mOzL1Hsq0lIEHoR0N
*/

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'

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
        throw new Error("Gagal menemukan auth_token pada halaman web.")
      }
    } catch (error) {
      throw new Error(`Gagal mengambil token: ${error.message}`)
    }
  },

  upload: async (filePath) => {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File tidak ditemukan di path: ${filePath}`)
    }

    try {
      const authToken = await freeimage.getToken()
      const data = new FormData()
      data.append('source', fs.createReadStream(filePath))
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

// 📌 Handler Plugin
let handler = async (m, { conn }) => {
  if (!m.quoted) throw '❌ Reply ke gambar yang mau diupload!'

  let mime = (m.quoted.msg || m.quoted).mimetype || ''
  if (!mime.startsWith('image/')) throw '❌ Hanya bisa upload gambar.'

  let media = await m.quoted.download()
  let filePath = path.join('./tmp', `upload_${Date.now()}.jpg`)
  fs.writeFileSync(filePath, media)

  try {
    let res = await freeimage.upload(filePath)
    if (res && res.image && res.image.url) {
      await conn.sendMessage(m.chat, { text: `✅ Upload berhasil:\n${res.image.url}` }, { quoted: m })
    } else {
      throw new Error('Gagal mendapatkan link gambar.')
    }
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `❌ ${err.message}` }, { quoted: m })
  } finally {
    fs.unlinkSync(filePath) // hapus file temp
  }
}

handler.help = ['tourl2 (reply gambar)']
handler.tags = ['tools']
handler.command = /^tourl2$/i

export default handler