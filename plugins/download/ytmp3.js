/**
✨ Fitur:Ytmp3 ( Downloader Sound YouTube )
📝 Creator:Rijalganzz
🔥 Sumber Ch 1:https://whatsapp.com/channel/0029Vb6ru1s2Jl87BaI4RJ1H
🔥 Sumber Ch 2:https://whatsapp.com/channel/0029Vb69G8eE50UgA7ZlyV1Q
🔥 Join My Group:https://chat.whatsapp.com/IxlDjH5B5VBFR6nqjhcE0M
Note:Maaf Jarang Share Kode
**/
import fetch from 'node-fetch'
const fkontak = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: '0@s.whatsapp.net',
    fromMe: false,
    id: 'Halo',
  },
  message: {
    conversation: `Musik pilihan mu siap diputar🍏`,
  },
};
const furina = async (m, { conn, args }) => {
  if (!args.length) return conn.reply(m.chat, 'Silakan masukkan URL video YouTube.', m, { quoted: fkontak })

  const url = args[0]
  await conn.reply(m.chat, "Sabar Banh!", m, { quoted: fkontak })

  if (!/^https?:\/\/(www\.)?(youtube\.com|youtu\.?be)\//.test(url)) {
    return conn.reply(m.chat, "Error Banh!", m, { quoted: fkontak })
  }

  try {
    const apiUrl = `https://api-furina.vercel.app/download/ytmp3?url=${encodeURIComponent(url)}`
    const response = await fetch(apiUrl)
    const json = await response.json()

    if (!json.status || !json.link) {
      return conn.reply(m.chat, "Error Banh!", m, { quoted: fkontak })
    }

    const { title, link, thumbnail, filesize, duration } = json
    const caption = `🎶 *${title}*\n⏱️ Durasi: ${duration} detik\n📦 Ukuran: ${(filesize/1024/1024).toFixed(2)} MB`

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption
    }, { quoted: fkontak })

    const audioBuffer = await (await fetch(link)).arrayBuffer()
    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      mimetype: 'audio/mpeg',
      fileName: `${title}.mp3`
    }, { quoted: fkontak })

  } catch (err) {
    console.error(err)
    await conn.reply(m.chat, "Error Banh!", m, { quoted: fkontak })
  }
}

furina.help = ['ytmp3v2']
furina.command = ['ytmp3v2']
furina.tags = ['downloader']
furina.limit = true
furina.premium = false

export default furina