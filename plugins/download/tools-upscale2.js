import axios from 'axios'
import FormData from 'form-data'
import { Buffer } from 'buffer'

// Helper proses ke ImgLarger
async function imglarger(buffer, options = {}) {
  const { scale = '2', type = 'upscale' } = options
  const config = {
    scales: ['2', '4'],
    types: { upscale: 13, enhance: 2, sharpener: 1 }
  }

  if (!Buffer.isBuffer(buffer)) throw new Error('Image buffer is required')
  if (!config.types[type]) throw new Error(`Type tersedia: ${Object.keys(config.types).join(', ')}`)
  if (type === 'upscale' && !config.scales.includes(scale)) throw new Error(`Scale tersedia: ${config.scales.join(', ')}`)

  const form = new FormData()
  form.append('file', buffer, `img_${Date.now()}.jpg`)
  form.append('type', config.types[type].toString())
  if (type !== 'sharpener') form.append('scaleRadio', type === 'upscale' ? scale : '1')

  const { data: p } = await axios.post('https://photoai.imglarger.com/api/PhoAi/Upload', form, {
    headers: {
      ...form.getHeaders(),
      accept: 'application/json, text/plain, */*',
      origin: 'https://imglarger.com',
      referer: 'https://imglarger.com/',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
    }
  })

  if (!p.data.code) throw new Error('Upload gagal - tidak ada kode')

  while (true) {
    const { data: r } = await axios.post('https://photoai.imglarger.com/api/PhoAi/CheckStatus', {
      code: p.data.code,
      type: config.types[type]
    }, {
      headers: {
        accept: 'application/json, text/plain, */*',
        'content-type': 'application/json',
        origin: 'https://imglarger.com',
        referer: 'https://imglarger.com/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Mobile Safari/537.36'
      }
    })

    if (r.data.status === 'waiting') continue
    if (r.data.status === 'success') return r.data.downloadUrls[0]
    await new Promise(res => setTimeout(res, 5000))
  }
}

// Reaction helper
const reaction = async (m, emoji) => m.react && await m.react(emoji)

let handler = async (m, { conn, args, usedPrefix, command }) => {
  await reaction(m, '🖼️')

  // Validasi quoted image atau link gambar
  if (!(m.quoted?.mimetype?.startsWith('image/') || (args.length > 0 && args[0].startsWith('http')))) {
    throw `Reply gambar atau kirim link gambar dengan caption:\n*${usedPrefix + command} <scale> <type>*\n\nContoh:\n*${usedPrefix + command} 4 upscale*`
  }

  // Set default & parsing argumen
  let scale = (args[0] && ['2', '4'].includes(args[0])) ? args[0] : '2'
  let type = (args[1] && ['upscale', 'enhance', 'sharpener'].includes(args[1])) ? args[1] : 'upscale'

  try {
    let buffer

    if (m.quoted?.mimetype?.startsWith('image/')) {
      buffer = await m.quoted.download()
    } else {
      const res = await axios.get(args[0], { responseType: 'arraybuffer' })
      buffer = res.data
    }

    await reaction(m, '⏳')
    const resultUrl = await imglarger(buffer, { scale, type })
    await conn.sendFile(m.chat, resultUrl, 'hasil.jpg', `✅ *Berhasil diproses!*\nScale: ${scale}\nType: ${type}`, m)
    await reaction(m, '✅')

  } catch (e) {
    console.error(e)
    await reaction(m, '❌')
    throw '❌ Gagal memproses gambar.'
  }
}

handler.help = ['upscale2 <scale> <type>']
handler.tags = ['tools']
handler.command = /^upscale2|hdr2$/i
handler.limit = true

export default handler