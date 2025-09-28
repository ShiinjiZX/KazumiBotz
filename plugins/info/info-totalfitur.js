import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { existsSync } from 'fs'

let handler = async (m, { conn, command }) => {
    await m.react('🕒')

    // Hitung total fitur (plugin yg ada help & tags)
    let totalFitur = Object.values(global.plugins).filter(v => v.help && v.tags).length

    // Hitung total command dari semua plugin
    let totalCommand = Object.values(global.plugins).map(v => v.command)
        .filter(v => v) // hanya yang punya command
        .map(v => Array.isArray(v) ? v.length : 1) // kalau array, ambil length-nya, kalau bukan berarti 1
        .reduce((a, b) => a + b, 0) // totalin semua

    await m.react('✅')

    let caption = `
📊 *INFORMASI BOT*

🔧 Total fitur aktif: *${totalFitur}*
📖 Total command aktif: *${totalCommand}*

Ketik *.menu* atau *.help* untuk lihat daftar fitur lengkap.
`.trim()

    // Dapatkan path yang benar
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    
    // Coba beberapa kemungkinan lokasi media
    const possiblePaths = [
        join(__dirname, '../../media/kzm.jpg'),
        join(process.cwd(), 'media/kzm.jpg'),
        join(__dirname, '../media/kzm.jpg'),
        './media/kzm.jpg',
        'media/kzm.jpg'
    ]
    
    let imagePath = null
    for (let path of possiblePaths) {
        if (existsSync(path)) {
            imagePath = path
            break
        }
    }

    // Kirim dengan gambar jika ada, tanpa gambar jika tidak ada
    if (imagePath) {
        try {
            await conn.sendFile(m.chat, imagePath, 'kzm.jpg', caption, m)
        } catch (e) {
            console.log('Error sending image:', e.message)
            // Fallback ke text biasa jika gambar gagal
            await conn.reply(m.chat, caption, m)
        }
    } else {
        // Kirim text biasa jika gambar tidak ditemukan
        await conn.reply(m.chat, caption, m)
    }

    // Coba kirim audio jika ada
    const possibleAudioPaths = [
        join(__dirname, '../../media/audio.mp3'),
        join(process.cwd(), 'media/audio.mp3'),
        join(__dirname, '../media/audio.mp3'),
        './media/audio.mp3',
        'media/audio.mp3'
    ]
    
    let audioPath = null
    for (let path of possibleAudioPaths) {
        if (existsSync(path)) {
            audioPath = path
            break
        }
    }

    if (audioPath) {
        try {
            await conn.sendMessage(m.chat, {
                audio: { url: audioPath },
                mimetype: 'audio/mp4',
                ptt: true
            }, { quoted: m })
        } catch (e) {
            console.log('Error sending audio:', e.message)
            // Tidak perlu fallback untuk audio, cukup skip
        }
    }
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']

export default handler