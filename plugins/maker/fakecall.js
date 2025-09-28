/**
 * ✧ FakeCall - maker ✧ ───────────────────────
 * • Type   : Plugin ESM
 * • Source : https://whatsapp.com/channel/0029VbAXhS26WaKugBLx4E05
 * • C by   : SXZnightmare
 * • API    : https://api.zenzxz.my.id
 */

import fetch from 'node-fetch'
import axios from 'axios'
import FormData from 'form-data'

// uploader freeimage langsung di dalam file
const freeimage = {
  getToken: async () => {
    const res = await axios.get('https://freeimage.host/', {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      },
    })
    const html = res.data
    const match = html.match(/PF\.obj\.config\.auth_token = "([a-f0-9]+)"/)
    if (!match) throw new Error('auth_token tidak ditemukan!')
    return match[1]
  },

  upload: async (buffer, filename = 'fakecall.jpg') => {
    const token = await freeimage.getToken()
    const data = new FormData()
    data.append('source', buffer, { filename })
    data.append('type', 'file')
    data.append('action', 'upload')
    data.append('timestamp', Date.now().toString())
    data.append('auth_token', token)

    const res = await axios.post('https://freeimage.host/json', data, {
      headers: {
        ...data.getHeaders(),
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
        Accept: 'application/json',
        Origin: 'https://freeimage.host',
        Referer: 'https://freeimage.host/',
      },
    })
    return res.data?.image?.url
  },
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
  try {
    if (!args[0]) {
      return m.reply(
        `❗*Masukkan nama dan durasi untuk fakecall!*\n\n🧩*Contoh: ${usedPrefix + command} Nama|Durasi*`
      )
    }

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!mime || !/image\/(jpeg|png)/.test(mime)) {
      return m.reply(
        '🍁*Balas gambar atau kirim gambar dengan caption perintahnya!*'
      )
    }

    let media = await q.download()
    let up = await freeimage.upload(media, 'fakecall.jpg').catch(() => null)
    if (!up) return m.reply('⚠️*Gagal mengunggah ke server. Coba lagi nanti*')

    let [nama, durasi] = args.join(' ').split('|')
    if (!nama || !durasi) {
      return m.reply(
        `🍂*Format salah!*\n\n🧩*Contoh: ${usedPrefix + command} Nama|Durasi*`
      )
    }

    let apiUrl = `https://api.zenzxz.my.id/maker/fakecall?nama=${encodeURIComponent(
      nama
    )}&durasi=${encodeURIComponent(durasi)}&avatar=${encodeURIComponent(up)}`
    let buffer = Buffer.from(await (await fetch(apiUrl)).arrayBuffer())

    await conn.sendFile(
      m.chat,
      buffer,
      'fakecall.jpg',
      `*✨Fake Call Maker Berhasil Dibuat!*\n\n*👤 Nama: ${nama}*\n*⏰ Durasi: ${durasi} detik*`,
      m
    )
  } catch (e) {
    console.error(e)
    m.reply('🍂*Gagal buat fakecall-nya!*')
  } finally {
    await conn.sendMessage(m.chat, { react: { text: '', key: m.key } })
  }
}

handler.help = ['fakecall']
handler.tags = ['maker']
handler.command = /^fakecall$/i
handler.limit = true
handler.register = true

export default handler