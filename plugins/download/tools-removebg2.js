/*
Jangan Hapus Wm Bang 

*Remove Background,Remove Background HD Plugins Esm*

Ntah lah 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/189
*/

import axios from 'axios';
import FormData from 'form-data';

const clyrBg = {
  api: {
    base: "https://s5ash41h3g.execute-api.ap-south-1.amazonaws.com/default/api/v1/rmbg",
    endpoints: { predict: "/predict" }
  },

  headers: {
    'authority': 's5ash41h3g.execute-api.ap-south-1.amazonaws.com',
    'origin': 'https://clyrbg.com',
    'referer': 'https://clyrbg.com/',
    'user-agent': 'Postify/1.0.0'
  },

  getFileExt: (url) => {
    const extension = url.split('.').pop().toLowerCase();
    if (extension === 'webp') return 'webp';
    if (extension === 'jpg' || extension === 'jpeg') return 'jpeg';
    if (extension === 'png') return 'png';
    return 'png';
  },

  remove: async (img, isHD = false) => {
    try {
      const ex = clyrBg.getFileExt(img);      
      const response = await axios.get(img, { responseType: 'arraybuffer' });
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        return {
          status: false,
          code: 400,
          result: { error: "Kagak bisa ngambil link hasil remove bgnya bree 🙃" }
        };
      }

      const b = Buffer.from(response.data, 'binary').toString('base64');
      const data = { file_extension: ex, image_bytes: b, hd: isHD };

      const result = await axios.post(
        `${clyrBg.api.base}${clyrBg.api.endpoints.predict}`,
        data,
        { headers: clyrBg.headers }
      );

      return {
        status: true,
        code: 200,
        result: {
          id: result.data.id,
          url: result.data.url,
          extension: ex,
          hd: isHD
        }
      };
    } catch (error) {
      return {
        status: false,
        code: error.response?.status || 500,
        result: {
          error: error.response?.data?.message || error.message
        }
      };
    }
  }
};

async function Uguu(buffer, filename) {
  try {
    const form = new FormData();
    form.append('files[]', buffer, { filename });

    const { data } = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders(),
    });

    if (data.files && data.files[0]) {
      return {
        name: data.files[0].name,
        url: data.files[0].url,
        size: data.files[0].size,
      };
    } else {
      throw new Error('Upload gagal.');
    }
  } catch (err) {
    throw `${err.message}`;
  }
}

let handler = async (m, { conn, command }) => {
  try {
    let q = m.quoted ? m.quoted : m;
    let mime = (q.msg || q).mimetype || '';
    if (!mime || !mime.startsWith('image/')) 
      throw '*Kirim Gambar Atau Kirim Url Gambar Yang Valid Yaa*';

    let media = await q.download();
    let ext = mime.split('/')[1];
    let filename = `upload.${ext}`;

    let uploaded = await Uguu(media, filename);
    let isHD = /hd/i.test(command);
    let removed = await clyrBg.remove(uploaded.url, isHD);

    if (!removed.status) throw removed.result.error;

    let { url, extension, hd, id } = removed.result;
    let resultBuffer = await axios.get(url, { responseType: 'arraybuffer' });

    let caption = `*Background Removed Successfully*\n\n• *Quality Image :* ${hd ? 'HD' : 'Standard'}\n• *Format :* ${extension.toUpperCase()}\n• *ID :* ${id}`;

    await conn.sendMessage(m.chat, {
      image: Buffer.from(resultBuffer.data, 'binary'),
      caption,
      mimetype: `image/${extension}`,
      fileName: `removed-bg.${extension}`
    }, { quoted: m });

  } catch (error) {
    await conn.sendMessage(m.chat, { text: `${error}` }, { quoted: m });
  }
};

handler.help = ['removebg2', 'removebghd'];
handler.command = ['removebg2', 'removebghd'];
handler.tags = ['tools'];

export default handler;