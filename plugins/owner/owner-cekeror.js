import fs from 'fs';
import path from 'path';

let Fruatre = async (m, { conn }) => {
    let pluginFolder = './plugins';
    let errorList = [];
    let successList = [];

    // Cek apakah folder plugin ada
    if (!fs.existsSync(pluginFolder)) {
        return m.reply('❌ Folder plugins tidak ditemukan!');
    }

    // Fungsi rekursif untuk membaca semua file JS
    function getAllJSFiles(dir, baseDir = dir, fileList = []) {
        try {
            const files = fs.readdirSync(dir);
            
            files.forEach(file => {
                const fullPath = path.join(dir, file);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    // Rekursif ke dalam subfolder
                    getAllJSFiles(fullPath, baseDir, fileList);
                } else if (stat.isFile() && file.endsWith('.js')) {
                    // Dapatkan path relatif dari base directory
                    const relativePath = path.relative(baseDir, fullPath);
                    fileList.push({
                        filename: relativePath.replace(/\\/g, '/'), // Normalize path separator
                        fullPath: fullPath,
                        relativePath: relativePath
                    });
                }
            });
        } catch (error) {
            errorList.push(`❌ Error reading directory ${dir}: ${error.message}`);
        }
        
        return fileList;
    }

    // Dapatkan semua file JS
    let allFiles = getAllJSFiles(pluginFolder);

    if (allFiles.length === 0) {
        return m.reply('❌ Tidak ditemukan file plugin (.js) dalam folder plugins!');
    }

    m.reply(`🔍 Memeriksa ${allFiles.length} file plugin...\nSedang dalam proses, mohon tunggu...`);

    for (let { filename, fullPath } of allFiles) {
        try {
            // Baca file untuk syntax check
            const fileContent = fs.readFileSync(fullPath, 'utf8');
            
            // Basic syntax validation
            if (!fileContent.trim()) {
                throw new Error('File kosong');
            }

            // Check for basic export
            if (!fileContent.includes('export default') && !fileContent.includes('module.exports')) {
                throw new Error('Tidak ada export default atau module.exports');
            }

            // Import file sebagai modul ESM dengan cache busting
            const fileURL = `file://${path.resolve(fullPath)}?update=${Date.now()}`;
            let plugin = await import(fileURL);
            
            // Validasi plugin structure
            let pluginHandler = plugin.default || plugin;
            
            if (typeof pluginHandler !== 'function' && typeof pluginHandler !== 'object') {
                throw new Error('Export default bukan fungsi atau object yang valid');
            }

            // Jika object, check apakah ada property yang valid
            if (typeof pluginHandler === 'object') {
                const requiredProps = ['help', 'tags', 'command'];
                const hasAnyProp = requiredProps.some(prop => pluginHandler.hasOwnProperty(prop));
                
                if (!hasAnyProp && typeof pluginHandler.handler !== 'function') {
                    throw new Error('Object plugin tidak memiliki property yang diperlukan (help, tags, command, atau handler)');
                }
            }

            // Validasi command pattern jika ada
            if (pluginHandler.command) {
                if (!(pluginHandler.command instanceof RegExp) && 
                    !Array.isArray(pluginHandler.command) && 
                    typeof pluginHandler.command !== 'string') {
                    throw new Error('Property command harus berupa RegExp, Array, atau String');
                }
            }

            successList.push(`✅ ${filename}`);
            
        } catch (err) {
            let errorMsg = err.message;
            
            // Handle specific import errors
            if (errorMsg.includes('SyntaxError')) {
                errorMsg = 'Syntax Error dalam kode JavaScript';
            } else if (errorMsg.includes('Cannot resolve module')) {
                errorMsg = 'Tidak dapat mengimpor modul/dependency yang diperlukan';
            } else if (errorMsg.includes('ENOENT')) {
                errorMsg = 'File tidak ditemukan atau tidak dapat dibaca';
            }
            
            errorList.push(`❌ ${filename}: ${errorMsg}`);
        }
    }

    // Buat laporan hasil
    let report = `📊 *HASIL PEMERIKSAAN PLUGIN*\n\n`;
    
    if (successList.length > 0) {
        report += `✅ *Plugin Valid (${successList.length}):*\n`;
        report += successList.join('\n') + '\n\n';
    }
    
    if (errorList.length > 0) {
        report += `🚨 *Plugin Bermasalah (${errorList.length}):*\n`;
        report += errorList.join('\n') + '\n\n';
        report += `⚠️ *Saran:* Perbaiki error di atas agar plugin dapat berfungsi dengan baik.`;
    } else {
        report += `🎉 *Semua plugin aman dan valid!*\nTotal: ${allFiles.length} plugin diperiksa.`;
    }

    // Statistik folder
    let folderStats = {};
    allFiles.forEach(({ filename }) => {
        const parts = filename.split('/');
        const folder = parts.length > 1 ? parts[0] : 'root';
        folderStats[folder] = (folderStats[folder] || 0) + 1;
    });

    if (Object.keys(folderStats).length > 1) {
        report += `\n\n📁 *Distribusi per Folder:*\n`;
        Object.entries(folderStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .forEach(([folder, count]) => {
                report += `${folder}: ${count} plugin\n`;
            });
    }

    // Split message jika terlalu panjang
    if (report.length > 4000) {
        const messages = [];
        let currentMessage = '';
        const lines = report.split('\n');
        
        for (let line of lines) {
            if ((currentMessage + line + '\n').length > 4000) {
                messages.push(currentMessage.trim());
                currentMessage = line + '\n';
            } else {
                currentMessage += line + '\n';
            }
        }
        
        if (currentMessage.trim()) {
            messages.push(currentMessage.trim());
        }
        
        // Kirim dalam beberapa pesan
        for (let i = 0; i < messages.length; i++) {
            const header = i === 0 ? '' : `📊 *LANJUTAN ${i + 1}:*\n\n`;
            await conn.reply(m.chat, header + messages[i], m);
        }
    } else {
        m.reply(report);
    }
};

Fruatre.help = ['checkerror'];
Fruatre.tags = ['owner'];
Fruatre.command = /^(checkerror|checkplugin)$/i;
Fruatre.rowner = true; // Hanya untuk owner

export default Fruatre;