/*
* Nama fitur : Speech Writer
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6chx1LI8YVtJJJ9a0Y
* Author : ZenzzXD
* Sumber skrep : Gienetic https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/457
*/

import axios from 'axios'

const Base_Api = 'https://www.junia.ai/api/free-tools/generate'

async function juniaRequest(payload) {
  if (!payload || !payload.op) throw new Error('Payload harus ada dan minimal berisi field op')
  try {
    const res = await axios.post(Base_Api, payload, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-client-version': '4',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; Redmi Note 5 Pro Build/QQ3A.200805.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.7204.179 Mobile Safari/537.36',
        'x-requested-with': 'com.chromasterZ.vn',
        origin: 'https://www.junia.ai',
        referer: 'https://www.junia.ai/tools/ai-speech-writer',
        accept: '*/*',
      }
    })
    return res.data
  } catch (err) {
    console.error(err.response?.data || err.message)
    throw new Error('Layanan Junia sedang error.')
  }
}

function cleanResult(text) {
  if (!text) return text
  return text.replace(/\s?[0-9a-f]{4,}-[0-9a-f]{4,}$/i, '').trim()
}

async function aiSpeechWriter(details) {
  if (!details) throw new Error('Details harus diisi untuk ai-speech-writer')
  const res = await juniaRequest({ details, op: 'ai-speech-writer' })
  return cleanResult(res.result || res)
}

let handler = async (m, { conn, command, text }) => {
  if (!text) return m.reply('Contoh .speechwriter <text>')
  try {
    m.reply('wett')
    const speech = await aiSpeechWriter(text)
    m.reply(speech)
  } catch (e) {
    m.reply(`Eror kak : ${e.message}`)
  }
}

handler.help = ['speechwriter <teks>']
handler.tags = ['ai']
handler.command = ['speechwriter']

export default handler