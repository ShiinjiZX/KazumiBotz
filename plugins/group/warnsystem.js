/*
* Advanced Warning System
* Features: antilink, antimedia, spam protection, call protection
*/

import fs from 'fs'

const warnPath = './database/warn.json'
const antilinkPath = './database/antilink.json'
const antimediaPath = './database/antimedia.json'
const spamPath = './database/spam.json'

// Database utilities
function loadWarns() {
    if (!fs.existsSync(warnPath)) return {}
    return JSON.parse(fs.readFileSync(warnPath))
}

function saveWarns(data) {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    fs.writeFileSync(warnPath, JSON.stringify(data, null, 2))
}

function loadAntilink() {
    if (!fs.existsSync(antilinkPath)) return {}
    return JSON.parse(fs.readFileSync(antilinkPath))
}

function saveAntilink(data) {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    fs.writeFileSync(antilinkPath, JSON.stringify(data, null, 2))
}

function loadAntimedia() {
    if (!fs.existsSync(antimediaPath)) return {}
    return JSON.parse(fs.readFileSync(antimediaPath))
}

function saveAntimedia(data) {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    fs.writeFileSync(antimediaPath, JSON.stringify(data, null, 2))
}

function loadSpam() {
    if (!fs.existsSync(spamPath)) return {}
    return JSON.parse(fs.readFileSync(spamPath))
}

function saveSpam(data) {
    if (!fs.existsSync('./database')) fs.mkdirSync('./database')
    fs.writeFileSync(spamPath, JSON.stringify(data, null, 2))
}

// Warning functions
function addWarn(userId, chatId, reason, isGroup = true) {
    const warns = loadWarns()
    const key = isGroup ? `${userId}-${chatId}` : userId
    
    if (!warns[key]) {
        warns[key] = {
            count: 0,
            reasons: [],
            lastWarn: 0,
            isGroup: isGroup,
            chatId: chatId
        }
    }
    
    warns[key].count += 1
    warns[key].reasons.push({
        reason: reason,
        timestamp: Date.now()
    })
    warns[key].lastWarn = Date.now()
    
    saveWarns(warns)
    return warns[key]
}

function getWarn(userId, chatId, isGroup = true) {
    const warns = loadWarns()
    const key = isGroup ? `${userId}-${chatId}` : userId
    return warns[key] || { count: 0, reasons: [] }
}

function removeWarn(userId, chatId, isGroup = true) {
    const warns = loadWarns()
    const key = isGroup ? `${userId}-${chatId}` : userId
    
    if (warns[key] && warns[key].count > 0) {
        warns[key].count -= 1
        warns[key].reasons.pop()
        saveWarns(warns)
        return warns[key]
    }
    return null
}

function resetWarn(userId, chatId, isGroup = true) {
    const warns = loadWarns()
    const key = isGroup ? `${userId}-${chatId}` : userId
    delete warns[key]
    saveWarns(warns)
}

// Check spam protection
function checkSpam(userId, command) {
    const spamData = loadSpam()
    const now = Date.now()
    const key = `${userId}-${command}`
    
    if (!spamData[key]) {
        spamData[key] = { lastUsed: now, count: 1 }
        saveSpam(spamData)
        return false
    }
    
    // Check if 3 seconds have passed
    if (now - spamData[key].lastUsed < 3000) {
        spamData[key].count += 1
        saveSpam(spamData)
        return true // It's spam
    }
    
    spamData[key] = { lastUsed: now, count: 1 }
    saveSpam(spamData)
    return false
}

// Link detection
function detectLinks(text) {
    const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[^\s]+\.[a-z]{2,}[^\s]*)/gi
    const whatsappGroupRegex = /(https?:\/\/)?(chat|wa)\.whatsapp\.com\/[^\s]+/gi
    const whatsappChannelRegex = /(https?:\/\/)?whatsapp\.com\/channel\/[^\s]+/gi
    
    const links = text.match(linkRegex) || []
    const groupLinks = text.match(whatsappGroupRegex) || []
    const channelLinks = text.match(whatsappChannelRegex) || []
    
    return {
        hasLinks: links.length > 0,
        hasGroupLinks: groupLinks.length > 0,
        hasChannelLinks: channelLinks.length > 0,
        allLinks: links
    }
}

