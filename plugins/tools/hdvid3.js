/**
 * ✧ HD Video Upscaler ✧
 * • Command: .hdvid
 * • Base    : https://www.videotoconvert.com/
 * • Author  : Shannz (Mod ESM by GPT)
 * • Note    : Bisa request resolusi -> hd, full-hd, 2k, 4k
 */

import axios from "axios"
import FormData from "form-data"
import fs from "fs"
import path from "path"

const resolutions = {
  "hd": "1280x720",
  "full-hd": "1920x1080",
  "2k": "2560x1440",
  "4k": "3840x2160",
}

async function hdvid(filePath, resolution = "hd") {
  if (!fs.existsSync(filePath)) {
    throw new Error("File tidak ditemukan")
  }

  const upscaleValue = resolutions[resolution.toLowerCase()] || resolutions["hd"]

  try {
    const data = new FormData()
    data.append("upfile", fs.createReadStream(filePath))
    data.append("upscale", upscaleValue)
    data.append("submitfile", "1")

    const config = {
      method: "POST",
      url: "https://www.videotoconvert.com/upscale/",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36",
        origin: "https://www.videotoconvert.com",
        referer: "https://www.videotoconvert.com/upscale/",
        ...data.getHeaders(),
      },
      data,
    }

    const response = await axios.request(config)
    const htmlResponse = response.data

    const downloadLinkRegex =
      /<a href="([^"]+)" target="_blank">Download File/i
    const match = htmlResponse.match(downloadLinkRegex)

    if (match && match[1]) {
      return {
        message: "success",
        url: match[1],
      }
    } else {
      throw new Error("Gagal mengambil link download")
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  if (!m.quoted || !/video|mp4/.test(m.quoted.mimetype || ""))
    return m.reply(`Reply video dengan command *${usedPrefix + command} [resolusi]*\n\nContoh:\n${usedPrefix + command} hd`)

  const reso = (args[0] || "hd").toLowerCase()
  if (!resolutions[reso]) {
    return m.reply(
      `Resolusi tidak tersedia!\n\nPilih salah satu:\n- hd\n- full-hd\n- 2k\n- 4k`
    )
  }

  let media = await conn.downloadAndSaveMediaMessage(m.quoted, "video")
  try {
    m.reply("⏳ Sedang diproses, tunggu sebentar...")
    let result = await hdvid(media, reso)
    await conn.sendMessage(m.chat, { video: { url: result.url }, caption: `✅ Video berhasil di-upscale ke *${reso}*` }, { quoted: m })
  } catch (e) {
    m.reply("❌ Terjadi kesalahan: " + e.message)
  } finally {
    fs.unlinkSync(media) // hapus file sementara
  }
}

handler.command = /^hdvid3$/i
handler.help = ["hdvid3"]
handler.tags = ["tools"]

export default handler