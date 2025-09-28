process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1';

import './config.js'

import path, { join } from 'path'
import { platform } from 'process'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') { return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString() }; global.__dirname = function dirname(pathURL) { return path.dirname(global.__filename(pathURL, true)) }; global.__require = function require(dir = import.meta.url) { return createRequire(dir) }
import {
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
  readFileSync,
  watch
} from 'fs'

import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'
const argv = yargs(hideBin(process.argv)).argv

import { spawn } from 'child_process'
import lodash from 'lodash'
import syntaxerror from 'syntax-error'
import chalk from 'chalk'
import { tmpdir } from 'os'
import readline from 'readline'
import { format } from 'util'
import pino from 'pino'
import ws from 'ws'
import { dirname, resolve } from 'path'
import { unwatchFile, watchFile } from 'fs'



const {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  makeCacheableSignalKeyStore,
  PHONENUMBER_MCC: MCC_BAILEYS
} = await import('@adiwajshing/baileys')

const PHONENUMBER_MCC = MCC_BAILEYS || {
  '62': 'ID', // Indonesia
  '1': 'US',  // USA
  '91': 'IN', // India
  // tambah kode negara lain sesuai kebutuhan
}
import { Low, JSONFile } from 'lowdb'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import cloudDBAdapter from './lib/cloudDBAdapter.js'
import {
  mongoDB,
  mongoDBV2
} from './lib/mongoDB.js'

const { CONNECTING } = ws
const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

protoType()
serialize()

global.API = (name, path = '/', query = {}, apikeyqueryname) => (name in global.APIs ? global.APIs[name] : name) + path + (query || apikeyqueryname ? '?' + new URLSearchParams(Object.entries({ ...query, ...(apikeyqueryname ? { [apikeyqueryname]: global.APIKeys[name in global.APIs ? global.APIs[name] : name] } : {}) })) : '')
// global.Fn = function functionCallBack(fn, ...args) { return fn.call(global.conn, ...args) }
global.timestamp = {
  start: new Date
}

const __dirname = global.__dirname(import.meta.url)

global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']')

global.db = new Low(
  /https?:\/\//.test(opts['db'] || '') ?
    new cloudDBAdapter(opts['db']) : /mongodb(\+srv)?:\/\//i.test(opts['db']) ?
      (opts['mongodbv2'] ? new mongoDBV2(opts['db']) : new mongoDB(opts['db'])) :
      new JSONFile(`${opts._[0] ? opts._[0] + '_' : ''}database.json`)
)
global.DATABASE = global.db // Backwards Compatibility
global.loadDatabase = async function loadDatabase() {
  if (db.READ) return new Promise((resolve) => setInterval(async function () {
    if (!db.READ) {
      clearInterval(this)
      resolve(db.data == null ? global.loadDatabase() : db.data)
    }
  }, 1 * 1000))
  if (db.data !== null) return
  db.READ = true
  await db.read().catch(console.error)
  db.READ = null
  db.data = {
    users: {},
    chats: {},
    stats: {},
    msgs: {},
    sticker: {},
    settings: {},
    ...(db.data || {})
  }
  global.db.chain = chain(db.data)
}
loadDatabase()
const usePairingCode = !process.argv.includes('--use-pairing-code')
const useMobile = process.argv.includes('--mobile')

let rl = null
const question = (text) => {
  return new Promise((resolve) => {
    if (!rl) {
      rl = readline.createInterface({ 
        input: process.stdin, 
        output: process.stdout 
      })
    }
    rl.question(text, (answer) => {
      resolve(answer)
    })
  })
}

