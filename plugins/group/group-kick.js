import { areJidsSameUser } from '@adiwajshing/baileys'
import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, participants }) => {
    let usr = m.quoted ? [m.quoted.sender] : m.mentionedJid
    if (!usr || usr.length === 0) {
        return m.reply(`Format salah!\nGunakan dengan mention atau reply pesan target.\n\nContoh:\n.kick @user`)
    }

    let users = usr.filter(u => !areJidsSameUser(u, conn.user.id))
    let kickedUser = []
    for (let user of users) {
        if (user.endsWith('@s.whatsapp.net')) {
            const res = await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            kickedUser = kickedUser.concat(res)
            await delay(1000)
        }
    }

    let res = await fetch('https://files.catbox.moe/lc5y3o.jpg')
    let buffer = await res.buffer()
    let sticker = new Sticker(buffer, {
        pack: 'Group Admin',
        author: 'Bot',
        type: 'default',
        categories: ['😡'],
        id: 'kick-sticker',
        quality: 80
    })
    let stickerBuffer = await sticker.toBuffer()
    await conn.sendMessage(m.chat, { sticker: stickerBuffer }, { quoted: m })
}

handler.help = ['kick']
handler.tags = ['group']
handler.command = /^(kick|dor)$/i
handler.admin = true
handler.group = true
handler.botAdmin = true
export default handler

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))