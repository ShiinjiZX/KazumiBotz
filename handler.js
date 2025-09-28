import { smsg } from './lib/simple.js'
import './lib/throw-helpers.js'
import { processWarning } from './plugins/group/warnsystem.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile, readFileSync, readdirSync, statSync } from 'fs'
import chalk from 'chalk'
import knights from 'knights-canvas'
import fetch from 'node-fetch'

/**
 * @type {import('@adiwajshing/baileys')}
 */
const { proto } = (await import('@adiwajshing/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

/**
 * Handle messages upsert
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate 
 */
export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate)
        return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m)
        return
    if (global.db.data == null)
        await global.loadDatabase()
    
    try {
        m = smsg(this, m) || m
        if (!m)
            return
        m.exp = 0
        m.limit = false
        
        // auto typing 
        if (global.autotyping && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('composing', m.chat).catch(console.error)
        }
        if (global.autorecording && typeof this.sendPresenceUpdate === 'function') {
            this.sendPresenceUpdate('recording', m.chat).catch(console.error)
        }
        
        try {
            // TODO: use loop to insert data instead of this
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object')
                global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp))
                    user.exp = 0
                if (!isNumber(user.limit))
                    user.limit = 10
                if (!isNumber(user.afk))
                    user.afk = -1
                if (!('afkReason' in user))
                    user.afkReason = ''
                if (!('banned' in user))
                    user.banned = false
                if (!('banReason' in user))
                    user.banReason = ''
                if (!('role' in user))
                    user.role = 'Free user'
                if (!('autolevelup' in user))
                    user.autolevelup = true
            } else
                global.db.data.users[m.sender] = {
                    exp: 0,
                    limit: 10,
                    lastclaim: 0,
                    registered: false,
                    name: m.name,
                    age: -1,
                    regTime: -1,
                    afk: -1,
                    afkReason: '',
                    banned: false,
                    banReason: '',
                    warn: 0,
                    level: 0,
                    role: 'Free user',
                    autolevelup: true,
                }
            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object')
                global.db.data.chats[m.chat] = {}
            if (chat) {
                if (!('isBanned' in chat))
                    chat.isBanned = false
                if (!('welcome' in chat))
                    chat.welcome = false
                if (!('detect' in chat))
                    chat.detect = false
                if (!('sWelcome' in chat))
                    chat.sWelcome = ''
                if (!('sBye' in chat))
                    chat.sBye = ''
                if (!('sPromote' in chat))
                    chat.sPromote = ''
                if (!('sDemote' in chat))
                    chat.sDemote = ''
                if (!('delete' in chat))
                    chat.delete = false
                if (!('antiLink' in chat))
                    chat.antiLink = false
                if (!('viewonce' in chat))
                    chat.viewonce = false
                if (!('antiToxic' in chat))
                    chat.antiToxic = false
                if (!('simi' in chat))
                    chat.simi = false
                if (!('autogpt' in chat))
                    chat.autogpt = false
                if (!('autoSticker' in chat))
                    chat.autoSticker = false
                if (!('premium' in chat))
                    chat.premium = false
                if (!('premiumTime' in chat))
                    chat.premiumTime = false
                if (!('nsfw' in chat))
                    chat.nsfw = false
                if (!('menu' in chat))
                    chat.menu = false
                if (!isNumber(chat.expired))
                    chat.expired = 0
            } else
                global.db.data.chats[m.chat] = {
                    isBanned: false,
                    welcome: true,
                    detect: false,
                    sWelcome: '',
                    sBye: '',
                    sPromote: '',
                    sDemote: '',
                    delete: true,
                    antiLink: false,
                    viewonce: false,
                    simi: false,
                    autogpt: false,
                    expired: 0,
                    autoSticker: false,
                    premium: false,
                    premiumTime: false,
                    nsfw: false,
                    menu: true,
                }
            let settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('autoread' in settings)) settings.autoread = false
                if (!('restrict' in settings)) settings.restrict = false
                if (!('anticall' in settings)) settings.anticall = true
                if (!('restartDB' in settings)) settings.restartDB = 0
            } else global.db.data.settings[this.user.jid] = {
                self: false,
                autoread: false,
                anticall: true,
                restartDB: 0,
                restrict: false
            }
        } catch (e) {
            console.error(e)
        }
        
        if (opts['nyimak'])
            return
        if (opts['pconly'] && m.chat.endsWith('g.us'))
            return
        if (opts['gconly'] && !m.chat.endsWith('g.us'))
            return
        if (opts['swonly'] && m.chat !== 'status@broadcast')
            return
        if (typeof m.text !== 'string')
            m.text = ''
            
        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
        const isPrems = isROwner || db.data.users[m.sender].premiumTime > 0
        
        if (!isOwner && !m.fromMe && opts['self']) return;
        
        if (m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            let intervalID = setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(intervalID)
                await delay(time)
            }, time)
        }

        if (m.isBaileys)
            return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix
        let _user = global.db.data?.users?.[m.sender]

        const groupMetadata = m.isGroup ? await conn.groupMetadata(m.chat) : {}
        const participants = m.isGroup ? groupMetadata.participants : []
        const useLid = groupMetadata.addressingMode === 'lid'

        let user = {}
        let bot = {}

        if (m.isGroup) {
            if (useLid) {
                const senderLid = participants.find(p => p.jid === conn.decodeJid(m.sender))?.lid
                const botLid = participants.find(p => p.jid === conn.decodeJid(conn.user.id))?.lid

                user = participants.find(p => p.lid === senderLid) || {}
                bot = participants.find(p => p.lid === botLid) || {}
            } else {
                user = participants.find(u => conn.decodeJid(u.id || u.jid) === conn.decodeJid(m.sender)) || {}
                bot = participants.find(u => conn.decodeJid(u.id || u.jid) === conn.decodeJid(conn.user.id)) || {}
            }
        }

        const isRAdmin = user?.admin === 'superadmin'
        const isAdmin = isRAdmin || user?.admin === 'admin'
        const isBotAdmin = bot?.admin === 'admin' || bot?.admin === 'superadmin'

        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        // Fungsi utilitas untuk path handling
        function normalizePluginPath(pluginPath) {
            return pluginPath.replace(/\\/g, '/').toLowerCase()
        }

        // Fungsi untuk mendapatkan path relatif dari plugins folder
        function getRelativePath(fullPath, baseDir) {
            return path.relative(baseDir, fullPath).replace(/\\/g, '/')
        }

        // Fungsi untuk mendapatkan nama folder dari path
        function getFolderFromPath(pluginPath) {
            const relativePath = getRelativePath(pluginPath, ___dirname)
            const pathParts = relativePath.split('/')
            return pathParts.length > 1 ? pathParts[0] : ''
        }

        // Fungsi untuk check banned file dengan support subfolder
        function isPluginBanned(pluginName, chat, user) {
            const bannedFiles = [
                'owner-unbanchat.js', 'owner/owner-unbanchat.js', 
                'owner-exec.js', 'owner/owner-exec.js',
                'owner-exec2.js', 'owner/owner-exec2.js',
                'tool-delete.js', 'tools/tool-delete.js'
            ]
            
            const unbanUserFiles = [
                'owner-unbanuser.js', 'owner/owner-unbanuser.js'
            ]

            const normalizedName = normalizePluginPath(pluginName)
            
            // Check chat banned
            if (chat?.isBanned) {
                return !bannedFiles.some(file => normalizedName.includes(normalizePluginPath(file)))
            }
            
            // Check user banned
            if (user?.banned) {
                return !unbanUserFiles.some(file => normalizedName.includes(normalizePluginPath(file)))
            }
            
            return false
        }

        // Loop melalui semua plugin
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin)
                continue
            if (plugin.disabled)
                continue

            // Buat path lengkap untuk plugin dengan normalisasi
            const __filename = path.resolve(___dirname, name)
            
            // Tentukan direktori plugin (untuk subfolder support)
            const pluginDir = path.dirname(__filename)
            const pluginFolder = getFolderFromPath(__filename)
            const normalizedPluginName = normalizePluginPath(name)

            // Context object untuk plugin
            const pluginContext = {
                chatUpdate,
                __dirname: ___dirname,
                __filename,
                __pluginDir: pluginDir,
                __pluginFolder: pluginFolder,
                __pluginName: name,
                __normalizedName: normalizedPluginName
            }

            // Handle plugin.all dengan throw support
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, pluginContext)
                } catch (e) {
                    // Cek apakah error adalah string (thrown message)
                    if (typeof e === 'string') {
                        this.reply(m.chat, e, m)
                        continue // Lanjut ke plugin berikutnya
                    }
                    
                    // Log error asli
                    console.error(`Error in plugin.all [${name}]:`, e)
                    for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                        let data = (await conn.onWhatsApp(jid))[0] || {}
                        if (data.exists)
                            m.reply(`*🗂️ Plugin:* ${name}\n*📁 Folder:* ${pluginFolder || 'root'}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${m.text}\n*🔧 Function:* plugin.all\n\n\`\`\`${format(e)}\`\`\``.trim(), data.jid)
                    }
                }
            }

            if (!opts['restrict'])
                if (plugin.tags && plugin.tags.includes('admin')) {
                    continue
                }

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? 
                [[_prefix.exec(m.text), _prefix]] :
                Array.isArray(_prefix) ? 
                    _prefix.map(p => {
                        let re = p instanceof RegExp ? 
                            p :
                            new RegExp(str2Regex(p))
                        return [re.exec(m.text), re]
                    }) :
                    typeof _prefix === 'string' ? 
                        [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
                        [[[], new RegExp]]
            ).find(p => p[1])

            // Handle plugin.before dengan throw support
            if (typeof plugin.before === 'function') {
                try {
                    if (await plugin.before.call(this, m, {
                        match,
                        conn: this,
                        participants,
                        groupMetadata,
                        user,
                        bot,
                        isROwner,
                        isOwner,
                        isRAdmin,
                        isAdmin,
                        isBotAdmin,
                        isPrems,
                        ...pluginContext
                    }))
                        continue
                } catch (e) {
                    // Cek apakah error adalah string (thrown message)
                    if (typeof e === 'string') {
                        this.reply(m.chat, e, m)
                        continue
                    }
                    
                    // Log error asli
                    console.error(`Error in plugin.before [${name}]:`, e)
                    for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                        let data = (await conn.onWhatsApp(jid))[0] || {}
                        if (data.exists)
                            m.reply(`*🗂️ Plugin:* ${name}\n*📁 Folder:* ${pluginFolder || 'root'}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${m.text}\n*🔧 Function:* plugin.before\n\n\`\`\`${format(e)}\`\`\``.trim(), data.jid)
                    }
                }
            }

            if (typeof plugin !== 'function')
                continue

            if ((usedPrefix = (match[0] || '')[0])) {
                let noPrefix = m.text.replace(usedPrefix, '')
                let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
                args = args || []
                let _args = noPrefix.trim().split` `.slice(1)
                let text = _args.join` `
                command = (command || '').toLowerCase()
                let fail = plugin.fail || global.dfail

                let isAccept = plugin.command instanceof RegExp ? 
                    plugin.command.test(command) :
                    Array.isArray(plugin.command) ? 
                        plugin.command.some(cmd => cmd instanceof RegExp ? 
                            cmd.test(command) :
                            cmd === command
                        ) :
                        typeof plugin.command === 'string' ? 
                            plugin.command === command :
                            false

                if (!isAccept)
                    continue

                m.plugin = name
                m.pluginFolder = pluginFolder
                m.pluginDir = pluginDir

                // Check banned dengan support subfolder yang lebih robust
                if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
                    let chat = global.db.data.chats[m.chat]
                    let user = global.db.data.users[m.sender]
                    
                    if (isPluginBanned(name, chat, user)) {
                        continue
                    }
                }

                // Permission checks
                if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.rowner && !isROwner) {
                    fail('rowner', m, this)
                    continue
                }
                if (plugin.owner && !isOwner) {
                    fail('owner', m, this)
                    continue
                }
                if (plugin.mods && !isMods) {
                    fail('mods', m, this)
                    continue
                }
                if (plugin.premium && !isPrems) {
                    fail('premium', m, this)
                    continue
                }
                if (plugin.group && !m.isGroup) {
                    fail('group', m, this)
                    continue
                } else if (plugin.botAdmin && !isBotAdmin) {
                    fail('botAdmin', m, this)
                    continue
                } else if (plugin.admin && !isAdmin) {
                    fail('admin', m, this)
                    continue
                }
                if (plugin.private && m.isGroup) {
                    fail('private', m, this)
                    continue
                }
                if (plugin.register == true && _user.registered == false) {
                    fail('unreg', m, this)
                    continue
                }

                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200)
                    console.log("ngecit -_-")
                else
                    m.exp += xp

                if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
                    this.reply(m.chat, `[❗] Limit harian kamu telah habis, silahkan beli Premium melalui *${usedPrefix}premium*`, m)
                    continue
                }

                if (plugin.level > _user.level) {
                    this.reply(m.chat, `[💬] Diperlukan level ${plugin.level} untuk menggunakan perintah ini\n*Level mu:* ${_user.level} 📊`, m)
                    continue
                }

                let extra = {
                    match,
                    usedPrefix,
                    noPrefix,
                    _args,
                    args,
                    command,
                    text,
                    conn: this,
                    participants,
                    groupMetadata,
                    user,
                    bot,
                    isROwner,
                    isOwner,
                    isRAdmin,
                    isAdmin,
                    isBotAdmin,
                    isPrems,
                    ...pluginContext
                }

                // Main plugin execution dengan throw support
                try {
                    await plugin.call(this, m, extra)
                    if (!isPrems)
                        m.limit = m.limit || plugin.limit || false
                } catch (e) {
                    // Cek apakah error adalah string (thrown message)
                    if (typeof e === 'string') {
                        // Kirim thrown message sebagai reply
                        this.reply(m.chat, e, m)
                    } else {
                        // Error occured (untuk error asli)
                        m.error = e
                        console.error(`Error in plugin [${name}]:`, e)
                        
                        if (e) {
                            let text = format(e)
                            // Hide API keys
                            for (let key of Object.values(global.APIKeys || {}))
                                text = text.replace(new RegExp(key, 'g'), '#HIDDEN#')
                                
                            if (e.name) {
                                for (let [jid] of global.owner.filter(([number, _, isDeveloper]) => isDeveloper && number)) {
                                    let data = (await conn.onWhatsApp(jid))[0] || {}
                                    if (data.exists)
                                        m.reply(`*🗂️ Plugin:* ${m.plugin}\n*📁 Folder:* ${pluginFolder || 'root'}\n*👤 Sender:* ${m.sender}\n*💬 Chat:* ${m.chat}\n*💻 Command:* ${usedPrefix}${command} ${args.join(' ')}\n*🔧 Function:* main\n📄 *Error Logs:*\n\n\`\`\`${text}\`\`\``.trim(), data.jid)
                                }
                            }
                            
                            // Jangan kirim error message ke user jika bukan owner/developer
                            if (isOwner || isMods) {
                                m.reply(text)
                            } else {
                                // Kirim pesan error yang user-friendly
                                m.reply('❌ Terjadi kesalahan saat menjalankan command ini.')
                            }
                        }
                    }
                } finally {
                    // Handle plugin.after dengan throw support
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(this, m, extra)
                            
                           // ========== WARNING SYSTEM PROCESSING ==========
        // Process warning system untuk semua pesan
        if (m.isGroup || (!m.isGroup && !m.isCommand)) {
            try {
                // Skip jika pesan dari bot sendiri
                if (!m.key.fromMe) {
                    const wasWarned = await processWarning(m, this)
                    if (wasWarned) {
                        // Jika user dapat warning/dikick, skip processing lainnya
                        continue
                    }
                }
            } catch (warningError) {
                console.error('Warning System Error:', warningError)
                // Silent fail - tidak mengganggu flow normal
            }
        }
        // ========== SPAM PROTECTION FOR COMMANDS ==========
        // Check spam untuk semua command
        if (m.isCommand && command) {
            try {
                // Import spam check function
                if (typeof global.checkSpamCommand === 'function') {
                    const isSpam = global.checkSpamCommand(m.sender, command)
                    
                    if (isSpam) {
                        // Private chat spam protection
                        if (!m.isGroup) {
                            const { addWarn } = await import('./plugins/warn-system.js')
                            const warnData = addWarn(m.sender, '', 'Spam command', false)
                            
                            this.reply(m.chat, `⚠️ Warning ${warnData.count}/5
Jangan spam command! Tunggu minimal 3 detik.`, m)
                            
                            if (warnData.count >= 5) {
                                await this.updateBlockStatus(m.sender, 'block')
                                console.log(`User ${m.sender} diblokir karena spam`)
                                return
                            }
                        } else {
                            // Group spam - just send warning
                            this.reply(m.chat, '⏳ Tunggu minimal 3 detik sebelum menggunakan command lagi!', m)
                        }
                        continue // Skip command processing
                    }
                }
            } catch (spamError) {
                console.error('Spam Protection Error:', spamError)
            }
        }
        // ========== END WARNING SYSTEM PROCESSING ==========                           
                        } catch (e) {
                            // Cek apakah error adalah string (thrown message)
                            if (typeof e === 'string') {
                                this.reply(m.chat, e, m)
                            } else {
                                console.error(`Error in plugin.after [${name}]:`, e)
                            }
                        }
                    }
                    if (m.limit)
                        m.reply(+m.limit + ' Limit kamu terpakai')
                }
                break
            }
        }
        