const { version, isLatest } = await fetchLatestBaileysVersion()
const { state, saveCreds } = await useMultiFileAuthState('./sessions')
const connectionOptions = {
  version,
  logger: pino({ level: 'silent' }),
  printQRInTerminal: !usePairingCode,
  // Optional If Linked Device Could'nt Connected
  // browser: ['Mac OS', 'chrome', '125.0.6422.53']
  browser: ['Mac OS', 'safari', '5.1.10'],
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino().child({
      level: 'silent',
      stream: 'store'
    })),
  },
  getMessage: async key => {
    const messageData = await store.loadMessage(key.remoteJid, key.id);
    return messageData?.message || undefined;
  },
  generateHighQualityLinkPreview: true,
  patchMessageBeforeSending: (message) => {
    const requiresPatch = !!(
      message.buttonsMessage
      || message.templateMessage
      || message.listMessage
    );
    if (requiresPatch) {
      message = {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadataVersion: 2,
              deviceListMetadata: {},
            },
            ...message,
          },
        },
      };
    }

    return message;
  },
  connectTimeoutMs: 60000, defaultQueryTimeoutMs: 0, generateHighQualityLinkPreview: true, syncFullHistory: true, markOnlineOnConnect: true
}

global.conn = makeWASocket(connectionOptions)
conn.isInit = false

if (usePairingCode && !conn.authState.creds.registered) {
  if (useMobile) throw new Error('Cannot use pairing code with mobile api')

  // ambil nomor dari argv jika ada dan valid, kalau gak minta input
  let phoneNumber = (argv._[0] || '').trim().replace(/[^0-9]/g, '')

  // validasi MCC (kode negara)
  while (!Object.keys(PHONENUMBER_MCC).some(v => phoneNumber.startsWith(v))) {
    console.log(chalk.red('Masukan no contoh 62xxx'))
    phoneNumber = (await question('Masukkan nomor WhatsApp yang benar (awali dengan kode negara, contoh: 62812xxxxxx): ')).trim().replace(/[^0-9]/g, '')
  }

  rl.close()

  console.log(chalk.bgWhite(chalk.blue('Generating code...')))
  setTimeout(async () => {
    try {
      let code = await conn.requestPairingCode(phoneNumber)
      code = code?.match(/.{1,4}/g)?.join('-') || code
      console.log(
        chalk.black(chalk.bgGreen('Your Pairing Code:')),
        chalk.black(chalk.white(code))
      )
    } catch (e) {
      console.error(chalk.red('❌ Gagal generate pairing code:'), e)
      process.exit(1)
    }
  }, 3000)
} 
async function resetLimit() {
  try {
    let list = Object.entries(global.db.data.users);
    let lim = 25; // Nilai limit default yang ingin di-reset

    list.map(([user, data], i) => {
      // Hanya reset limit jika limit saat ini <= 25
      if (data.limit <= lim) {
        data.limit = lim;
      }
    });

    // logs bahwa reset limit telah sukses
    console.log(`Success Auto Reset Limit`)
  } finally {
    // Setel ulang fungsi reset setiap 24 jam (1 hari)
    setInterval(() => resetLimit(), 1 * 86400000);
  }
}

if (!opts['test']) {
  (await import('./server.js')).default(PORT)
  setInterval(async () => {
    if (global.db.data) await global.db.write().catch(console.error)
    // if (opts['autocleartmp']) try {
    clearTmp()
    //  } catch (e) { console.error(e) }
  }, 60 * 1000)
}

function clearTmp() {
  const tmp = [tmpdir(), join(__dirname, './tmp')]
  const filename = []
  tmp.forEach(dirname => readdirSync(dirname).forEach(file => filename.push(join(dirname, file))))
  return filename.map(file => {
    const stats = statSync(file)
    if (stats.isFile() && (Date.now() - stats.mtimeMs >= 1000 * 60 * 3)) return unlinkSync(file) // 3 minutes
    return false
  })
}

async function clearSessions(folder = './sessions') {
  try {
    const filenames = await readdirSync(folder);
    const deletedFiles = await Promise.all(filenames.map(async (file) => {
      try {
        const filePath = path.join(folder, file);
        const stats = await statSync(filePath);
        if (stats.isFile() && file !== 'creds.json') {
          await unlinkSync(filePath);
          console.log('Deleted session:'.main, filePath.info);
          return filePath;
        }
      } catch (err) {
        console.error(`Error processing ${file}: ${err.message}`);
      }
    }));
    return deletedFiles.filter((file) => file !== null);
  } catch (err) {
    console.error(`Error in Clear Sessions: ${err.message}`);
    return [];
  } finally {
    setTimeout(() => clearSessions(folder), 1 * 3600000); // 1 Hours
  }
}

