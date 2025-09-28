/*
* Nama fitur : To figure
* Type : Plugin Esm
* Sumber : https://whatsapp.com/channel/0029Vb6chx1LI8YVtJJJ9a0Y
* Author : ZenzzXD
*/

import { GoogleGenAI } from '@google/genai'

// simpan semua API key di array
const APIKEYS = [
  'AIzaSyCcq0kxUwxFPw4AoFfDUW9DSC1cggkqvII',
  'AIzaSyDxmTCmn0LA2NuggIYLynNlqanTJW0hhhg',
  'AIzaSyBTPh9Ol62NW5KPXHXPjtZA-LMEkGaoekw'
]

// fungsi pilih random API key
const getRandomKey = () => APIKEYS[Math.floor(Math.random() * APIKEYS.length)]

const PROMPT = `Using the nano-banana model, a commercial 1/7 scale figurine of the character in the picture was created, depicting a realistic style and a realistic environment. The figurine is placed on a computer desk with a round transparent acrylic base. There is no text on the base. The computer screen shows the Zbrush modeling process of the figurine. Next to the computer screen is a BANDAI-style toy box with the original painting printed on it.`

const handler = async (m, { conn }) => {
  try {
    const mime = m.quoted?.mimetype || ''
    if (!/image/.test(mime)) {
      return m.reply('❌ Balas gambar dengan command: .tofigure')
    }

    m.reply('⏳ Tunggu sebentar, lagi diproses...')

    const imageBuffer = await m.quoted.download()
    if (!imageBuffer) return m.reply('⚠️ Error pas mengunduh gambar')

    const apiKey = getRandomKey()
    const ai = new GoogleGenAI({ apiKey })
    const base64Image = imageBuffer.toString('base64')

    const contents = [
      { text: PROMPT },
      {
        inlineData: {
          mimeType: mime,
          data: base64Image
        }
      }
    ]

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents
    })

    const parts = response?.candidates?.[0]?.content?.parts || []
    let sent = false

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64')
        await conn.sendFile(m.chat, buffer, 'figure.png', '', m)
        sent = true
      }
    }

    if (!sent) m.reply('⚠️ Tidak ada gambar yang dihasilkan.')
  } catch (e) {
    m.reply(`❌ Error: ${e.message}`)
  }
}

handler.help = ['tofigure2']
handler.tags = ['maker']
handler.command = ['tofigure2']

export default handler