// • Feature : hdvideo (gimmik kayaknya)
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import FormData from 'form-data'
import axios from 'axios'
import fs from 'fs'
import path from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const q = m.quoted ? m.quoted : m
  const mime = (q.msg || q).mimetype || q.mediaType || ''

  if (!/video/.test(mime)) return m.reply("❗ Reply video yang ingin dijadikan HD!")

  // parsing resolusi & fps
  let [res, fpsText] = text?.trim().toLowerCase().split(" ") || []
  let fps = 60

  if (fpsText && fpsText.endsWith("fps")) {
    fps = parseInt(fpsText.replace("fps", ""))
    if (isNaN(fps) || fps < 30 || fps > 240) {
      return m.reply("❗ FPS antara 30 - 240 (contoh: 60fps)")
    }
  }

  const resolutions = {
    "480": "480",
    "720": "720",
    "1080": "1080",
    "2k": "1440",
    "4k": "2160",
    "8k": "4320"
  }

  if (!resolutions[res]) {
    return m.reply(
      `❗ Resolusi tidak valid!\n\nContoh penggunaan:\n` +
      `${usedPrefix + command} 720\n` +
      `${usedPrefix + command} 1080 60fps`
    )
  }

  const targetHeight = resolutions[res]
  const id = m.sender.split("@")[0]
  const tmpDir = "./tmp"
  if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir)

  const inputFile = path.join(tmpDir, `input_${id}.mp4`)
  const outputFile = path.join(tmpDir, `hdvideo_${id}.mp4`)

  m.reply(`⏳ Mengubah video ke *${res.toUpperCase()} ${fps}FPS*...\nMohon tunggu proses render.`)

  try {
    // download file dari chat
    const downloaded = await q.download(inputFile)

    const form = new FormData()
    form.append("video", fs.createReadStream(downloaded))
    form.append("resolution", targetHeight)
    form.append("fps", fps)

    const response = await axios.post("http://api.drizznesiasite.biz.id:4167/hdvideo", form, {
      headers: form.getHeaders(),
      responseType: "stream",
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    })

    const writer = fs.createWriteStream(outputFile)
    response.data.pipe(writer)

    writer.on("finish", async () => {
      const buffer = fs.readFileSync(outputFile)
      await conn.sendMessage(
        m.chat,
        {
          video: buffer,
          caption: `✅ Video berhasil diubah ke *${res.toUpperCase()} ${fps}FPS*`
        },
        { quoted: m }
      )

      cleanup()
    })

    writer.on("error", () => {
      cleanup()
      m.reply("❌ Gagal menyimpan hasil video")
    })

    // fungsi bersih-bersih file sementara
    function cleanup() {
      try {
        if (fs.existsSync(downloaded)) fs.unlinkSync(downloaded)
        if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile)
      } catch {}
    }
  } catch (err) {
    console.error(err)
    m.reply("❌ Terjadi kesalahan saat memproses video. Pastikan server API aktif.")
  }
}

handler.help = ['hdvideo2 <resolusi> <fps>']
handler.tags = ['tools']
handler.command = ['hdvideo2']
handler.limit = true

export default handler