async function connectionUpdate(update) {
  const { receivedPendingNotifications, connection, lastDisconnect, isOnline, isNewLogin } = update;

  if (isNewLogin) {
    conn.isInit = true;
  }

  if (connection == "close") {
  console.log(chalk.red("⏱️ Koneksi terputus & mencoba mengulang..."))
} else if (connection == "connecting") {
  console.log(chalk.yellow("⚡ Mengaktifkan Bot, Mohon tunggu sebentar..."))

  const channels = [
    "120363400306866480@newsletter",
    "1203633453@newsletter"
  ]

  channels.forEach(async (jid) => {
    try {
      await conn.newsletterFollow(jid)
      console.log(
        chalk.green.bold(`✅ Successfully followed Channel ${jid}`)
      )
    } catch (err) {
      console.error(
        chalk.red(`❌ Failed to follow Channel ${jid}:`), err
      )
    }
  })
} else if (connection == "open") {
  console.log(chalk.green("✅ Tersambung"))
}

if (isOnline == true) {
  console.log(chalk.green("Status Aktif"))
} else if (isOnline == false) {
  console.log(chalk.red("Status Mati"))
}

if (receivedPendingNotifications) {
  console.log(chalk.yellow("Menunggu Pesan Baru..."))
}

if (connection == "error") {
  console.log(
    chalk.red("❌ Koneksi error, ulang...")
  )
}

  global.timestamp.connect = new Date;

  if (lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut && conn.ws.readyState !== CONNECTING) {
    console.log(await global.reloadHandler(true));
  }

  if (global.db.data == null) {
    await global.loadDatabase();
  }
}

process.on('uncaughtException', console.error)
// let strQuot = /(["'])(?:(?=(\\?))\2.)*?\1/

let isInit = true
let handler = await import('./handler.js')

global.reloadHandler = async function (restatConn) {
  try {
    const Handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    if (Object.keys(Handler || {}).length) handler = Handler
  } catch (e) {
    console.error(e)
  }
  
  if (restatConn) {
    const oldChats = global.conn.chats
    try { global.conn.ws.close() } catch { }
    conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions, { chats: oldChats })
    isInit = true
  }
  
  if (!isInit) {
    conn.ev.off('messages.upsert', conn.handler)
    conn.ev.off('group-participants.update', conn.participantsUpdate)
    conn.ev.off('groups.update', conn.groupsUpdate)
    conn.ev.off('message.delete', conn.onDelete)
    conn.ev.off('connection.update', conn.connectionUpdate)
    conn.ev.off('creds.update', conn.credsUpdate)
  }

  conn.welcome = '❖━━━━━━[ Selamat Datang ]━━━━━━❖\n\n┏––––––━━━━━━━━•\n│☘︎ @subject\n┣━━━━━━━━┅┅┅\n│( 👋 Hallo @user)\n├[ Intro ]—\n│ NAMA: \n│ USIA: \n│ JENIS KELAMIN:\n┗––––––━━┅┅┅\n\n––––––┅┅ DESKRIPSI ┅┅––––––\n@desc'
  conn.bye = '❖━━━━━━[ Meninggalkan ]━━━━━━❖\n𝚂𝚊𝚢𝚘𝚗𝚊𝚛𝚊𝚊 @user 👋😃'
  conn.spromote = '@user Sekarang jadi admin!'
  conn.sdemote = '@user Sekarang bukan lagi admin!'
  conn.sDesc = 'Deskripsi telah diubah menjadi \n@desc'
  conn.sSubject = 'Judul grup telah diubah menjadi \n@subject'
  conn.sIcon = 'Icon grup telah diubah!'
  conn.sRevoke = 'Link group telah diubah ke \n@revoke'
  conn.sAnnounceOn = 'Group telah di tutup!\nsekarang hanya admin yang dapat mengirim pesan.'
  conn.sAnnounceOff = 'Group telah di buka!\nsekarang semua peserta dapat mengirim pesan.'
  conn.sRestrictOn = 'Edit Info Grup di ubah ke hanya admin!'
  conn.sRestrictOff = 'Edit Info Grup di ubah ke semua peserta!'

  conn.handler = handler.handler.bind(global.conn)
  conn.participantsUpdate = handler.participantsUpdate.bind(global.conn)
  conn.groupsUpdate = handler.groupsUpdate.bind(global.conn)
  conn.onDelete = handler.deleteUpdate.bind(global.conn)
  conn.connectionUpdate = connectionUpdate.bind(global.conn)
  conn.credsUpdate = saveCreds.bind(global.conn)

  conn.ev.on('call', async (call) => {
    console.log('Panggilan diterima:', call)
    
    // Import call protection
    try {
      await import('./plugins/group/warnsystem.js')
      
      // Call the global call protection function
      if (typeof global.callProtection === 'function') {
        await global.callProtection(call, conn)
      } else {
        // Fallback behavior
        if (call.status === 'ringing') {
          await conn.rejectCall(call.id)
          console.log('Panggilan ditolak (fallback)')
        }
      }
    } catch (error) {
      console.error('Call protection error:', error)
      // Fallback: just reject
      if (call.status === 'ringing') {
        await conn.rejectCall(call.id)
        console.log('Panggilan ditolak (error fallback)')
      }
    }
  })
  
  conn.ev.on('messages.upsert', conn.handler)
  conn.ev.on('group-participants.update', conn.participantsUpdate)
  conn.ev.on('groups.update', conn.groupsUpdate)
  conn.ev.on('message.delete', conn.onDelete)
  conn.ev.on('connection.update', conn.connectionUpdate)
  conn.ev.on('creds.update', conn.credsUpdate)
  isInit = false
  return true
}

