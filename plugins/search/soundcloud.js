/**
✨ Fitur:Search Soundcloud ( Search Lagu Soundcloud  )
📝 Creator:Rijalganzz
🔥 Sumber Ch 1:https://whatsapp.com/channel/0029Vb6ru1s2Jl87BaI4RJ1H
🔥 Sumber Ch 2:https://whatsapp.com/channel/0029Vb69G8eE50UgA7ZlyV1Q
🔥 Join My Group:https://chat.whatsapp.com/IxlDjH5B5VBFR6nqjhcE0M
Note:Downloader Nya Error Jir
**/
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `Contoh penggunaan:\n${usedPrefix + command} kelingan mantan`

  let res = await fetch(`https://api-furina.vercel.app/search/soundcloud?q=${encodeURIComponent(text)}`)
  if (!res.ok) throw 'Gagal mengambil data dari API Furina'
  let json = await res.json()
  if (!json.results || json.results.length === 0) throw `Tidak ada hasil untuk: ${text}`

  let hasil = json.results.slice(0, 5)

  let caption = `🔎 *Hasil Pencarian SoundCloud*\n📌 Query: *${json.query}*\n\n`
  hasil.forEach((v, i) => {
    caption += `*${i + 1}. ${v.title}*\n`
    caption += `🎤 Author: ${v.author?.name || '-'}\n`
    caption += `⏱ Durasi: ${v.duration}\n`
    caption += `▶️ Play: ${v.play_count}\n`
    caption += `❤️ Like: ${v.like_count}\n`
    caption += `📅 Rilis: ${v.release_date}\n`
    caption += `🔗 Link: ${v.url}\n\n`
  })

  await conn.sendMessage(m.chat, {
    text: caption,
    contextInfo: {
      externalAdReply: {
        title: hasil[0].title,
        body: hasil[0].author?.name || '',
        thumbnailUrl: hasil[0].thumbnail,
        sourceUrl: hasil[0].url,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['scsearch <judul>']
handler.tags = ['search']
handler.command = /^scsearch$/i

export default handler