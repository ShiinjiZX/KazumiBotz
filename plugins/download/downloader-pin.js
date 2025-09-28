/* 
`[pinterest]`
type : plugins esm
API : https://api.siputzx.my.id
*/

import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  global.db.data.users = global.db.data.users || {}
  let user = global.db.data.users[m.sender] || {}

  if (command == 'pin') {
    if (!text) return m.reply(`Masukkan keyword pencarian.\nContoh: ${command} Kaoruko Waguri`)
    user.lastPinterestQuery = text
    global.db.data.users[m.sender] = user
    await sendPinterestImage(m, conn, text)
  }

  if (command == 'lagi') {
    if (!user.lastPinterestQuery) return m.reply('Belum ada keyword pencarian.\nGunakan dulu: pin <keyword>')
    await sendPinterestImage(m, conn, user.lastPinterestQuery)
  }
}

handler.help = ['pinterest']
handler.tags = ['downloader']
handler.command = /^pin$|^lagi$/i
handler.limit = true

export default handler

async function sendPinterestImage(m, conn, query) {
  try {
    let res = await fetch(`https://api.siputzx.my.id/api/s/pinterest?query=${encodeURIComponent(query)}`)
    if (!res.ok) throw await res.text()

    let json = await res.json()
    if (!json.status || !json.data.length) return m.reply('Gambar tidak ditemukan.')

    let hasil = json.data[Math.floor(Math.random() * json.data.length)]

    let caption = `
📌 *${hasil.grid_title || 'Tanpa Judul'}*
📝 ${hasil.description || '-'}
👤 ${hasil.pinner.full_name} (@${hasil.pinner.username})
🔗 ${hasil.pin}

Ketik *.lagi* untuk gambar berikutnya.
    `.trim()

    await conn.sendFile(m.chat, hasil.image_url, 'pinterest.jpg', caption, m)

  } catch (e) {
    console.error(e)
    m.reply('Gagal mengambil data Pinterest.')
  }
}