// Dapatkan folder plugins
const pluginFolder = global.__dirname(join(__dirname, './plugins/index'))
const pluginFilter = filename => /\.js$/.test(filename)
global.plugins = {}

// Fungsi rekursif untuk membaca semua file JS di folder dan subfolder
function getAllJSFiles(dir, baseDir = dir, fileList = []) {
  try {
    const files = readdirSync(dir)
    
    files.forEach(file => {
      const fullPath = join(dir, file)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        // Rekursif ke dalam subfolder
        getAllJSFiles(fullPath, baseDir, fileList)
      } else if (stat.isFile() && pluginFilter(file)) {
        // Dapatkan path relatif dari base directory
        const relativePath = fullPath.replace(baseDir, '').replace(/^[\/\\]/, '')
        fileList.push({
          filename: relativePath.replace(/\\/g, '/'), // Normalize path separator
          fullPath: fullPath,
          relativePath: relativePath
        })
      }
    })
  } catch (error) {
    console.error(`Error reading directory ${dir}:`, error)
  }
  
  return fileList
}

// Fungsi inisialisasi file dengan support subfolder
async function filesInit() {
  console.log('Loading plugins...')
  const allFiles = getAllJSFiles(pluginFolder)
  
  console.log(`Found ${allFiles.length} plugin files:`)
  allFiles.forEach(({ filename }) => {
    console.log(`  - ${filename}`)
  })
  
  for (let { filename, fullPath } of allFiles) {
    try {
      // Gunakan path lengkap untuk import
      const fileURL = global.__filename(fullPath)
      const module = await import(`${fileURL}?update=${Date.now()}`)
      
      // Simpan dengan nama file relatif
      global.plugins[filename] = module.default || module
      
      console.log(`✅ Loaded: ${filename}`)
    } catch (e) {
      console.error(`❌ Error loading ${filename}:`, e.message)
      if (conn?.logger) {
        conn.logger.error(`Plugin load error [${filename}]: ${e.message}`)
      }
      delete global.plugins[filename]
    }
  }
  
  // Sortir plugins berdasarkan nama
  global.plugins = Object.fromEntries(
    Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
  )
  
  console.log(`\nSuccessfully loaded ${Object.keys(global.plugins).length} plugins`)
  return global.plugins
}

