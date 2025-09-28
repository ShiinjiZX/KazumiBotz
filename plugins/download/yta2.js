import axios from "axios";

const formatAudio = ['mp3'];

const ddownr = {
  download: async (url, format) => {
    if (!formatAudio.includes(format)) {
      throw new Error('Format audio tidak didukung.');
    }

    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/download.php?format=${format}&url=${encodeURIComponent(url)}&api=dfcb6d76f2f6a9894gjkege8a4ab232222`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    try {
      const { data } = await axios.request(config);
      if (data && data.success) {
        const { id, title, info } = data;
        const downloadUrl = await ddownr.cekProgress(id);
        return {
          id,
          title,
          image: info.image,
          downloadUrl
        };
      } else {
        throw new Error('Gagal mengambil detail video.');
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  cekProgress: async (id) => {
    const config = {
      method: 'GET',
      url: `https://p.oceansaver.in/ajax/progress.php?id=${id}`,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    };

    try {
      let attempt = 0;
      const maxAttempt = 20;

      while (attempt < maxAttempt) {
        const { data } = await axios.request(config);
        if (data && data.success && data.progress === 1000) {
          return data.download_url;
        }
        attempt++;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      throw new Error('Timeout saat menunggu progres download.');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};

const isYTUrl = (url) => {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(url);
};

const handler = async (m, { conn, usedPrefix, text, command }) => {
  if (!text) return m.reply(`Kirim link YouTube-nya bang!\nContoh: ${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`);
  if (!isYTUrl(text)) return m.reply('Link YouTube tidak valid.');

  m.react('🎶');

  try {
    const result = await ddownr.download(text, "mp3");
    if (!result.downloadUrl) return m.reply('Gagal mengunduh audio.');

    const caption = `*YT Audio Download*\n\n❏ Title : ${result.title}\n❏ Format : mp3\n\n✅ Download berhasil!`;

    await conn.sendMessage(m.chat, {
      text: caption,
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        externalAdReply: {
          title: result.title,
          body: 'ytmp3 by Hilman',
          mediaType: 1,
          previewType: 1,
          thumbnailUrl: result.image,
          renderLargerThumbnail: true,
          mediaUrl: text,
          sourceUrl: text
        }
      }
    }, { quoted: m });

    await conn.sendMessage(m.chat, {
      audio: { url: result.downloadUrl },
      mimetype: 'audio/mpeg'
    }, { quoted: m });

  } catch (error) {
    m.reply(`Terjadi kesalahan:\n${error.message}`);
  }
};

handler.help = ['ytmp3v4 <link youtube>'];
handler.tags = ['downloader'];
handler.command = ['ytmp3v4', 'ytav4'];
handler.limit = true;

export default handler;