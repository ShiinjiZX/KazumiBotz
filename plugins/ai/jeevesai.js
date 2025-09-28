/*
* Base: https://jeeves.ai/chat/
* Creator: IkyyKzy
* Sumber: https://whatsapp.com/channel/0029Vb6ZLKPFy72HsLBqZi1x

* Sumber Scrape: https://whatsapp.com/channel/0029Vb2mOzL1Hsq0lIEHoR0N/648
* Author: Shannz
*/

import axios from 'axios'
import fs from 'fs'

const dbPath = './database/jeeves.json'
const SESSION_TIMEOUT = 3 * 60 * 60 * 1000 // 3 jam dalam ms

// load database
function loadDB() {
  if (!fs.existsSync(dbPath)) return {}
  return JSON.parse(fs.readFileSync(dbPath))
}

// save database
function saveDB(db) {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
}

// fungsi request ke Jeeves
async function jeeves(prompt, parentMessageId = null) {
  const requestData = { prompt }
  if (parentMessageId) requestData.parentMessageId = parentMessageId

  const config = {
    method: 'POST',
    url: 'https://api.jeeves.ai/generate/v4/chat',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Origin': 'https://jeeves.ai',
      'Referer': 'https://jeeves.ai/',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
    },
    data: JSON.stringify(requestData),
    responseType: 'stream'
  }

  try {
    const response = await axios.request(config)
    return new Promise((resolve, reject) => {
      let answer = ''
      let messageId = null

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '')
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataContent = line.substring(6).trim()
            if (dataContent === '[DONE]') continue
            try {
              const jsonData = JSON.parse(dataContent)
              if (jsonData.messageId && !messageId) {
                messageId = jsonData.messageId
              }
              if (jsonData.text) {
                answer += jsonData.text
              }
            } catch (e) {
              // abaikan error parse
            }
          }
        }
      })

      response.data.on('end', () => {
        resolve({ answer: answer.trim(), messageId })
      })

      response.data.on('error', (err) => {
        reject(err)
      })
    })
  } catch (error) {
    console.error('Error saat request ke API:', error.message)
    return null
  }
}

// 📌 Handler Plugin
let handler = async (m, { conn, text }) => {
  if (!text) throw '❌ Masukkan pertanyaan! Contoh: .jeeves siapa presiden pertama Indonesia?'

  let db = loadDB()
  let userId = m.sender
  let now = Date.now()

  // cek session user
  let session = db[userId]
  let parentMessageId = null

  if (session) {
    // cek expired
    if (now - session.lastUsed > SESSION_TIMEOUT) {
      console.log(`⌛ Session user ${userId} expired, reset.`)
      delete db[userId]
    } else {
      parentMessageId = session.messageId || null
    }
  }

  try {
    let res = await jeeves(text, parentMessageId)
    if (!res) throw new Error('Tidak ada respon dari Jeeves.')

    // simpan/update session baru
    db[userId] = { 
      messageId: res.messageId, 
      lastUsed: now 
    }
    saveDB(db)

    await conn.sendMessage(m.chat, { text: res.answer }, { quoted: m })
  } catch (err) {
    await conn.sendMessage(m.chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
  }
}

handler.help = ['jeeves <teks>']
handler.tags = ['ai']
handler.command = /^jeeves$/i

export default handler