if (global.caseHandler && !m.isCommand) {
    try {
        const extra = {
            usedPrefix: conn.prefix ? conn.prefix : global.prefix,
            command: m.text?.replace(/^[°zZ#@*+,.?=''():√%!¢£¥€π¤ΠΦ_&><`™©®Δ^βα~¦|/\\©^]/, '').trim().split(' ')[0]?.toLowerCase() || '',
            args: m.text?.trim().split(/ +/).slice(1) || [],
            text: m.text?.trim().split(/ +/).slice(1).join(' ') || '',
            conn: this,
            participants,
            groupMetadata,
            user,
            bot,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            isMods
        }
        
        await global.caseHandler(this, m, extra)
    } catch (e) {
        if (typeof e === 'string') {
            this.reply(m.chat, e, m)
        } else {
            console.error('Case Handler Error:', e)
        }
    }
}
        
    } catch (e) {
        console.error('Handler Error:', e)
    } finally {
        if (m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1)
                this.msgqueque.splice(quequeIndex, 1)
        }
        
        let user, stats = global.db.data.stats
        if (m) {
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.limit -= m.limit * 1
            }
            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total))
                        stat.total = 1
                    if (!isNumber(stat.success))
                        stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last))
                        stat.last = now
                    if (!isNumber(stat.lastSuccess))
                        stat.lastSuccess = m.error != null ? 0 : now
                } else
                    stat = stats[m.plugin] = {
                        total: 1,
                        success: m.error != null ? 0 : 1,
                        last: now,
                        lastSuccess: m.error != null ? 0 : now
                    }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }
        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        if (opts['autoread'])
            await conn.readMessages([m.key])
    }
}