// Media type detection
function getMediaTypes(m) {
    const types = []
    
    if (m.mtype === 'audioMessage') types.push('audio')
    if (m.mtype === 'pttMessage') types.push('voicenote')
    if (m.mtype === 'imageMessage') types.push('image')
    if (m.mtype === 'videoMessage') types.push('video')
    if (m.mtype === 'documentMessage') types.push('document')
    if (m.mtype === 'stickerMessage') types.push('sticker')
    
    return types
}

// Main warning processor
async function processWarning(m, conn) {
    const isGroup = m.isGroup
    const userId = m.sender
    const chatId = m.chat
    const maxWarns = isGroup ? 5 : 5 // Can be configured
    
    let warnCount = 0
    let reasons = []
    
    // Check antilink
    if (isGroup) {
        const antilinkSettings = loadAntilink()
        const chatSettings = antilinkSettings[chatId] || { enabled: false, kick: false }
        
        if (chatSettings.enabled && m.text) {
            const linkInfo = detectLinks(m.text)
            
            if (linkInfo.hasGroupLinks || linkInfo.hasChannelLinks) {
                // Delete message
                await conn.sendMessage(chatId, { delete: m.key })
                
                if (chatSettings.kick) {
                    const warnData = addWarn(userId, chatId, 'Mengirim link grup/channel', true)
                    warnCount = warnData.count
                    reasons.push('Link grup/channel')
                    
                    await conn.sendMessage(chatId, {
                        text: `⚠️ Warning ${warnCount}/${maxWarns}\n👤 @${userId.split('@')[0]}\n📝 Alasan: Mengirim link grup/channel\n\n${warnCount >= maxWarns ? '🚫 Batas warning tercapai! User akan dikick.' : ''}`,
                        mentions: [userId]
                    })
                    
                    if (warnCount >= maxWarns) {
                        await conn.groupParticipantsUpdate(chatId, [userId], 'remove')
                        resetWarn(userId, chatId, true)
                        return true
                    }
                } else {
                    await conn.sendMessage(chatId, {
                        text: `🚫 Link dihapus!\n👤 @${userId.split('@')[0]}\nLink grup/channel tidak diperbolehkan.`,
                        mentions: [userId]
                    })
                }
                return true
            }
        }
    }
    
    // Check antimedia
    if (isGroup) {
        const antimediaSettings = loadAntimedia()
        const chatSettings = antimediaSettings[chatId] || { enabled: false, types: [] }
        
        if (chatSettings.enabled) {
            const mediaTypes = getMediaTypes(m)
            const blockedTypes = mediaTypes.filter(type => 
                chatSettings.types.length === 0 || chatSettings.types.includes(type)
            )
            
            if (blockedTypes.length > 0) {
                await conn.sendMessage(chatId, { delete: m.key })
                
                const warnData = addWarn(userId, chatId, `Mengirim media: ${blockedTypes.join(', ')}`, true)
                warnCount = warnData.count
                reasons.push(`Media: ${blockedTypes.join(', ')}`)
                
                await conn.sendMessage(chatId, {
                    text: `⚠️ Warning ${warnCount}/${maxWarns}\n👤 @${userId.split('@')[0]}\n📝 Alasan: Mengirim media (${blockedTypes.join(', ')})\n\n${warnCount >= maxWarns ? '🚫 Batas warning tercapai! User akan dikick.' : ''}`,
                    mentions: [userId]
                })
                
                if (warnCount >= maxWarns) {
                    await conn.groupParticipantsUpdate(chatId, [userId], 'remove')
                    resetWarn(userId, chatId, true)
                    return true
                }
                return true
            }
        }
    }
    
    return false
}

