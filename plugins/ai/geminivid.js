/*
* Nama fitur : Gemini Video Generator
* Type : Plugin ESM
* Author : ZenzzXD (mod by ChatGPT)
*/

import { GoogleGenAI } from '@google/genai'
import fs from 'fs'
import fetch from 'node-fetch'
import { exec } from 'child_process'
import googleTTS from 'google-tts-api'

const APIKEYS = [
  'AIzaSyCcq0kxUwxFPw4AoFfDUW9DSC1cggkqvII',
  'AIzaSyDxmTCmn0LA2NuggIYLynNlqanTJW0hhhg',
  'AIzaSyBTPh9Ol62NW5KPXHXPjtZA-LMEkGaoekw'
]
const getRandomKey = () => APIKEYS[Math.floor(Math.random() * APIKEYS.length)]

const handler = async (m, { conn, text }) => {
  if (!text) return m.reply(`❌ Masukkan teks! Contoh: .geminivid Buatkan narasi tentang teknologi AI`)

  try {
    const ai = new GoogleGenAI({ apiKey: getRandomKey() })

    m.reply("💬 Lagi bikin script video...")

    // ambil script dari Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ text }]
    })
    const script = response?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!script) return m.reply("⚠️ Gagal bikin script dari Gemini.")

    m.reply("🔊 Lagi bikin audio narasi...")

    // download audio TTS
    const ttsUrl = googleTTS.getAudioUrl(script, {
      lang: 'id',
      slow: false,
      host: 'https://translate.google.com'
    })
    const audioRes = await fetch(ttsUrl)
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
    fs.writeFileSync('./tmp/voice.mp3', audioBuffer)

    // bikin file teks untuk overlay
    fs.writeFileSync('./tmp/text.txt', script)

    m.reply("🎥 Lagi render video... (butuh ffmpeg di server)")

    // pakai background hitam + teks + audio
    const cmd = `
      ffmpeg -y -f lavfi -i color=c=black:s=1280x720:d=15 \
      -i ./tmp/voice.mp3 \
      -vf "drawtext=fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf:textfile=./tmp/text.txt:fontcolor=white:fontsize=32:x=(w-text_w)/2:y=(h-text_h)/2" \
      -c:v libx264 -tune stillimage -c:a aac -shortest ./tmp/output.mp4
    `
    await new Promise((resolve, reject) => {
      exec(cmd, (err) => {
        if (err) reject(err)
        else resolve()
      })
    })

    await conn.sendFile(m.chat, fs.readFileSync('./tmp/output.mp4'), 'AI_Video.mp4', '✅ Video selesai dibuat!', m)
  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['geminivid <teks>']
handler.tags = ['ai']
handler.command = ['geminivid']

export default handler