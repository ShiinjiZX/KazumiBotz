import fetch from 'node-fetch'

let timeout = 120000 // 2 menit
let poin = 4999

let handler = async (m, { conn, usedPrefix }) => {
  let res = await fetch('https://api.sxtream.xyz/games/tebakbendera')
  let json = await res.json()

  if (!json || !json.jawaban || !json.url) throw '❌ Soal tidak tersedia.'

  conn.tebakbendera = conn.tebakbendera || {}
  conn.tebakbendera[m.chat] = {
    jawaban: json.jawaban.toLowerCase(),
    expired: Date.now() + timeout,
    poin,
    timeout: setTimeout(() => {
      if (conn.tebakbendera[m.chat]) {
        m.reply(`⏰ Waktu habis!\nJawabannya adalah *${json.jawaban}*`)
        delete conn.tebakbendera[m.chat]
      }
    }, timeout)
  }

  await conn.sendFile(m.chat, json.url, 'bendera.jpg', `
🏳️ *TEBAK BENDERA*

Silakan tebak bendera di atas...
Timeout *${(timeout / 1000).toFixed(2)} detik*
Ketik *.teben* untuk bantuan
Bonus: ${poin} XP
`.trim(), m)
}

handler.help = ['tebakbendera']
handler.tags = ['game']
handler.command = /^tebakbendera$/i
handler.limit = true
handler.group = true

export default handler