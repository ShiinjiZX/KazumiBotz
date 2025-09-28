/*
# Fitur : Hentai Image Fetcher
# Type : Plugins ESM
# Created by : https://whatsapp.com/channel/0029Vb2qri6JkK72MIrI8F1Z
# Api : https://api.nekorinn.my.id/waifuim/hentai

⚠️ _Note_ ⚠️
jangan hapus wm ini banggg
*/

import axios from 'axios'

const handler = async (m, { conn }) => {
  try {
    m.reply('⏳ Mengambil gambar hentai...')

    // Mengambil gambar dari API
    const response = await axios.get('https://api.nekorinn.my.id/waifuim/hentai', { responseType: 'arraybuffer' })

    // Mengirim gambar ke WhatsApp
    await conn.sendMessage(m.chat, {
      image: response.data,
      caption: 'Gambar Hentai dari API'
    }, { quoted: m })

  } catch (error) {
    console.log(error)
    m.reply(`❌ Error\nLogs error : ${error.message || error}`)
  }
}

handler.command = ['hentai']
handler.tags = ['nsfw']
handler.help = ['hentai']
handler.premium = true
export default handler