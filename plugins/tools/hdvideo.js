/*
* Nama fitur : Video Enhancer (hdvid)
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6chx1LI8YVtJJJ9a0Y
* Author : ZenzzXD
* Sumber skrep : Gienetic (https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/460)
*/

import axios from 'axios'
import FormData from 'form-data'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'

async function videoHD(filePath, authorization = '') {
  const fileName = filePath.split('/').pop()
  const formSlot = new FormData()
  formSlot.append('video_file_name', fileName)

  const slotRes = await axios.post(
    'https://api.unblurimage.ai/api/upscaler/v1/ai-video-enhancer/upload-video',
    formSlot,
    {
      headers: {
        ...formSlot.getHeaders(),
        'origin': 'https://imgupscaler.ai',
        'user-agent': 'Gienetic/1.2.0 Mobile',
        'accept': '*/*'
      }
    }
  )

  const slot = slotRes.data.result
  const stats = fs.statSync(filePath)
  const stream = fs.createReadStream(filePath)

  await axios.put(slot.url, stream, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Length': stats.size
    },
    maxBodyLength: Infinity,
    maxContentLength: Infinity
  })
  const videoUrl = `https://cdn.unwatermark.ai/${slot.object_name}`
  const serialRandom = uuidv4()
  const formJob = new FormData()
  formJob.append('original_video_file', videoUrl)
  formJob.append('is_preview', 'false')

  const jobRes = await axios.post(
    'https://api.unblurimage.ai/api/upscaler/v2/ai-video-enhancer/create-job',
    formJob,
    {
      headers: {
        ...formJob.getHeaders(),
        'origin': 'https://imgupscaler.ai',
        'user-agent': 'Gienetic/1.2.0 Mobile',
        'accept': '*/*',
        'product-serial': serialRandom,
        'authorization': authorization
      }
    }
  )

  const jobId = jobRes.data.result ? jobRes.data.result.job_id : null
  if (!jobId) throw new Error('Gagal membuat job HD')
  while (true) {
    const statusRes = await axios.get(
      `https://api.unblurimage.ai/api/upscaler/v2/ai-video-enhancer/get-job/${jobId}`,
      {
        headers: {
          'origin': 'https://imgupscaler.ai',
          'user-agent': 'Gienetic/1.2.0 Mobile',
          'accept': '*/*'
        }
      }
    )

    const result = statusRes.data.result
    if (result && result.output_url) return result.output_url

    await new Promise(r => setTimeout(r, 5000))
  }
}

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mimetype || ''
    if (!mime.includes('video')) return m.reply(`reply video dengan command .hdvid`)
    m.reply('wett')
    let media = await q.download(true)
    let out = await videoHD(media)
    await conn.sendFile(m.chat, out, 'zenn.mp4', 'done kak', m)
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['hdvideo']
handler.tags = ['tools']
handler.command = ['hdvid','hdvideo']

export default handler