/**
 * Handle groups participants update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate 
 */
export async function participantsUpdate({ id, participants, action }) {
    if (opts['self'])
        return
    if (this.isInit)
        return
    if (global.db.data == null)
        await loadDatabase()
    let chat = global.db.data.chats[id] || {}
    let text = ''
    switch (action) {
        case 'add':
        case 'remove':
            if (chat.welcome) {
                let groupMetadata = await this.groupMetadata(id) || (conn.chats[id] || {}).metadata
                for (let user of participants) {
                    let nickgc = await conn.getName(id)
                    let pp = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
                    let ppgc = 'https://telegra.ph/file/24fa902ead26340f3df2c.png'
                    let userName = user.split('@')[0]
                    try {
                        pp = await this.profilePictureUrl(user, 'image')
                        ppgc = await this.profilePictureUrl(id, 'image')
                        const userData = global.db.data.users[user.split('@')[0]]
                        if (userData && userData.name) {
                            userName = userData.name
                        }
                    } catch (e) {
                    } finally {
                        text = (action === 'add' ?
                            (chat.sWelcome || this.welcome || conn.welcome || 'Welcome, @user!').replace('@subject', await this.getName(id)).replace('@desc', groupMetadata.desc?.toString() || 'unknown') :
                            (chat.sBye || this.bye || conn.bye || 'Bye, @user!')).replace('@user', `@` + user.split('@')[0])
                        let wel = await new knights.Welcome2()
                            .setAvatar(pp)
                            .setUsername(this.getName(user))
                            .setBg("https://telegra.ph/file/666ccbfc3201704454ba5.jpg")
                            .setGroupname(groupMetadata.subject)
                            .setMember(groupMetadata.participants.length)
                            .toAttachment()

                        let lea = await new knights.Goodbye()
                            .setUsername(this.getName(user))
                            .setGuildName(groupMetadata.subject)
                            .setGuildIcon(ppgc)
                            .setMemberCount(groupMetadata.participants.length)
                            .setAvatar(pp)
                            .setBackground("https://telegra.ph/file/0db212539fe8a014017e3.jpg")
                            .toAttachment()

                        this.sendFile(id, action === 'add' ? wel.toBuffer() : lea.toBuffer(), 'pp.jpg', text, null, false, { contextInfo: { mentionedJid: [user] } })
                    }
                }
            }
            break
        case 'promote':
            text = (chat.sPromote || this.spromote || conn.spromote || '@user ```is now Admin```')
        case 'demote':
            if (!text)
                text = (chat.sDemote || this.sdemote || conn.sdemote || '@user ```is no longer Admin```')
            text = text.replace('@user', '@' + participants[0].split('@')[0])
            if (chat.detect)
                this.sendMessage(id, { text, mentions: this.parseMention(text) })
            break
    }
}

