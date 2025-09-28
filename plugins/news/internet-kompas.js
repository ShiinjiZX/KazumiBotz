/**
✨ Fitur:Kompas ( Search Berita )
📝 Creator:Rijalganzz
🔥 Sumber Ch 1:https://whatsapp.com/channel/0029Vb6ru1s2Jl87BaI4RJ1H
🔥 Sumber Ch 2:https://whatsapp.com/channel/0029Vb69G8eE50UgA7ZlyV1Q
**/
import axios from "axios"

let handler = async (m, { conn }) => {
  try {
    let { data } = await axios.get("https://api-furina.vercel.app/berita/kompas")
    if (!data?.status || !data.result?.length) return m.reply("Berita tidak ditemukan")

    let teks = `*📰 Berita Kompas*\n\n`
    data.result.forEach((v, i) => {
      teks += `*${i + 1}.* ${v.title}\n`
      teks += `📅 ${v.published_at}\n`
      teks += `${v.url}\n\n`
    })

    await conn.sendMessage(m.chat, {
      text: teks.trim(),
      contextInfo: {
        externalAdReply: {
          title: "Berita Kompas",
          body: "Powered by IkyyKzy",
          thumbnailUrl: data.result[0].thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

  } catch {
    await conn.reply(m.chat, "Gagal mengambil data berita", m)
  }
}

handler.help = ["kompas"]
handler.tags = ["search"]
handler.command = ["kompas"]

export default handler