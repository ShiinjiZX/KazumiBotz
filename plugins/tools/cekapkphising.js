/**
 * ✧ Cek APK & Phishing Web ✧
 * • Command: .cekapkphising
 * • Usage:
 *   - .cekapkphising https://example[.]com
 *   - reply .cekapkphising apk  (reply file .apk / document)
 * • Base: https://cekwebphishing.my.id/
 * • Author: Shannz (converted to ESM)
 */

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import path from 'path'
import os from 'os'

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36'

async function cekWeb(url) {
  const data = new FormData()
  data.append('url', String(url))

  const config = {
    method: 'POST',
    url: 'https://cekwebphishing.my.id/scan.php',
    headers: {
      'User-Agent': USER_AGENT,
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      dnt: '1',
      'sec-ch-ua-mobile': '?1',
      origin: 'https://cekwebphishing.my.id',
      referer: 'https://cekwebphishing.my.id/',
      'accept-language': 'id,en-US;q=0.9,en;q=0.8,ja;q=0.7',
      priority: 'u=1, i',
      ...data.getHeaders(),
    },
    data,
    timeout: 30000,
  }

  const res = await axios.request(config)
  return res.data
}

async function cekApk(apkPath) {
  if (!fs.existsSync(apkPath)) throw new Error('File APK tidak ditemukan di path: ' + apkPath)
  const data = new FormData()
  data.append('apk_file', fs.createReadStream(apkPath))

  const config = {
    method: 'POST',
    url: 'https://cekwebphishing.my.id/scanapk.php',
    headers: {
      'User-Agent': USER_AGENT,
      'sec-ch-ua-platform': '"Android"',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Google Chrome";v="140"',
      dnt: '1',
      'sec-ch-ua-mobile': '?1',
      origin: 'https://cekwebphishing.my.id',
      referer: 'https://cekwebphishing.my.id/',
      'accept-language': 'id,en-US;q=0.9,en;q=0.8,ja;q=0.7',
      priority: 'u=1, i',
      ...data.getHeaders(),
    },
    data,
    maxBodyLength: Infinity,
    timeout: 120000,
  }

  const res = await axios.request(config)
  return res.data
}

let handler = async (m, { conn, usedPrefix, command, args }) => {
  try {
    const textArg = (args && args[0]) ? args[0].trim() : ''
    // 1) Jika ada arg dan itu berbentuk http -> cek url
    if (textArg && /^https?:\/\//i.test(textArg)) {
      await m.reply('🔎 Sedang memeriksa URL, tunggu sebentar...')
      const result = await cekWeb(textArg)
      // kirim hasil ringkas (jika json, stringify rapi)
      const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
      // kirim sebagai text, batasi panjang agar tidak terlalu besar
      const max = 15000
      if (out.length > max) {
        // kirim sebagai file txt kalau panjang
        const tmp = path.join(os.tmpdir(), `cekphishing-${Date.now()}.json`)
        fs.writeFileSync(tmp, out, 'utf8')
        await conn.sendMessage(m.chat, { document: fs.createReadStream(tmp), fileName: 'cekphishing-result.json', mimetype: 'application/json' }, { quoted: m })
        fs.unlinkSync(tmp)
      } else {
        await m.reply(`✅ Hasil pengecekan:\n\n${out}`)
      }
      return
    }

    // 2) Jika user reply file + arg "apk" atau langsung reply document/ptt/video? kita cek untuk apk
    // condition: user replied and mime indicates apk/document
    const quoted = m.quoted
    const isApkCommand = textArg.toLowerCase() === 'apk' || (!textArg && quoted)
    if (isApkCommand && quoted) {
      // pastikan tipe file: document atau aplikasi
      const qMsg = quoted.msg || quoted
      const mimetype = (qMsg.mimetype || '') .toLowerCase()
      // allow apk (application/vnd.android.package-archive) or any document
      if (!mimetype && !qMsg.fileName) {
        return m.reply(`❌ Reply file APK sebagai document lalu ketik:\n${usedPrefix + command} apk`)
      }

      // download file ke tmp
      await m.reply('⬇️ Mengunduh file APK...')
      const tmpFile = await conn.downloadAndSaveMediaMessage(quoted, `apk_${Date.now()}`) // bot util function
      const ext = path.extname(tmpFile) || '.apk'
      const apkPath = tmpFile.endsWith('.apk') ? tmpFile : tmpFile + ext

      try {
        await m.reply('🔎 Mengunggah APK untuk discan, mohon tunggu — proses bisa memakan waktu...')
        const result = await cekApk(apkPath)
        const out = typeof result === 'string' ? result : JSON.stringify(result, null, 2)
        const max = 15000
        if (out.length > max) {
          const tmp = path.join(os.tmpdir(), `cekapk-${Date.now()}.json`)
          fs.writeFileSync(tmp, out, 'utf8')
          await conn.sendMessage(m.chat, { document: fs.createReadStream(tmp), fileName: 'cekapk-result.json', mimetype: 'application/json' }, { quoted: m })
          fs.unlinkSync(tmp)
        } else {
          await m.reply(`✅ Hasil scan APK:\n\n${out}`)
        }
      } finally {
        // hapus file sementara
        try { if (fs.existsSync(apkPath)) fs.unlinkSync(apkPath) } catch (e) {}
      }
      return
    }

    // 3) Jika tidak ada arg dan tidak reply -> tampilkan bantuan
    return m.reply(
      `Gunakan command:\n` +
      `• ${usedPrefix + command} https://contoh[.]com  -> cek apakah URL phising\n` +
      `• Reply file .apk lalu ketik: ${usedPrefix + command} apk  -> scan APK\n\n` +
      `Note: untuk APK, reply pesan yang berisi file (document) APK.`
    )
  } catch (err) {
    console.error(err)
    const msg = err && err.message ? err.message : String(err)
    try { await m.reply('❌ Terjadi kesalahan: ' + msg) } catch (e) {}
  }
}

handler.command = /^cekapkphising$/i
handler.help = ['cekapkphising <reply apk>']
handler.tags = ['tools', 'security']

export default handler