// Command handlers
let antilinkHandler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('Command ini khusus untuk grup!')
    if (!isAdmin && !isOwner) return m.reply('Hanya admin yang bisa menggunakan command ini!')
    
    const antilinkSettings = loadAntilink()
    const chatId = m.chat
    
    if (!text) {
        const current = antilinkSettings[chatId] || { enabled: false, kick: false }
        return m.reply(`Status Antilink:
${current.enabled ? '✅ Aktif' : '❌ Nonaktif'}
Mode: ${current.kick ? 'Kick + Warn' : 'Delete Only'}

Usage:
.antilink on - Aktifkan (delete only)
.antilink on kick - Aktifkan dengan kick + warn
.antilink off - Nonaktifkan`)
    }
    
    const args = text.toLowerCase().split(' ')
    
    if (args[0] === 'on') {
        const kick = args[1] === 'kick'
        antilinkSettings[chatId] = { enabled: true, kick: kick }
        saveAntilink(antilinkSettings)
        
        m.reply(`✅ Antilink diaktifkan!
Mode: ${kick ? 'Kick + Warning' : 'Delete Only'}`)
        
    } else if (args[0] === 'off') {
        delete antilinkSettings[chatId]
        saveAntilink(antilinkSettings)
        m.reply('❌ Antilink dinonaktifkan!')
    }
}

