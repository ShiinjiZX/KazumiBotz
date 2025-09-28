import axios from 'axios';
import fs from 'fs';
import path from 'path';

const listmodel = [
  'gpt-4.1-nano',
  'gpt-4.1-mini',
  'gpt-4.1',
  'o4-mini',
  'deepseek-r1',
  'deepseek-v3',
  'claude-3.7',
  'gemini-2.0',
  'grok-3-mini',
  'qwen-qwq-32b',
  'gpt-4o',
  'o3',
  'gpt-4o-mini',
  'llama-3.3'
];

const defaultSettings = {
  model: 'grok-3-mini',
  system_prompt: 'Be a helpful AI assistant.'
};

const dbPath = path.resolve('./src/ai-custom.json');

function loadUserSettings() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    }
    return {};
  } catch (e) {
    console.error('Error loading user settings:', e);
    return {};
  }
}

function saveUserSettings(settings) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving user settings:', e);
  }
}

async function chatai(q, model, system_prompt) {
  if (!listmodel.includes(model)) {
    return {
      error: `Model tidak tersedia, gunakan model berikut: ${listmodel.join(', ')}`,
      models: listmodel
    };
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Mobile Safari/537.36',
    'Referer': 'https://ai-interface.anisaofc.my.id/'
  };
  
  const data = {
    question: q,
    model: model,
    system_prompt: system_prompt
  };
  
  try {
    const res = await axios.post(
      'https://ai-interface.anisaofc.my.id/api/chat', 
      data, 
      { headers, timeout: 10000 }
    );
    return res.data;
  } catch (e) {
    throw new Error(e.response?.data?.message || e.message || 'Request AI gagal');
  }
}

let yeon = async (m, { conn, text, usedPrefix, command }) => {
  const userSettings = loadUserSettings();
  const sender = m.sender;
  
  if (text.startsWith('set')) {
    const args = text.slice(4).trim().split('|').map(arg => arg.trim());
    const [model, system_prompt] = args;
    
    if (!model) {
      await conn.sendMessage(m.chat, {
        react: { text: "❌", key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: `🤖 *Model yang tersedia:*\n${listmodel.join('\n')}\n\n💡 Contoh: *${usedPrefix}ai set gpt-4o | Kamu adalah asisten yang membantu dalam pemrograman*`
      });
    }
    
    if (!listmodel.includes(model)) {
      await conn.sendMessage(m.chat, {
        react: { text: "⛔️", key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: `❌ *Model tidak valid!*\n\n🤖 Model yang tersedia:\n${listmodel.join('\n')}`
      });
    }
    
    if (!system_prompt) {
      await conn.sendMessage(m.chat, {
        react: { text: "ℹ️", key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: `📝 *System Prompt kosong!*\n\n💡 Contoh system prompt:\n"Kamu adalah asisten yang sopan dan membantu"\n"Jawablah dengan singkat dan jelas"\n"Gunakan bahasa Indonesia yang formal"`
      });
    }
    
    userSettings[sender] = { model, system_prompt };
    saveUserSettings(userSettings);
    
    await conn.sendMessage(m.chat, {
      react: { text: "✅", key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `⚙️ *Pengaturan AI berhasil disimpan!*\n\n🤖 Model: *${model}*\n📝 System Prompt: *${system_prompt}*`
    });
  }
  
  if (!text) {
    const currentSettings = userSettings[sender] || defaultSettings;
    await conn.sendMessage(m.chat, {
      react: { text: "❓", key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `🤖 *Cara menggunakan AI Chat*\n\n💬 *Chat biasa:* ${usedPrefix}ai <pertanyaan>\n⚙️ *Set pengaturan:* ${usedPrefix}ai set <model> | <system_prompt>\n\n🔧 *Pengaturan saat ini:*\nModel: ${currentSettings.model}\nSystem Prompt: ${currentSettings.system_prompt}`
    });
  }
  
  try {
    await conn.sendMessage(m.chat, {
      react: { text: "⏳", key: m.key }
    });
    
    const settings = userSettings[sender] || defaultSettings;
    const response = await chatai(text, settings.model, settings.system_prompt);
    
    if (response.error) {
      await conn.sendMessage(m.chat, {
        react: { text: "⛔️", key: m.key }
      });
      return conn.sendMessage(m.chat, {
        text: `❌ *Error:* ${response.error}`
      });
    }
    
    await conn.sendMessage(m.chat, {
      react: { text: "🤖", key: m.key }
    });
      
    return conn.sendMessage(m.chat, {
      text: `${response.response}`,
      contextInfo: {
        externalAdReply: {
          title: 'AI Interface',
          body: `Model: ${settings.model}`,
          sourceUrl: 'https://whatsapp.com',
        }
      }
    }, { quoted: m });
    
  } catch (e) {
    await conn.sendMessage(m.chat, {
      react: { text: "⚠️", key: m.key }
    });
    return conn.sendMessage(m.chat, {
      text: `❌ *Gagal memproses permintaan AI:* ${e.message}`
    });
  }
};

yeon.help = [
  'ai hai',
  'ai set model | hai'
];
yeon.tags = ['ai'];
yeon.command = /^ai$/i;
yeon.register = true;
yeon.limit = true;
export default yeon;