/* TOURL BUTTON
Fitur : TOURL Support image, video, file lainnya
Base : https://cdn.yupra.my.id/
Deskripsi : No expire atau tanpa masa aktif 
Group Fitur : https://chat.whatsapp.com/DUWddjCXWv4CCoeS8uP2lP
Channel Fitur : https://whatsapp.com/channel/0029VbA8pjlIN9isK6uO650c
*/
import axios from 'axios';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
import { generateWAMessageFromContent, proto } from '@adiwajshing/baileys';

const uploadFile = async (buffer, filename) => {
  const form = new FormData();
  form.append('files', buffer, { filename });

  const response = await axios.post('https://cdn.yupra.my.id/upload', form, {
    headers: {
      ...form.getHeaders(),
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36'
    },
    timeout: 120000
  });

  return response.data;
};

const handler = async (m, { conn, usedPrefix, command }) => {
  try {
    const quoted = m.quoted ? m.quoted : m;
    const mime = (quoted?.msg || quoted)?.mimetype || '';

    if (!quoted || !mime || mime.includes('text/plain') || !quoted.download) {
      return conn.sendMessage(m.chat, {
        text: `❌ Reply to a file with *${usedPrefix + command}*\n\n✅ Supported: Images, Videos, Audio, Documents (not plain text)`
      }, { quoted: m });
    }

    await conn.sendMessage(m.chat, {
      react: { text: '⏳', key: m.key }
    });

    const media = await quoted.download();
    
    if (!media || media.length === 0) {
      throw new Error('Failed to download file');
    }

    if (media.length > 30 * 1024 * 1024) {
      throw new Error('File too large (max 30MB)');
    }

    const type = await fileTypeFromBuffer(media).catch(() => null);
    let ext = type?.ext;
    
    if (!ext && mime) {
      const mimeMap = {
        'application/javascript': 'js',
        'text/javascript': 'js',
        'application/json': 'json',
        'text/html': 'html',
        'text/css': 'css',
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'video/mp4': 'mp4',
        'audio/mpeg': 'mp3'
      };
      ext = mimeMap[mime];
    }
    
    if (!ext && mime) {
      const fallback = mime.split('/')[1];
      if (fallback && fallback.length <= 4 && !fallback.includes('-')) {
        ext = fallback;
      }
    }

    const filename = `file_${Date.now()}${ext ? '.' + ext : ''}`;

    const result = await uploadFile(media, filename);

    if (result.success && result.files?.[0]) {
      const file = result.files[0];
      const fileUrl = `https://cdn.yupra.my.id${file.url}`;

      const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2
            },
            interactiveMessage: proto.Message.InteractiveMessage.create({
              body: proto.Message.InteractiveMessage.Body.create({
                text: `Upload Success!\nKlik tombol dibawah ini untuk copy`
              }),
              footer: proto.Message.InteractiveMessage.Footer.create({
                text: "YP"
              }),
              nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                buttons: [
                  {
                    name: "cta_copy",
                    buttonParamsJson: `{"display_text":"Copy URL","id":"copy_url","copy_code":"${fileUrl}"}`
                  }
                ]
              })
            })
          }
        }
      }, {});

      await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } else {
      throw new Error('Upload failed');
    }

  } catch (error) {
    await conn.sendMessage(m.chat, {
      react: { text: '❌', key: m.key }
    });

    let msg = 'Upload failed';
    if (error.message.includes('download')) msg = 'Cannot download file';
    else if (error.message.includes('large')) msg = 'File too large (max 100MB)';
    else if (error.response?.status === 413) msg = 'File too large';
    else if (error.response?.status === 500) msg = 'Server error, try again';

    await conn.sendMessage(m.chat, {
      text: `❌ ${msg}`
    }, { quoted: m });
  }
};

handler.help = ['tourl'];
handler.tags = ['tools'];
handler.command = /^(tourl)$/i;

export default handler;