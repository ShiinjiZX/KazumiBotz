import axios from 'axios';

let handler = async (m, { conn, args, text, command }) => {
  if (!text) return m.reply(`Contoh pemakaian:\n\n${command} https://videy.co/xxxxxxxx`)
  await m.reply('otw bang...')

  try {
    let res = await axios.get(`https://api.nekorinn.my.id/downloader/videy?url=${encodeURIComponent(text)}`)
    let json = res.data
    if (!json.status) return m.reply('Gagal mengambil video.')

    await conn.sendFile(m.chat, json.result, 'videy.mp4', `Berhasil download video dari Videy!\n\nCreator: ${json.creator}`, m)
  } catch (e) {
    console.error(e)
    m.reply('Terjadi error saat download, coba lagi nanti.')
  }
}

handler.command = /^videy$/i
handler.help = ['videy <url>']
handler.tags = ['downloader']
handler.limit = false
handler.premium = true

export default handler