/**
 * Handler groups update
 * @param {import('@adiwajshing/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate 
 */
export async function groupsUpdate(groupsUpdate) {
    if (opts['self'])
        return
    for (const groupUpdate of groupsUpdate) {
        const id = groupUpdate.id
        if (!id) continue
        let chats = global.db.data.chats[id], text = ''
        if (!chats?.detect) continue
        if (groupUpdate.desc) text = (chats.sDesc || this.sDesc || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc)
        if (groupUpdate.subject) text = (chats.sSubject || this.sSubject || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject)
        if (groupUpdate.icon) text = (chats.sIcon || this.sIcon || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon)
        if (groupUpdate.revoke) text = (chats.sRevoke || this.sRevoke || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke)
        if (groupUpdate.announce == true) text = (chats.sAnnounceOn || this.sAnnounceOn || conn.sAnnounceOn || '*Group has been closed!*')
        if (groupUpdate.announce == false) text = (chats.sAnnounceOff || this.sAnnounceOff || conn.sAnnounceOff || '*Group has been open!*')
        if (groupUpdate.restrict == true) text = (chats.sRestrictOn || this.sRestrictOn || conn.sRestrictOn || '*Group has been all participants!*')
        if (groupUpdate.restrict == false) text = (chats.sRestrictOff || this.sRestrictOff || conn.sRestrictOff || '*Group has been only admin!*')
        if (!text) continue
        this.reply(id, text.trim(), m)
    }
}

