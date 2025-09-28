// Plugin: TTS Tokoh Indonesia
import axios from 'axios'

async function ttstokoh(text, tokoh = 'jokowi') {
  try {
    const _tokoh = {
      jokowi: { speed: -30, model: 'id-ID-ArdiNeural-Male', tune: -3 },
      megawati: { speed: -20, model: 'id-ID-GadisNeural-Female', tune: -3 },
      prabowo: { speed: -30, model: 'id-ID-ArdiNeural-Male', tune: -3 },
    }

    if (!text) throw new Error('Text tidak boleh kosong')
    if (!Object.keys(_tokoh).includes(tokoh)) throw new Error(`Tokoh tidak dikenali. Pilih: ${Object.keys(_tokoh).join(', ')}`)

    const session_hash = Math.random().toString(36).substring(2)
    await axios.post('https://deddy-tts-rvc-tokoh-indonesia.hf.space/queue/join?', {
      data: [
        tokoh,
        _tokoh[tokoh].speed,
        text,
        _tokoh[tokoh].model,
        _tokoh[tokoh].tune,
        'rmvpe',
        0.5,
        0.33,
      ],
      event_data: null,
      fn_index: 0,
      trigger_id: 20,
      session_hash
    })

    const { data } = await axios.get(`https://deddy-tts-rvc-tokoh-indonesia.hf.space/queue/data?session_hash=${session_hash}`)

    let result
    const lines = data.split('\n\n')
    for (const line of lines) {
      if (line.startsWith('data:')) {
        const d = JSON.parse(line.substring(6))
        if (d.msg === 'process_completed') result = d.output.data[2].url
      }
    }

    return result
  } catch (e) {
    throw new Error('Gagal membuat TTS: ' + e.message)
  }
}

let handler = async (m, { conn, text }) => {
  if (!text) throw 'Contoh: .ttsv jokowi selamat pagi rakyat indonesia!'

  const [tokohRaw, ...isiPesan] = text.trim().split(' ')
  const tokoh = tokohRaw.toLowerCase()
  const pesan = isiPesan.join(' ')
  if (!pesan) throw 'Teksnya mana? Contoh: .ttsv prabowo kita harus lebih kuat!'

  let audioUrl
  try {
    audioUrl = await ttstokoh(pesan, tokoh)
  } catch (e) {
    throw e.message
  }

  if (!audioUrl) throw 'Gagal mengambil audio.'
  await conn.sendFile(m.chat, audioUrl, 'tts.mp3', null, m, true, { mimetype: 'audio/mpeg' })
}

handler.help = [
  '.ttsv jokowi',
  '.ttsv prabowo',
  '.ttsv megawati'
]

handler.help ['ttsv']
handler.tags = ['tools']
handler.command = /^tts$/i
handler.limit = true

export default handler