// Fungsi reload dengan support subfolder
global.reload = async (_ev, filename) => {
  // Dapatkan semua file yang ada sekarang
  const currentFiles = getAllJSFiles(pluginFolder)
  const currentFilenames = currentFiles.map(f => f.filename)
  
  // Jika filename diberikan, proses file spesifik
  if (filename && pluginFilter(filename)) {
    // Normalize path untuk cross-platform compatibility
    const normalizedFilename = filename.replace(/\\/g, '/')
    
    // Cari file yang cocok (bisa di subfolder)
    const targetFile = currentFiles.find(f => 
      f.filename === normalizedFilename || 
      f.filename.endsWith(normalizedFilename) ||
      f.fullPath.includes(filename)
    )
    
    if (targetFile) {
      await reloadSinglePlugin(targetFile.filename, targetFile.fullPath)
    } else {
      // File mungkin dihapus
      const pluginKeys = Object.keys(global.plugins)
      const deletedPlugin = pluginKeys.find(key => 
        key === normalizedFilename || 
        key.endsWith(normalizedFilename) ||
        key.includes(filename)
      )
      
      if (deletedPlugin) {
        console.log(`🗑️ Deleted plugin: ${deletedPlugin}`)
        if (conn?.logger) {
          conn.logger.warn(`Deleted plugin '${deletedPlugin}'`)
        }
        delete global.plugins[deletedPlugin]
      }
    }
  } else {
    // Reload semua plugin jika tidak ada filename spesifik
    console.log('Reloading all plugins...')
    
    // Hapus plugin yang tidak ada lagi
    Object.keys(global.plugins).forEach(pluginName => {
      if (!currentFilenames.includes(pluginName)) {
        console.log(`🗑️ Removed deleted plugin: ${pluginName}`)
        delete global.plugins[pluginName]
      }
    })
    
    // Reload semua plugin yang ada
    for (let file of currentFiles) {
      await reloadSinglePlugin(file.filename, file.fullPath)
    }
  }
  
  // Sortir ulang plugins
  global.plugins = Object.fromEntries(
    Object.entries(global.plugins).sort(([a], [b]) => a.localeCompare(b))
  )
  
  console.log(`📦 Total plugins loaded: ${Object.keys(global.plugins).length}`)
}

