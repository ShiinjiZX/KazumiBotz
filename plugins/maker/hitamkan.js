/*
Jangan Hapus Wm Bang 

*Penghitam Waipu  Plugins Esm*

Ini Versi Tanpa Gemini Ya Cba Aja Lah 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VbB0oUvBlHpYbmFDsb3E
*/

import axios from "axios";
import fs from "fs";

const handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';

        if (!mime.startsWith('image')) 
            throw `Balas gambar dengan perintah *${usedPrefix + command}*`;
        await m.reply("wait otw menghitamkan😡");
        
        const media = await q.download();
        
        const result = await penghitamanMassal({
            buffer: media,
            filter: "hitam"
        });
        
        await conn.sendMessage(m.chat, {
            image: result,
        }, { quoted: m });
    } catch (error) {
        m.reply(`Terjadi kesalahan: ${error.message}`);
    }
};

async function penghitamanMassal(options = {}) {
    if (!options.buffer) 
        throw new Error("Buffer tidak boleh kosong!");
    
    if (!["need", "coklat", "hitam"].includes(options.filter)) 
        throw new Error("Pilihan Filter Tidak Valid!");

    const payload = {
        imageData: options.buffer.toString("base64"),
        filter: options.filter
    };

    const res = await axios.post("https://negro.consulting/api/process-image", payload);
    
    if (res.data && res.data.status === "success" && res.data.processedImageUrl) {
        const imgRes = await axios.get(res.data.processedImageUrl, { responseType: "arraybuffer" });
        return Buffer.from(imgRes.data);
    } else {
        throw new Error("Gagal memproses gambar.");
    }
}

handler.help = ['penghitaman'];
handler.command = ['penghitaman', 'hytam', 'hitamkan', 'hitam'];
handler.tags = ['maker'];

export default handler;