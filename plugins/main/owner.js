import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  let who = m.mentionedJid && m.mentionedJid[0] 
    ? m.mentionedJid[0] 
    : m.fromMe 
      ? conn.user.jid 
      : m.sender

  let pp = await conn.profilePictureUrl(who).catch(_ => 'https://files.catbox.moe/l7b77z.jpg')
  let name = await conn.getName(who)

  // Fallback nomor owner (pastikan sudah ada di config.js sebagai global.nomorown)
  const nomor = global.nomorown || '6281234567890'

  // Bikin quoted kontak biar lebih rapih
  let fkontak = {
    key: { participant: '0@s.whatsapp.net' },
    message: {
      contactMessage: {
        displayName: await conn.getName(m.sender),
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:;a,;;;\nFN:${await conn.getName(m.sender)}\nTEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nEND:VCARD`
      }
    }
  }

  await conn.sendContactArray(m.chat, [
    [
      nomor,
      await conn.getName(nomor + '@s.whatsapp.net'),
      `💌 Owner Bot`,
      `ɴᴏᴛ ғᴀᴍᴏᴜs ᴊᴜsᴛ ᴀʟᴏɴᴇ ʙᴏʏ`,
      `ᴀʀᴀ ᴀʀᴀ~`,
      `🇯🇵 Japan`,
      `📍 i don't know`,
      `👤 ᴏᴡɴᴇʀ ᴛᴇʀᴀᴋᴏᴍᴀʀɪ`
    ],
    [
      conn.user.jid.split('@')[0],
      await conn.getName(conn.user.jid),
      `🎈 ʙᴏᴛ ᴡʜᴀᴛsᴀᴘᴘ`,
      `📵 ᴅᴏɴᴛ sᴘᴀᴍ/ᴄᴀʟʟ ᴍᴇ 😢`,
      `ɴᴏᴛʜɪɴɢ`,
      `🇮🇩 Indonesia`,
      `📍 i don't know`,
      `ʜᴀɴʏᴀ ʙᴏᴛ ʙɪᴀsᴀ`
    ]
  ], fkontak)

  await m.reply(`ᴍʏ ᴏᴡɴᴇʀ 🚫 ᴅᴏɴᴛ sᴘᴀᴍ ᴏʀ ʏᴏᴜ ᴡɪʟʟ ʙᴇ ʙʟᴏᴄᴋᴇᴅ`)
}

handler.help = ['owner', 'creator']
handler.tags = ['main']
handler.command = /^(owner|creator)$/i

export default handler