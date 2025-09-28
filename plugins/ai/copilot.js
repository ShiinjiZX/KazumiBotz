let handler=async(m,{args})=>{
  try{
    if(!args[0])return m.reply('Mw Tanya Apa')
    m.reply((await (await fetch(`https://api.nekolabs.my.id/ai/copilot?text=${encodeURIComponent(args.join(' '))}`)).json()).result.text)
  }catch(e){m.reply(e.message)}
}

handler.help=['copilot']
handler.command=['copilot']
handler.tags=['ai']

export default handler