// Script Ori By BochilGaming
// Ditulis Ulang Oleh ImYanXiao
// Disesuaikan Oleh ShirokamiRyzen
import fs from 'fs'
import { xpRange } from '../../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'
import fetch from 'node-fetch'
import { getDevice } from '@adiwajshing/baileys'

const defaultMenu = {
  before: `
● *Nama:*  %name 
● *Nomor:* %tag
● *Premium:* %prems
● *Limit:* %limit
● *Role:* %role

*${ucapan()} %name!*
● *Tanggal:* %week %weton
● *Date:* %date
● *Tanggal Islam:* %dateIslamic
● *Waktu:* %time

● *Nama Bot:* ${global.namebot}
● *Mode:* ${conn.public ? 'Public' : 'Self'}
● *Prefix:* [ *%_p* ]
● *Platform:* %platform
● *Type:* Node.JS
● *Database:* %rtotalreg dari %totalreg

⬣───「 *INFO CMD* 」───⬣
│ *Ⓟ* = Premium
│ *Ⓛ* = Limit
▣────────────⬣
  %readmore
  `.trimStart(),
  header: '╔══〘 🔰 %category 〙══',
  body: '║%cmd %isPremium %islimit',
  footer: '╚═════════════',
  after: ``,
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  if (m.isGroup && !global.db.data.chats[m.chat].menu) {
    throw `Admin telah mematikan menu`
  }

  let tags = {
    'main': 'Main',
    'ai': 'Ai Feature',
    'downloader': 'Downloader',
    'anime': 'Anime',
    'sticker': 'Sticker',
    'tools': 'Tools',
    'group': 'Group',
    'fun': 'Fun',
    'search': 'Search',
    'game': 'Game',
    'info': 'Info',
    'owner': 'Owner',
    'maker': 'Maker', 
    'audio': 'Audio', 
    'canime': 'Char Anime', 
    'news': 'News', 
    'religion': 'Agama', 
    'anonim': 'Anonim', 
    'nsfw': 'NSFW', 
    'panel': 'Ptrerodactyl', 
    'quotes': 'Quotes',
    'random': 'Random', 
    'rpg': 'RolePlay Game', 
    'stalk': 'Stalker', 
    'cai': 'Char AI'
  } 

  try {
    let lprem = global.lopr
    let llim = global.lolm
    let tag = `@${m.sender.split('@')[0]}`
    let device = await getDevice(m.id)

    let ucpn = `${ucapan()}`
    let d = new Date(new Date + 3600000)
    let locale = 'id'
    let week = d.toLocaleDateString(locale, { weekday: 'long' })
    let date = d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    let weton = ['Pahing', 'Pon', 'Wage', 'Kliwon', 'Legi'][Math.floor(d / 84600000) % 5]
    let dateIslamic = Intl.DateTimeFormat(locale + '-TN-u-ca-islamic', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(d)
    let time = d.toLocaleTimeString(locale, { hour: 'numeric', minute: 'numeric', second: 'numeric' })
    let _uptime = process.uptime() * 1000
    let muptime = clockString(_uptime)

    let { age, exp, limit, level, role, money } = global.db.data.users[m.sender]
    let { min, xp, max } = xpRange(level, global.multiplier)
    let name = await conn.getName(m.sender)
    let premium = global.db.data.users[m.sender].premiumTime
    let prems = `${premium > 0 ? 'Premium' : 'Free'}`
    let platform = os.platform()

    let totalreg = Object.keys(global.db.data.users).length
    let rtotalreg = Object.values(global.db.data.users).filter(user => user.registered == true).length

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
        limit: plugin.limit,
        premium: plugin.premium,
        enabled: !plugin.disabled,
      }
    })

    let groups = {}
    for (let tag in tags) {
      groups[tag] = []
      for (let plugin of help)
        if (plugin.tags && plugin.tags.includes(tag))
          if (plugin.help) groups[tag].push(plugin)
    }

    let before = defaultMenu.before
    let header = defaultMenu.header
    let body = defaultMenu.body
    let footer = defaultMenu.footer
    let after = defaultMenu.after

    let _text = [
      before,
      ...Object.keys(tags).map(tag => {
        return header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return body.replace(/%cmd/g, menu.prefix ? help : '%_p' + help)
                .replace(/%islimit/g, menu.limit ? llim : '')
                .replace(/%isPremium/g, menu.premium ? lprem : '')
                .trim()
            }).join('\n')
          }),
          footer
        ].join('\n')
      }),
      after
    ].join('\n')

    let replace = {
      '%': '%',
      p: muptime,
      me: conn.getName(conn.user.jid),
      tag, ucpn, platform, _p, '_p': _p, money, age, name, prems, level, limit, weton, week, date, dateIslamic, time, totalreg, rtotalreg, role,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'),
      (_, name) => '' + replace[name])

    const thumb = await fetch(global.thumbnail).then(res => res.buffer())

    conn.relayMessage(m.chat, {
      extendedTextMessage: {
        text: text,
        contextInfo: {
          mentionedJid: [m.sender],
          externalAdReply: {
            title: global.wm,
            mediaType: 1,
            previewType: 0,
            renderLargerThumbnail: true,
            thumbnail: fs.readFileSync('./media/kzy.jpg'),
            sourceUrl: global.sgc,
          }
        }, mentions: [m.sender]
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { 
      audio: { url: "https://files.catbox.moe/9zapgw.mp3" }, 
      mimetype: 'audio/mp4', 
      ptt: true 
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, 'Maaf, menu sedang error', m)
    throw e
  }
}

handler.help = ['menu']
handler.tags = ['main']
handler.command = /^(menu|help|\?)$/i
handler.register = false
handler.exp = false
export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000)
  let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60
  let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60
  return [h, ' H ', m, ' M ', s, ' S '].map(v => v.toString().padStart(2, 0)).join('')
}

function ucapan() {
  const time = moment.tz('Asia/Jakarta').format('HH')
  if (time >= 4 && time < 10) return "Pagi Kak 🌄"
  if (time >= 10 && time < 15) return "Siang Kak ☀️"
  if (time >= 15 && time < 18) return "Sore Kak 🌇"
  return "Malam Kak 🌙"
}