let handler = async (m, { conn, text, usedPrefix, command }) => {
  let reaction = '🕒'
  await m.react(reaction)

  if (!text) {
    await m.react('⚠️')
    throw `⚠️ Siapa yang mau dijadikan *Premium*?\n\n📌 Contoh:\n${usedPrefix + command} @user 7`
  }

  let [target, daysStr] = text.trim().split(/\s+/)
  let who

  // Deteksi dari reply
  if (m.quoted) {
    who = m.quoted.sender
    daysStr = target
  }
  // Dari tag @
  else if (target?.startsWith('@')) {
    who = target.replace(/^@/, '') + '@s.whatsapp.net'
  }
  // Dari nomor langsung
  else if (/^\d{5,}$/.test(target)) {
    who = target + '@s.whatsapp.net'
  }

  if (!who) {
    await m.react('⚠️')
    throw `⚠️ Tidak bisa mendeteksi user.\n\nGunakan tag, reply, atau nomor WA.\n\n📌 Contoh:\n${usedPrefix + command} @user 7`
  }

  if (!daysStr || isNaN(daysStr)) {
    await m.react('⚠️')
    throw `⚠️ Masukkan jumlah hari dalam angka.\n\n📌 Contoh:\n${usedPrefix + command} @user 7`
  }

  let jumlahHari = parseInt(daysStr)
  let msHari = 86400000 * jumlahHari
  let now = Date.now()

  // Pastikan user ada di database
  let user = global.db?.data?.users?.[who]
  if (!user) {
    await m.react('❌')
    throw `❌ Data pengguna tidak ditemukan di database.`
  }

  // Cek apakah sudah premium dan masih aktif
  if (user.premium && user.premiumTime && user.premiumTime > now) {
    let sisaHari = Math.floor((user.premiumTime - now) / 86400000)
    await m.react('ℹ️')
    return await m.reply(`
⚠️ *Pengguna Sudah Premium!*

👤 *Nama:* ${user.name || '-'}
🆔 *User:* wa.me/${who.split('@')[0]}
📆 *Durasi Aktif:* ${sisaHari} hari lagi

✅ Premium tetap dipertahankan.
`.trim())
  }

  // Aktifkan atau perpanjang premium
  user.premiumTime = (user.premiumTime && user.premiumTime > now)
    ? user.premiumTime + msHari
    : now + msHari
  user.premium = true
  user.limitprem = 10000

  let emojiList = ['🎉', '✨', '👑', '🥳', '💎']
  let randomEmoji = emojiList[Math.floor(Math.random() * emojiList.length)]

  await m.react('✅')
  await m.reply(`
${randomEmoji} *PREMIUM AKTIF*

👤 *Nama:* ${user.name || '-'}
🆔 *User:* wa.me/${who.split('@')[0]}
📆 *Durasi:* ${jumlahHari} hari

✅ Premium berhasil diaktifkan!
`.trim())
}

handler.help = ['addprem @user 7', 'addprem 628xxxxx 7']
handler.tags = ['owner']
handler.command = /^(add|tambah|\+)p(rem)?$/i

handler.group = false
handler.owner = true

export default handler