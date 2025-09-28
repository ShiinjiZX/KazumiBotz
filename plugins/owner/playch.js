/* 
 Play CH 
• Note : Ganti ID CH Pake ID Saluran Kamu
• Author Hilman 
*/
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh: ${usedPrefix + command} tarot feast`

  try {
    await m.react('🎶')

    let res = await fetch(`https://api.nekolabs.my.id/downloader/youtube/play/v1?q=${encodeURIComponent(text)}`)
    if (!res.ok) throw await res.text()
    let json = await res.json()
    if (!json.status) throw `🍬 Lagu tidak ditemukan.`

    let { metadata, downloadUrl } = json.result
    let { title, channel, cover, url } = metadata

    await conn.sendMessage(m.chat, { text: '*🍭 Done, dikirim ke Channel*' }, { quoted: m })

    // === Kirim sebagai Voice Note ke Channel ===
    try {
      await conn.sendFile(
        '120363400306866480@newsletter', // Ganti ID CH disini
        downloadUrl,
        `${title}.mp3`,
        null,
        m,
        true,
        {
          type: 'audioMessage',
          ptt: true,
          seconds: 0,
          contextInfo: {
            externalAdReply: {
              title: title,
              body: channel,
              thumbnailUrl: cover,
              mediaUrl: url,
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }
      )
    } catch (err) {
      m.reply('🍬 Gagal mengirim VN ke channel.')
      console.error(err)
    }

  } catch (e) {
    throw `🍬 Terjadi kesalahan!\n\n${e}`
  }
}

handler.help = ['playch <judul>']
handler.tags = ['owner']
handler.command = /^playch$/i
handler.owner = true

export default handler