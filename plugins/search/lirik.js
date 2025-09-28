
/*
- Name : Search Lirik
- Deks : Kalau Error' Jadi Gaada
- Follow Bang : https://whatsapp.com/channel/0029Vb6D8o67YSd1UzflqU1d
- Source Scrape : https://whatsapp.com/channel/0029VagslooA89MdSX0d1X1z/487
*/
import axios from 'axios'
import cheerio from 'cheerio'

async function LirikByPonta(query) {
  let url = 'https://lirik-lagu.net/search/' + encodeURIComponent(query.trim().replace(/\s+/g, '+')) + '.html'
  let { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  let $ = cheerio.load(data)
  let first = $('.card-body.list_main .title-list a').first()
  if (!first.length) return null
  let title = first.text().trim()
  let link = 'https://lirik-lagu.net' + first.attr('href')
  let { data: detail } = await axios.get(link, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  let $$ = cheerio.load(detail)
  let lirik = $$('.post-read.lirik_lagu, #lirik_lagu').first()
  lirik.find('script,style,div[align="center"],ins,.mt-3.pt-3,.artis,.tags,.adsbygoogle').remove()
  let html = lirik.html()
  if (!html) return null
  let text = cheerio.load(html.replace(/<br\s*\/?>/gi, '\n')).text()
  let lines = text.split('\n').map(v => v.trim()).filter(v => v)
  let result = []
  for (let i = 0; i < lines.length; i++) {
    if (/^(.*|.*)$/.test(lines[i]) && i > 0) result.push('')
    result.push(lines[i])
  }
  return { title, link, lirik: result.join('\n') }
}

let handler = async (m, { args }) => {
  try {
    let q = args.join(' ')
    if (!q) return m.reply('Mamw Cari Lirik Lagu Apa')
    let res = await LirikByPonta(q)
    
    await m.reply(`${res.lirik}`)
  } catch (e) {
    m.reply(e.message)
  }
}

handler.help = ['lirik']
handler.command = ['lirik']
handler.tags = ['search']

export default handler