import { readFileSync, watchFile, unwatchFile, createWriteStream, unlinkSync } from 'fs'
import { fileURLToPath } from 'url'
import { format } from 'util'
import { exec } from 'child_process'
import { createRequire } from 'module'
import axios from 'axios'
import FormData from 'form-data'
import { fileTypeFromBuffer } from 'file-type'


const __filename = fileURLToPath(import.meta.url)
const require = createRequire(import.meta.url)

// Required modules untuk CommonJS compatibility
let fs
try {
    fs = require('fs')
} catch (error) {
    console.error('Missing fs module:', error.message)
}

const commandMetadata = {
    'kyy': {
        help: ['kyy'],
        tags: ['main'],
        exp: 10
    }, 
    'shorturl': {
        help: ['shorturl','shorturl2'],
        tags: ['tools'],
        exp: 10
    }
}

// Upload function using yupra.my.id
async function uploadFile(buffer, filename) {
    try {
        const form = new FormData()
        form.append('files', buffer, { filename })

        const response = await axios.post('https://cdn.yupra.my.id/upload', form, {
            headers: {
                ...form.getHeaders(),
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
            },
            timeout: 120000
        })

        if (response.data.success && response.data.files?.[0]) {
            return `https://cdn.yupra.my.id${response.data.files[0].url}`
        }
        
        throw new Error('Upload failed')
    } catch (error) {
        console.error('Upload error:', error)
        throw error
    }
}

// Smart file extension detection
function getFileExtension(buffer, mimetype) {
    // Try to get extension from buffer
    return fileTypeFromBuffer(buffer).then(type => {
        if (type?.ext) return type.ext
        
        // Fallback to mimetype
        const mimeMap = {
            'image/jpeg': 'jpg',
            'image/jpg': 'jpg', 
            'image/png': 'png',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'video/avi': 'avi',
            'video/mkv': 'mkv'
        }
        
        return mimeMap[mimetype] || 'jpg'
    }).catch(() => 'jpg')
}

/**
 * Main case handler function
 */
export default async function caseHandler(conn, m, extra) {
    try {
        const { 
            usedPrefix, 
            command, 
            args, 
            text, 
            isROwner, 
            isOwner, 
            isPrems,
            isMods,
            isAdmin,
            isRAdmin,
            isBotAdmin,
            groupMetadata,
            participants,
            user,
            bot
        } = extra

        // Basic variables
        const body = m.text || ''
        const budy = (typeof m.text === 'string') ? m.text : ''
        const sender = m.sender
        const senderNumber = sender.split('@')[0]
        const pushname = m.pushName || m.name || senderNumber
        const isPrem = isPrems
        const userData = global.db?.data?.users?.[sender] || {}
        const chatData = global.db?.data?.chats?.[m.chat] || {}
        const quoted = m.quoted ? m.quoted : m
        const mime = (quoted?.msg || quoted)?.mimetype || quoted?.mtype || ''

        // Main switch case
        switch(command.toLowerCase()) {
            
case "kyy":
case "kazumi":
        {
          m.reply("apa anj!") 
        }
        break;
        
// Croot Link
case "shortlink": 
case "shorturl": {
    if (!text) return conn.sendMessage(m.chat, { text: "Kirim link yang mau di-short!" }, { quoted: m });
    try {
        const { data } = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(text)}`);
        conn.sendMessage(m.chat, { text: `${data}` }, { quoted: m });
    } catch (err) {
        console.log(err);
        conn.sendMessage(m.chat, { text: "Gagal membuat shortlink!" }, { quoted: m });
    }
    }
break;        

case "shortlink2":
case "shorten":
 if (!text) {
 await conn.sendMessage(m.chat, { text: `\`Example\`: *${usedPrefix + command} https://google.com*` }, { quoted: m });
 break;
 }

 if (!/^(https?:\/\/)/i.test(text)) {
 await conn.sendMessage(m.chat, { text: "URL tidak valid. Sertakan http:// atau https://" }, { quoted: m });
 break;
 }

 try {
 await conn.sendMessage(m.chat, { react: { text: "🔗", key: m.key } });

 const axios = (await import("axios")).default;
 const apiUrl = `https://api.vreden.my.id/api/tools/shortlink/ouo?url=${encodeURIComponent(text)}`;
 const { data: result } = await axios.get(apiUrl, {
 headers: {
 "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
 },
 });

 if (result.status !== 200 || !result.result) throw new Error(result.message || "Gagal memendekkan link.");

 const responseText = `
🔗 *URL Shortener Berhasil*

*Original:* ${text}
*Hasil:* ${result.result}
 `.trim();

 await conn.sendMessage(m.chat, { text: responseText }, { quoted: m });
 } catch (e) {
 console.error("Shortlink Error:", e);
 await conn.sendMessage(m.chat, { text: `❌ Terjadi kesalahan: ${e.message}` }, { quoted: m });
 }
 break;

            default:
                // Handle owner eval shortcuts
                if (budy.startsWith('=>') && isOwner) {
                    try {
                        let result = await eval(`(async () => { return ${budy.slice(3)} })()`)
                        m.reply(format(result))
                    } catch (e) {
                        m.reply(String(e))
                    }
                }

                if (budy.startsWith('>') && isOwner) {
                    let code = budy.trim().split(/ +/)[0]
                    let evalText = text || budy.slice(code.length).trim()
                    try {
                        let result = await eval(`(async () => { ${code === ">>" ? "return" : ""} ${evalText}})()`)
                        m.reply(format(result))
                    } catch (e) {
                        m.reply(String(e))
                    }
                }

                if (budy.startsWith('$') && isOwner) {
                    exec(budy.slice(2), (err, stdout, stderr) => {
                        if (err) return m.reply(`${err}`)
                        if (stderr) return m.reply(`${stderr}`)
                        if (stdout) return m.reply(stdout)
                    })
                }
        }

    } catch (error) {
        console.error('Case Handler Error:', error)
        m.reply('❌ Terjadi kesalahan sistem')
    }
}

// Export metadata untuk integrasi menu
export { commandMetadata }

// File watcher
watchFile(__filename, () => {
    unwatchFile(__filename)
    console.log(`🔄 Updated ${__filename}`)
})