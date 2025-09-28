import fetch from 'node-fetch'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'

let handler = async (m, { conn }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!mime || mime == 'conversation') return m.reply('Apa yang mau diupload?')

    let media = await q.download()
    let link = await uploadFile(media)
    if (!link) throw 'Gagal mengunggah media.'

    let shortLink = await shortUrl(link)

    let caption = `╭─ 「 UPLOAD SUCCESS 」
📂 Size: ${media.length} Byte
🌍 URL: ${link}
🔗 Short URL: ${shortLink}
📌 Expired: Unknown
╰───────────────`

    await conn.sendFile(m.chat, link, null, caption, m)
  } catch (error) {
    conn.reply(m.chat, `Error: ${error.message || error}`, m)
  }
}

handler.help = ['tourl3']
handler.tags = ['tools']
handler.command = /^(tourl3)$/i

export default handler

async function uploadFile(buffer) {
  const uploadServices = [catbox, pomf2, quAx, telegraph, tmpfiles]
  for (const upload of uploadServices) {
    try {
      return await upload(buffer)
    } catch (e) {}
  }
  throw new Error('Semua layanan gagal mengunggah file.')
}

async function shortUrl(url) {
  try {
    let res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`)
    if (!res.ok) throw new Error()
    return await res.text()
  } catch {
    return url
  }
}

async function catbox(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' }
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('fileToUpload', buffer, { filename: `file.${ext}`, contentType: mime })
  const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form })
  if (!res.ok) throw new Error()
  return await res.text()
}

async function pomf2(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin' }
  const form = new FormData()
  form.append('files[]', buffer, { filename: `file.${ext}`, contentType: 'application/octet-stream' })
  const res = await fetch('https://pomf2.lain.la/upload.php', { method: 'POST', body: form })
  const json = await res.json()
  if (!json.files || !json.files[0].url) throw new Error()
  return json.files[0].url
}

async function quAx(buffer) {
  const { ext } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin' }
  const form = new FormData()
  form.append('files[]', buffer, { filename: `file.${ext}`, contentType: 'application/octet-stream' })
  const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form })
  const json = await res.json()
  if (!json.success || !json.files || !json.files[0].url) throw new Error()
  return json.files[0].url
}

async function telegraph(buffer) {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || { ext: 'bin', mime: 'application/octet-stream' }
  const form = new FormData()
  form.append('file', buffer, { filename: `tmp.${ext}`, contentType: mime })
  const res = await fetch('https://telegra.ph/upload', { method: 'POST', body: form })
  const json = await res.json()
  if (!json[0] || !json[0].src) throw new Error()
  return 'https://telegra.ph' + json[0].src
}

async function tmpfiles(buffer) {
  const { ext, mime } = await fileTypeFromBuffer(buffer)
  let form = new FormData()
  form.append('file', buffer, { filename: `tmp.${ext}`, contentType: mime })
  let res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form })
  let json = await res.json()
  if (!json.data || !json.data.url) throw new Error()
  return json.data.url
}