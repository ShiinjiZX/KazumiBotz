// • Feature : Spotify Maker
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'

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

      if (match && match[1]) return match[1]
      throw new Error('Gagal menemukan auth_token pada halaman web.')
    } catch (error) {
      throw new Error(`Gagal mengambil token: ${error.message}`)
    }
  },

  upload: async (buffer, filename = 'spotify.jpg') => {
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
      return response.data?.image?.url
    } catch (error) {
      let errorMessage = `Upload gagal: ${error.message}`
      if (error.response) {
        errorMessage += ` - Status: ${error.response.status}, Data: ${JSON.stringify(error.response.data)}`
      }
      throw new Error(errorMessage)
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const args = text.split('|')
  if (args.length < 3) {
    return m.reply(`*Contoh:* ${usedPrefix + command} Salman|Jmk48|mas amba crot`)
  }

  const [author, album, title] = args.map(arg => arg.trim())
  m.reply('⏳ Sedang memproses gambar Spotify, harap tunggu...')

  try {
    let apiUrl = `https://anabot.my.id/api/maker/spotify?apikey=freeApikey&author=${encodeURIComponent(author)}&album=${encodeURIComponent(album)}&title=${encodeURIComponent(title)}&timestamp=10,0&image=https://png.pngtree.com/thumb_back/fw800/background/20230117/pngtree-girl-with-red-eyes-in-anime-style-backdrop-poster-head-photo-image_49274352.jpg&blur=5&overlayOpacity=0.7`

    let response = await fetch(apiUrl)

    if (response.headers.get('content-type').includes('image/')) {
      const imgBuffer = await response.buffer()
      const uploadUrl = await freeimage.upload(imgBuffer, 'spotify.jpg')
      if (!uploadUrl) throw new Error('Gagal upload gambar ke freeimage!')

      await conn.sendMessage(m.chat, {
        image: { url: uploadUrl },
        caption: '✅ Gambar Spotify berhasil dibuat!'
      }, { quoted: m })

    } else {
      let hasil = await response.json()
      if (!hasil.success || !hasil.data || !hasil.data.result) {
        return m.reply('❌ Gagal membuat gambar Spotify. Coba dengan parameter yang berbeda.')
      }

      const spotifyImageUrl = hasil.data.result
      await conn.sendMessage(m.chat, {
        image: { url: spotifyImageUrl },
        caption: '✅ Gambar Spotify berhasil dibuat!'
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Error:', e)
    m.reply('🚨 Error: ' + (e.message || e))
  }
}

handler.help = ['spotifym <author|album|title>']
handler.tags = ['tools']
handler.command = ['spotifym']
handler.limit = true

export default handler