export async function deleteUpdate(message) {
    try {
        const { fromMe, id, participant } = message
        if (fromMe)
            return
        let msg = this.serializeM(this.loadMessage(id))
        if (!msg)
            return
        let chat = global.db.data.chats[msg.chat] || {}
        if (chat.delete)
            return
        this.reply(msg.chat, `
Terdeteksi @${participant.split`@`[0]} telah menghapus pesan. 
Untuk mematikan fitur ini, ketik
*.enable delete*

Untuk menghapus pesan yang dikirim oleh Bot, reply pesan dengan perintah
*.delete*`, msg)
        this.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
    } catch (e) {
        console.error(e)
    }
}

global.dfail = (type, m, conn) => {
    let msg = {
        rowner: '*ONLY DEVELOPER* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴅᴇᴠᴇʟᴏᴘᴇʀ ʙᴏᴛ',
        owner: '*ONLY OWNER* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴏᴡɴᴇʀ ʙᴏᴛ',
        mods: '*ONLY MODERATOR* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴍᴏᴅᴇʀᴀᴛᴏʀ ʙᴏᴛ',
        premium: '*ONLY PREMIUM* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ᴜɴᴛᴜᴋ ᴜsᴇʀ ᴘʀᴇᴍɪᴜᴍ',
        group: '*GROUP CHAT* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴅɪ ᴅᴀʟᴀᴍ ɢʀᴏᴜᴘ',
        private: '*PRIVATE CHAT* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ᴋʜᴜsᴜs ᴘʀɪᴠᴀᴛ ᴄʜᴀᴛ',
        admin: '*ONLY ADMIN* • ᴋʜᴜsᴜs ᴀᴅᴍɪɴ ɢʀᴏᴜᴘ',
        botAdmin: '*ONLY BOT ADMIN* • ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ ʜᴀɴʏᴀ ʙɪsᴀ ᴋᴇᴛɪᴋᴀ ʙᴏᴛ ᴍᴇɴᴊᴀᴅɪ ᴀᴅᴍɪɴ',
        unreg: '*YOU ARE NOT REGISTERED YET* • ᴋᴇᴛɪᴋ *.ᴅᴀғᴛᴀʀ* ᴜɴᴛᴜᴋ ᴍᴇɴɢɢᴜɴᴀᴋᴀɴ ᴄᴏᴍᴍᴀɴᴅ ɪɴɪ', 
        restrict: '*RESTRICT* • ʀᴇsᴛʀɪᴄᴛ ʙᴇʟᴏᴍ ᴅɪɴʏᴀʟᴀᴋᴀɴ',
        disable: '*DISABLED* • ᴄᴍᴅ ɪɴɪ ᴛᴇʟᴀʜ ᴅɪ ᴍᴀᴛɪᴋᴀɴ ᴏʟᴇʜ ᴏᴡɴᴇʀ', 
    }[type]
    if (msg) return conn.reply(m.chat, msg, m)
}

let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
    unwatchFile(file)
    console.log(chalk.redBright("Update 'handler.js'"))
    if (global.reloadHandler) console.log(await global.reloadHandler())
})