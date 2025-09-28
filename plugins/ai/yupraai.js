/* AI FAST RESPON
Lumayan kalau butuh yg cpet respon ny
*/
import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.sendMessage(m.chat, { text: `Contoh: ${usedPrefix}${command} hallo` }, { quoted: m })

  let thinking = await conn.sendMessage(m.chat, { text: "Berfikir..." }, { quoted: m })

  try {
    let res = await axios.get(`https://api.yupra.my.id/api/ai/ypai?text=${encodeURIComponent(text)}`)
    let result = res.data?.result || "Gagal mendapatkan jawaban."
    await conn.sendMessage(m.chat, { text: result, edit: thinking.key })
  } catch (e) {
    await conn.sendMessage(m.chat, { text: "Terjadi kesalahan saat memproses permintaan.", edit: thinking.key })
  }
}

handler.help = ["yupraai <teks>"]
handler.tags = ["ai"]
handler.command = /^yupraai$/i

export default handler