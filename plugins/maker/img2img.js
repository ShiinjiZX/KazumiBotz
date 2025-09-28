// • Feature : img2img ( editimg )
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110

import fetch from "node-fetch";
import FormData from "form-data";
import cheerio from "cheerio";

// =================== UPLOAD IMAGE ===================
async function alfixdRaw(fileBuffer) {
    try {
        const form = new FormData();
        form.append("file", fileBuffer, {
            filename: "upload.jpg",
        });

        const response = await fetch("https://upfilegh.alfiisyll.biz.id/upload", {
            method: "POST",
            body: form,
            headers: form.getHeaders(),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);

        const html = await response.text();
        const $ = cheerio.load(html);
        const rawUrl = $("#rawUrlLink").attr("href");

        if (!rawUrl) throw new Error("Gagal mengambil URL gambar mentah.");
        return rawUrl;
    } catch (error) {
        console.error("[alfixdRaw] Upload error:", error.message);
        return null;
    }
}

async function uploadImage(imageBuffer) {
    if (!imageBuffer || !Buffer.isBuffer(imageBuffer))
        throw new Error("Buffer gambar tidak valid.");
    return await alfixdRaw(imageBuffer);
}
// ====================================================

const handler = async (m, { conn, text, command, usedPrefix }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        if (!q) return m.reply("❌ *Balas gambar dengan perintah ini!*");

        const mime = (q.msg || q).mimetype || q.mediaType || "";
        if (!/^image/.test(mime) || /webp/.test(mime)) {
            return m.reply(
                `*Cara penggunaan:*\n1. Kirim gambar (JPG/PNG).\n2. Balas dengan: ${usedPrefix}${command} [prompt]\n\n*Contoh:* ${usedPrefix}${command} cyberpunk city at night`
            );
        }

        if (!text)
            return m.reply(
                `⚠️ Masukkan prompt!\n*Contoh:* ${usedPrefix}${command} make it a fantasy landscape`
            );

        const loadingMsg = await conn.sendMessage(m.chat, {
            text: `⏳ *Generating AI image with prompt:*\n"${text}"\nPlease wait...`,
        });

        const imageBuffer = await q.download();
        const out = await uploadImage(imageBuffer);
        if (!out) throw new Error("Gagal mengunggah gambar ke server uploader.");

        const apiUrl = `https://api.nekolabs.my.id/ai/gemini/nano-banana?prompt=${encodeURIComponent(
            text
        )}&imageUrl=${encodeURIComponent(out)}`;
        const res = await fetch(apiUrl);
        const json = await res.json();

        if (!json || !json.result) {
            throw new Error(json?.message || "API tidak mengembalikan hasil gambar.");
        }

        const imgRes = await fetch(json.result);
        const resultBuffer = await imgRes.buffer();

        await conn.sendMessage(
            m.chat,
            { image: resultBuffer, caption: `✨ *AI Image Result*\nPrompt: ${text}` },
            { quoted: m }
        );

        await conn.sendMessage(m.chat, { delete: loadingMsg.key });
    } catch (e) {
        console.error("Error:", e);
        m.reply(`❌ *Failed to generate image!*\n\n*Error:* ${e.message}`);
    }
};

handler.help = ["img2img"];
handler.tags = ["ai", "maker"];
handler.command = /^(img2img|aiimage|aigenerate)$/i;
handler.limit = true;

export default handler;