// Fungsi helper untuk reload plugin tunggal
async function reloadSinglePlugin(filename, fullPath) {
  try {
    const fileExists = existsSync(fullPath)
    
    if (filename in global.plugins) {
      if (fileExists) {
        console.log(`🔄 Reloading plugin: ${filename}`)
        if (conn?.logger) {
          conn.logger.info(`Re-requiring plugin '${filename}'`)
        }
      } else {
        console.log(`🗑️ Plugin deleted: ${filename}`)
        if (conn?.logger) {
          conn.logger.warn(`Deleted plugin '${filename}'`)
        }
        return delete global.plugins[filename]
      }
    } else if (fileExists) {
      console.log(`🆕 New plugin found: ${filename}`)
      if (conn?.logger) {
        conn.logger.info(`Requiring new plugin '${filename}'`)
      }
    }
    
    if (fileExists) {
      // Check syntax error
      let err = syntaxerror(readFileSync(fullPath), filename, {
        sourceType: 'module',
        allowAwaitOutsideFunction: true
      })
      
      if (err) {
        console.error(`❌ Syntax error in ${filename}:`, err.message)
        if (conn?.logger) {
          conn.logger.error(`Syntax error while loading '${filename}'\n${format(err)}`)
        }
      } else {
        try {
          // Import plugin dengan cache busting
          const fileURL = global.__filename(fullPath)
          const module = await import(`${fileURL}?update=${Date.now()}`)
          global.plugins[filename] = module.default || module
          console.log(`✅ Successfully loaded: ${filename}`)
        } catch (e) {
          console.error(`❌ Error requiring ${filename}:`, e.message)
          if (conn?.logger) {
            conn.logger.error(`Error require plugin '${filename}'\n${format(e)}`)
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Error in reloadSinglePlugin for ${filename}:`, error.message)
  }
}

// Fungsi watcher dengan support subfolder
function setupWatcher(dir) {
  try {
    console.log(`👁️ Watching directory: ${dir}`)
    
    // Watch directory utama
    watch(dir, { recursive: true }, async (eventType, filename) => {
      if (filename && pluginFilter(filename)) {
        console.log(`📁 File ${eventType}: ${filename}`)
        await global.reload(eventType, filename)
      }
    })
    
    // Fallback untuk sistem yang tidak mendukung recursive watch
    const watchDirectory = (dirPath) => {
      try {
        const items = readdirSync(dirPath)
        items.forEach(item => {
          const fullPath = join(dirPath, item)
          const stat = statSync(fullPath)
          
          if (stat.isDirectory()) {
            watchDirectory(fullPath) // Rekursif untuk subfolder
          }
        })
      } catch (error) {
        console.error(`Error setting up watcher for ${dirPath}:`, error.message)
      }
    }
    
    watchDirectory(dir)
    
  } catch (error) {
    console.error('Error setting up file watcher:', error.message)
    // Fallback ke polling jika watch gagal
    console.log('Falling back to basic file watching...')
    try {
      watchFile(dir, { interval: 1000 }, global.reload)
    } catch (fallbackError) {
      console.error('Fallback watcher also failed:', fallbackError.message)
    }
  }
}

// Object.freeze untuk mencegah modifikasi
Object.freeze(global.reload)

// Inisialisasi - FIXED VERSION (hapus duplikasi)
try {
  // Load semua plugin
  await filesInit()
  
  // Setup file watcher
  setupWatcher(pluginFolder)

  // ========== CASE HANDLER LOADING ==========
  try {
    const caseFile = join(__dirname, 'case.js')
    console.log('📁 Looking for case.js at:', caseFile)
    
    if (existsSync(caseFile)) {
        const { default: caseHandler } = await import(`${caseFile}?update=${Date.now()}`)
        global.caseHandler = caseHandler
        console.log('✅ Case handler loaded successfully')
        
        // Setup watcher untuk case.js dengan function declaration
        const watchCaseFile = async () => {
            try {
                unwatchFile(caseFile)
                const { default: newCaseHandler } = await import(`${caseFile}?update=${Date.now()}`)
                global.caseHandler = newCaseHandler
                console.log('🔄 Case handler reloaded')
                watchFile(caseFile, watchCaseFile) // Re-watch dengan function name
            } catch (error) {
                console.error('❌ Error reloading case handler:', error)
            }
        }
        
        watchFile(caseFile, watchCaseFile)
    } else {
        console.log('⚠️ Case.js not found at:', caseFile)
        global.caseHandler = null
    }
} catch (error) {
    console.error('❌ Error loading case handler:', error)
    global.caseHandler = null
}
  // ========== END CASE HANDLER LOADING ==========
  
  // Reload handler
  await global.reloadHandler()
  
  console.log('🚀 Plugin system initialized successfully!')
  console.log('📂 Plugin structure:')
  Object.keys(global.plugins).forEach(plugin => {
    console.log(`   ${plugin}`)
  })
  
} catch (error) {
  console.error('❌ Error initializing plugin system:', error)
}

// Quick Test

async function _quickTest() {
  let test = await Promise.all([
    spawn('ffmpeg'),
    spawn('ffprobe'),
    spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
    spawn('convert'),
    spawn('magick'),
    spawn('gm'),
    spawn('find', ['--version'])
  ].map(p => {
    return Promise.race([
      new Promise(resolve => {
        p.on('close', code => {
          resolve(code !== 127);
        });
      }),
      new Promise(resolve => {
        p.on('error', _ => resolve(false));
      })
    ]);
  }));

  let [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test;
  console.log(test);

  let s = global.support = {
    ffmpeg,
    ffprobe,
    ffmpegWebp,
    convert,
    magick,
    gm,
    find
  };

  Object.freeze(global.support);

  if (!s.ffmpeg) {
    conn.logger.warn(`Silahkan install ffmpeg terlebih dahulu agar bisa mengirim video`);
  }

  if (s.ffmpeg && !s.ffmpegWebp) {
    conn.logger.warn('Sticker Mungkin Tidak Beranimasi tanpa libwebp di ffmpeg (--enable-libwebp while compiling ffmpeg)');
  }

  if (!s.convert && !s.magick && !s.gm) {
    conn.logger.warn('Fitur Stiker Mungkin Tidak Bekerja Tanpa imagemagick dan libwebp di ffmpeg belum terinstall (pkg install imagemagick)');
  }
}

_quickTest()
  .then(() => conn.logger.info('☑️ Quick Test Done , nama file session ~> creds.json'))
  .catch(console.error);
