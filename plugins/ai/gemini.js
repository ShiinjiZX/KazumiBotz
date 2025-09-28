/*
* Nama fitur : Gemini Multi-modal++
* Type : Plugin ESM
* Author : ZenzzXD (mod by ChatGPT)
*/

import { GoogleGenAI } from '@google/genai'
import fs from 'fs'
import { Document, Packer, Paragraph } from 'docx'
import pptxgen from 'pptxgenjs'
import PDFDocument from 'pdfkit'

// simpan semua API key di array
const APIKEYS = [
  'AIzaSyCcq0kxUwxFPw4AoFfDUW9DSC1cggkqvII',
  'AIzaSyDxmTCmn0LA2NuggIYLynNlqanTJW0hhhg',
  'AIzaSyBTPh9Ol62NW5KPXHXPjtZA-LMEkGaoekw'
]

// fungsi pilih random API key
const getRandomKey = () => APIKEYS[Math.floor(Math.random() * APIKEYS.length)]

// prompt default
const DEFAULT_PROMPT = `Kamu adalah Gemini assisten virtual yang dikembangkan oleh Google.
Gunakanlah Bahasa Indonesia Sebagai Bahasa Default Mu, Jika ada yang menggunakan bahasa lain maka gunakanlah bahasa itu.`

const handler = async (m, { conn, text, usedPrefix, command }) => {
try {
      const quoted = m.quoted || m
      const mime = quoted.mimetype || ''
      const apiKey = getRandomKey()
      const ai = new GoogleGenAI({ apiKey })

      let contents = []

      // Analisis gambar / stiker
      if (/image/.test(mime) || /webp/.test(mime)) {
        const buffer = await quoted.download()
        if (!buffer) return m.reply('⚠️ Error pas mengunduh gambar/stiker')

        const base64Image = buffer.toString('base64')
        contents = [
          { text: text || "Deskripsikan secara detail isi gambar/stiker ini." },
          { inlineData: { mimeType: mime, data: base64Image } }
        ]

        m.reply('⏳ Lagi menganalisis gambar...')

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents
        })

        const parts = response?.candidates?.[0]?.content?.parts || []
        let sentText = false

        for (const part of parts) {
          if (part.text) {
            await m.reply(`📌 Analisis gambar/stiker:\n\n${part.text}`)
            sentText = true
          }
        }

        if (!sentText) m.reply('⚠️ Tidak ada hasil analisis.')
        return
      }

      // Analisis audio / video
      if (/audio|video/.test(mime)) {
        const buffer = await quoted.download()
        if (!buffer) return m.reply('⚠️ Error pas mengunduh media')

        const base64Media = buffer.toString('base64')
        contents = [
          { text: text || DEFAULT_PROMPT },
          { inlineData: { mimeType: mime, data: base64Media } }
        ]

        m.reply('🎧🔎 Lagi identifikasi media...')

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents
        })

        const hasil = response?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!hasil) return m.reply('⚠️ Tidak ada hasil identifikasi.')
        m.reply(`📌 Hasil identifikasi:\n\n${hasil}`)
        return
      }

      // Mode teks
      if (text) {
        const args = text.split(" ")
        let mode = "chat"
        if (args.includes("--ppt")) mode = "ppt"
        if (args.includes("--word")) mode = "word"
        if (args.includes("--pdf")) mode = "pdf"

        contents = [{ text: text.replace(/--\w+/g, "") }]
        m.reply(`💬 Lagi mikir jawaban (${mode})...`)

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents
        })

        const hasil = response?.candidates?.[0]?.content?.parts?.[0]?.text
        if (!hasil) return m.reply('⚠️ Tidak ada jawaban.')

        if (mode === "chat") {
          m.reply(hasil)
        } else if (mode === "word") {
          const doc = new Document({
            sections: [{ properties: {}, children: [new Paragraph(hasil)] }]
          })
          const buffer = await Packer.toBuffer(doc)
          await conn.sendFile(m.chat, buffer, 'AI_Doc.docx', '📄 Word berhasil dibuat!', m)
        } else if (mode === "ppt") {
          let pptx = new pptxgen()
          let slide = pptx.addSlide()
          slide.addText(hasil, { x:1, y:1, fontSize:18 })
          const buffer = await pptx.write("nodebuffer")
          await conn.sendFile(m.chat, buffer, 'AI_Presentation.pptx', '📊 PPT berhasil dibuat!', m)
        } else if (mode === "pdf") {
          let doc = new PDFDocument()
          let buffers = []
          doc.on('data', buffers.push.bind(buffers))
          doc.on('end', async () => {
            let pdfData = Buffer.concat(buffers)
            await conn.sendFile(m.chat, pdfData, 'AI_Doc.pdf', '📑 PDF berhasil dibuat!', m)
          })
          doc.text(hasil)
          doc.end()
        }
        return
      }

      m.reply(`❌ Cara pakai:
- Balas gambar/audio/video pakai ${usedPrefix + command}
- atau ketik teks setelah command.
Tambahan output:
--word = buat Word
--ppt = buat PPT
--pdf = buat PDF`)

    } catch (e) {
      m.reply(`❌ Error: ${e.message}`)
    }
  }

handler.help = ['gemini <teks>|<balas media>', 'gemini <teks> --word/--ppt/--pdf/--video']
handler.tags = ['ai']
handler.command = ['gemini']

export default handler