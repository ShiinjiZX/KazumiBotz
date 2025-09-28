// • Feature : Ai generate song
// • Credits : https://whatsapp.com/channel/0029Vb4fjWE1yT25R7epR110
// • Scrapev : https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/452

import axios from 'axios';
import crypto from 'crypto';

const aiSong = {
  api: {
    base: 'https://api.chatgptweb.online/api',
    endpoints: {
      generate: '/music/generate',
      query: '/music/task/'
    }
  },
  headers: {
    'content-type': 'application/json',
    'user-agent': 'NB Android/1.0.0',
    connection: 'Keep-Alive',
    'accept-encoding': 'gzip'
  },
  appInfo: {
    packageName: 'com.kmatrix.ai.music.suno.generator.v2',
    versionCode: '7',
    versionName: '1.0.4'
  },
  md5: (str) => crypto.createHash('md5').update(str).digest('hex'),
  createSign: (str) => aiSong.md5(str).toLowerCase(),
  deviceId: () => {
    try {
      return crypto.createHash('sha1')
        .update([process.platform, process.arch, process.version, process.pid, Date.now()].join('|'))
        .digest('hex')
        .toUpperCase();
    } catch {
      return crypto.randomUUID().replace(/-/g, '').toUpperCase();
    }
  },
  _ct: (txt) =>
    String(txt ?? '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim(),
  _error: (code, msg) =>
    code === 401 ? 'Unauthorised.' :
    code === 403 ? 'Forbidden.' :
    code === 404 ? 'Task not found.' :
    code === 408 ? 'Request Timeout.' :
    code === 429 ? 'Too Many Requests.' :
    (code >= 500 && code < 600) ? 'Server error.' :
    (msg || 'Unknown error occurred'),
  generate: async ({ prompt, custom, instrumental, lyric, title }) => {
    const cp = [
      !custom && !prompt?.trim() && 'Prompt tidak boleh kosong.',
      !custom && prompt?.length > 200 && `Prompt terlalu panjang (maks 200).`,
      custom && !lyric?.trim() && 'Lirik tidak boleh kosong.',
      custom && lyric?.length > 3000 && `Lirik terlalu panjang (maks 3000).`
    ].find(Boolean);
    if (cp) return { success: false, code: 400, result: { error: cp } };

    try {
      const ts = Math.floor(Date.now() / 1e3);
      const ua = aiSong.headers['user-agent'];
      const sign = aiSong.createSign(`musicapp${ts}${ua}`);
      const deviceId = aiSong.deviceId();
      const headers = {
        ...aiSong.headers, ts: `${ts}`, appVersion: aiSong.appInfo.versionCode,
        pkgName: aiSong.appInfo.packageName, 'user-agent': ua, app: 'music', sign,
        paid: 'true', deviceid: deviceId, accept: 'application/json'
      };
      
      let payload = custom
        ? { action: 'generate', prompt: `Buat lagu berdasarkan lirik:\n\n${aiSong._ct(lyric)}`, custom, ...(typeof instrumental === 'boolean' && { instrumental }), ...(title && { title: aiSong._ct(title) }) }
        : { action: 'generate', prompt: aiSong._ct(prompt), custom, ...(typeof instrumental === 'boolean' && { instrumental }) };

      const { data } = await axios.post(`${aiSong.api.base}${aiSong.api.endpoints.generate}`, payload, { headers, timeout: 30000, validateStatus: () => true });
      return data.code === 200
        ? { success: true, code: 200, result: { taskId: data?.data?.taskId, interval: data?.data?.interval, generate_start: Date.now() } }
        : { success: false, code: data.code, result: { error: aiSong._error(data.code, data.message) } };
    } catch (err) {
      return { success: false, code: err?.response?.status || 500, result: { error: err?.message || String(err) } };
    }
  },
  taskId: async (taskId) => {
    try {
      const ts = Math.floor(Date.now() / 1e3);
      const ua = aiSong.headers['user-agent'];
      const sign = aiSong.createSign(`musicapp${ts}${ua}`);
      const deviceId = aiSong.deviceId();
      const headers = {
        ...aiSong.headers, ts: `${ts}`, appVersion: aiSong.appInfo.versionCode,
        pkgName: aiSong.appInfo.packageName, 'user-agent': ua, app: 'music', sign,
        paid: 'true', deviceid: deviceId, accept: 'application/json'
      };
      
      const { data } = await axios.get(`${aiSong.api.base}${aiSong.api.endpoints.query}${taskId}`, { headers, timeout: 30000, validateStatus: () => true });
      return data.code === 200
        ? { success: true, code: 200, result: { songs: Array.isArray(data.data) ? data.data : [] } }
        : { success: false, code: data.code, result: { error: aiSong._error(data.code, data.message) } };
    } catch (err) {
      return { success: false, code: err?.response?.status || 500, result: { error: err?.message || String(err) } };
    }
  },
  task: async (gen, { maxRetries = 40 } = {}) => { 
    const taskId = gen?.result?.taskId;
    const delay = (gen?.result?.interval || 0) * 1000;
    const startTime = gen?.result?.generate_start || Date.now();
    if (!taskId) return { success: false, code: 400, result: { error: 'Task ID tidak ditemukan.' } };
    if (delay > 0) await new Promise(r => setTimeout(r, delay));

    for (let i = 0; i < maxRetries; i++) {
      const status = await aiSong.taskId(taskId);
      const ready = status.success && (status.result?.songs?.length || 0) > 0 && status.result.songs.every(x => x.audio_url);
      if (ready) {
        return { success: true, code: 200, result: status.result };
      }
      await new Promise(r => setTimeout(r, 5000));
    }
    return { success: false, code: 408, result: { error: 'Gagal mendapatkan lagu, waktu tunggu habis.' } };
  }
};


let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `🎵 Buat lagu dari teks dengan AI.\n\n*Contoh:* ${usedPrefix + command} lagu pop tentang kucing oren bar-bar`

  try {
    await m.reply('⏳ Permintaan diterima! Sedang membuat lagu, proses ini bisa memakan waktu 1-2 menit...')

    const generateResult = await aiSong.generate({
      prompt: text,
      custom: false,
    });

    if (!generateResult.success) {
      throw new Error(generateResult.result.error || 'Gagal memulai pembuatan lagu.');
    }

    const taskResult = await aiSong.task(generateResult);

    if (!taskResult.success) {
      throw new Error(taskResult.result.error || 'Gagal mengambil hasil lagu.');
    }

    const songs = taskResult.result.songs;
    if (!songs || songs.length === 0) {
      throw new Error('Tidak ada lagu yang dihasilkan.');
    }

    await m.reply(`✅ Berhasil membuat *${songs.length}* versi lagu! Mengirim audio...`);

    for (const song of songs) {
      if (song.audio_url) {
        const caption = `*Judul:* ${song.title || 'Tidak ada judul'}\n*Genre:* ${song.style_of_music || 'Tidak diketahui'}\n\n*Lirik:*\n${song.lyric || 'Lirik tidak tersedia.'}`;
        
        await conn.sendMessage(m.chat, {
          audio: { url: song.audio_url },
          mimetype: 'audio/mpeg',
          fileName: `${song.title || 'aisong'}.mp3`
        }, { quoted: m });
        
        await conn.sendMessage(m.chat, { text: caption }, { quoted: m });
      }
    }

  } catch (e) {
    console.error('Error in AI Song handler:', e);
    m.reply(`🚨 Terjadi kesalahan: ${e.message || e}`);
  }
}

handler.help = ['aisong <prompt>']
handler.tags = ['ai']
handler.command = ['aisong', 'suno', 'musicai']
handler.limit = true

export default handler