let antimediaHandler = async (m, { conn, text, isAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('Command ini khusus untuk grup!')
    if (!isAdmin && !isOwner) return m.reply('Hanya admin yang bisa menggunakan command ini!')
    
    const antimediaSettings = loadAntimedia()
    const chatId = m.chat
    
    if (!text) {
        const current = antimediaSettings[chatId] || { enabled: false, types: [] }
        const typesList = current.types.length > 0 ? current.types.join(', ') : 'semua'
        
        return m.reply(`Status Antimedia:
${current.enabled ? '✅ Aktif' : '❌ Nonaktif'}
Tipe yang diblokir: ${typesList}

Usage:
.antimedia on - Blokir semua media
.antimedia on audio - Blokir audio saja
.antimedia on audio, image - Blokir audio & image
.antimedia off - Nonaktifkan

Tipe tersedia: audio, voicenote, image, video, document, sticker`)
    }
    
    const args = text.toLowerCase().split(' ')
    
    if (args[0] === 'on') {
        let types = []
        if (args.length > 1) {
            const typeStr = args.slice(1).join(' ')
            types = typeStr.split(',').map(t => t.trim())
        }
        
        antimediaSettings[chatId] = { enabled: true, types: types }
        saveAntimedia(antimediaSettings)
        
        const typesList = types.length > 0 ? types.join(', ') : 'semua media'
        m.reply(`✅ Antimedia diaktifkan!
Memblokir: ${typesList}`)
        
    } else if (args[0] === 'off') {
        delete antimediaSettings[chatId]
        saveAntimedia(antimediaSettings)
        m.reply('❌ Antimedia dinonaktifkan!')
    }
}

let warnHandler = async (m, { conn, text, isAdmin, isOwner, usedPrefix, command }) => {
    if (!isAdmin && !isOwner) return m.reply('Hanya admin yang bisa menggunakan command ini!')
    
    const isGroup = m.isGroup
    const args = text ? text.split(' ') : []
    
    if (args[0] === 'add' && (m.quoted || args[1])) {
        const target = m.quoted ? m.quoted.sender : args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        const reason = args.slice(m.quoted ? 1 : 2).join(' ') || 'Pelanggaran aturan'
        
        const warnData = addWarn(target, m.chat, reason, isGroup)
        const maxWarns = isGroup ? 5 : 5
        
        m.reply(`⚠️ Warning berhasil diberikan!
👤 Target: @${target.split('@')[0]}
📝 Alasan: ${reason}
📊 Warning: ${warnData.count}/${maxWarns}`, null, { mentions: [target] })
        
        if (warnData.count >= maxWarns) {
            if (isGroup) {
                await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
                resetWarn(target, m.chat, true)
                m.reply(`🚫 @${target.split('@')[0]} telah dikick karena mencapai batas warning!`, null, { mentions: [target] })
            } else {
                await conn.updateBlockStatus(target, 'block')
                resetWarn(target, '', false)
                m.reply(`🚫 @${target.split('@')[0]} telah diblokir karena mencapai batas warning!`, null, { mentions: [target] })
            }
        }
        
    } else if (args[0] === 'remove' && (m.quoted || args[1])) {
        const target = m.quoted ? m.quoted.sender : args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        
        const warnData = removeWarn(target, m.chat, isGroup)
        if (warnData) {
            m.reply(`✅ 1 warning dihapus dari @${target.split('@')[0]}
📊 Warning sekarang: ${warnData.count}/5`, null, { mentions: [target] })
        } else {
            m.reply(`❌ @${target.split('@')[0]} tidak memiliki warning`, null, { mentions: [target] })
        }
        
    } else if (args[0] === 'reset' && (m.quoted || args[1])) {
        const target = m.quoted ? m.quoted.sender : args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        
        resetWarn(target, m.chat, isGroup)
        m.reply(`✅ Semua warning @${target.split('@')[0]} telah direset`, null, { mentions: [target] })
        
    } else if (args[0] === 'check' && (m.quoted || args[1])) {
        const target = m.quoted ? m.quoted.sender : args[1].replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        
        const warnData = getWarn(target, m.chat, isGroup)
        if (warnData.count === 0) {
            m.reply(`✅ @${target.split('@')[0]} tidak memiliki warning`, null, { mentions: [target] })
        } else {
            let reasonList = warnData.reasons.map((r, i) => `${i + 1}. ${r.reason}`).join('\n')
            m.reply(`⚠️ Warning @${target.split('@')[0]}:
📊 Total: ${warnData.count}/5
📝 Alasan:
${reasonList}`, null, { mentions: [target] })
        }
        
    } else {
        m.reply(`Usage: ${usedPrefix + command} <add/remove/reset/check> [@user/reply] [reason]

Contoh:
${usedPrefix + command} add @user spam
${usedPrefix + command} remove @user  
${usedPrefix + command} reset @user
${usedPrefix + command} check @user`)
    }
}

// Call protection handler
global.callProtection = async (call, conn) => {
    if (call.status === 'ringing') {
        const callerId = call.from
        const warnData = addWarn(callerId, '', 'Menelpon bot', false)
        
        await conn.rejectCall(call.id)
        
        if (warnData.count >= 5) {
            await conn.updateBlockStatus(callerId, 'block')
            resetWarn(callerId, '', false)
            console.log(`User ${callerId} diblokir karena terlalu banyak menelpon`)
        } else {
            await conn.sendMessage(callerId, {
                text: `⚠️ Warning ${warnData.count}/5

Jangan menelpon bot! Gunakan chat untuk berinteraksi.
${warnData.count >= 5 ? '\n🚫 Anda akan diblokir jika terus menelpon!' : ''}`
            })
        }
    }
}

// Spam check function for other plugins
global.checkSpamCommand = checkSpam

// Main processor export
export { processWarning }

// Command exports
export const antilink = antilinkHandler
antilink.help = ['antilink <on/off>']
antilink.tags = ['group']
antilink.command = /^antilink$/i
antilink.group = true
antilink.admin = true

export const antimedia = antimediaHandler
antimedia.help = ['antimedia <on/off> [types]']
antimedia.tags = ['group']
antimedia.command = /^antimedia$/i
antimedia.group = true
antimedia.admin = true

export const warn = warnHandler
warn.help = ['warn <add/remove/reset/check>']
warn.tags = ['group']
warn.command = /^warn$/i
warn.admin = true

export default antilinkHandler