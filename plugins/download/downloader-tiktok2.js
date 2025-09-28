import fetch from 'node-fetch';

let handler = async (m, { text, conn, command }) => {
  if (!text) throw `Link TikTok-nya mana bang?\n\nContoh: .${command} https://vt.tiktok.com/ZSkpqLD9U/`

  let res = await fetch(`https://www.sankavolereii.my.id/download/tiktok-v2?apikey=planaai&url=${encodeURIComponent(text)}`);
  if (!res.ok) throw 'Gagal ambil data dari API.'

  let json = await res.json();
  if (!json.status) throw 'Video tidak ditemukan atau link error.'

  let video = json.result.video_nowm;
  let audio = json.result.audio_url;
  let desc = json.result.description || 'Berhasil download video TikTok.';

  await conn.sendFile(m.chat, video, 'tiktok.mp4', `🎬 ${desc}`, m);

  await conn.sendFile(m.chat, audio, 'audio.mp3', '🎵 Audio TikTok-nya', m, false, { mimetype: 'audio/mp4' });
}

handler.help = ['tiktok2 <url>']
handler.tags = ['downloader']
handler.command = /(tiktok2|tt2)$/i
handler.limit = true

export default handler