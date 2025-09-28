    import fetch from 'node-fetch'

let handler = async (m, { conn, args, text, usedPrefix, command }) => {
  if (!text) throw `🚫 Contoh penggunaan:\n${usedPrefix + command} https://www.facebook.com/share/v/1J5jTmxoQQ/`

  const api = `https://www.sankavollerei.com/download/facebook?apikey=planaai&url=${encodeURIComponent(text)}`
  let res = await fetch(api)
  if (!res.ok) throw '❌ Gagal terhubung ke server.'
  
  let json = await res.json()
  if (!json.status || !json.result) throw '❌ Gagal mendapatkan data. Coba lagi dengan link lain.'

  let { title, duration, thumbnail, video } = json.result
  let videoUrl = video?.[0]?.url || json.result.media || json.result.music
  if (!videoUrl) throw '❌ Tidak ditemukan link video.'

  await conn.sendFile(m.chat, videoUrl, title + '.mp4', `📹 *Judul:* ${title}\n⏱️ *Durasi:* ${duration}`, m, false, {
    thumbnail: await (await fetch(thumbnail)).buffer()
  })
}

handler.help = ['fb', 'facebook']
handler.tags = ['downloader']
handler.command = /^fb|facebook$/i
handler.limit = true

export default handler