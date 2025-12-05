const config = require('../config');
const moment = require('moment-timezone');
const { cmd, commands } = require('../command');
const { runtime } = require('../lib/functions');
const os = require('os');
const { getPrefix } = require('../lib/prefix');
const fs = require('fs');
const path = require('path');

// Quoted Contact Message (from BMB style)
const quotedContact = {
  key: {
    fromMe: false,
    participant: `0@s.whatsapp.net`,
    remoteJid: "status@broadcast"
  },
  message: {
    contactMessage: {
      displayName: "NOVA VERIFIED ✅",
      vcard: `BEGIN:VCARD
VERSION:3.0
FN:NOVA VERIFIED ✅
ORG:POP KID BOT;
TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER || '0000000000'}:+${config.OWNER_NUMBER || '0000000000'}
END:VCARD`
    }
  }
};

// Stylize uppercase letters
function toUpperStylized(str) {
  const stylized = {
    A: 'ᴀ', B: 'ʙ', C: 'ᴄ', D: 'ᴅ', E: 'ᴇ', F: 'ғ', G: 'ɢ', H: 'ʜ',
    I: 'ɪ', J: 'ᴊ', K: 'ᴋ', L: 'ʟ', M: 'ᴍ', N: 'ɴ', O: 'ᴏ', P: 'ᴘ',
    Q: 'ǫ', R: 'ʀ', S: 's', T: 'ᴛ', U: 'ᴜ', V: 'ᴠ', W: 'ᴡ', X: 'x',
    Y: 'ʏ', Z: 'ᴢ'
  };
  return str.split('').map(c => stylized[c.toUpperCase()] || c).join('');
}

// Normalize category names
const normalize = (str) => str.toLowerCase().replace(/\s+menu$/, '').trim();

// Emoji by category (music/audio removed)
const emojiByCategory = {
  ai: '🤖',
  anime: '🍥',
  bible: '📖',
  download: '⬇️',
  downloader: '📥',
  fun: '🎮',
  game: '🕹️',
  group: '👥',
  img_edit: '🖌️',
  info: 'ℹ️',
  information: '🧠',
  logo: '🖼️',
  main: '🏠',
  media: '🎞️',
  menu: '📜',
  misc: '📦',
  other: '📁',
  owner: '👑',
  privacy: '🔒',
  search: '🔎',
  settings: '⚙️',
  sticker: '🌟',
  tools: '🛠️',
  user: '👤',
  utilities: '🧰',
  utility: '🧮',
  wallpapers: '🖼️',
  whatsapp: '📱',
};

cmd({
  pattern: 'menu',
  alias: ['allmenu'],
  desc: 'Show all bot commands',
  category: 'menu',
  react: '🪀',
  filename: __filename
}, async (conn, mek, m, { from, sender, reply }) => {
  try {
    const prefix = getPrefix();
    const timezone = config.TIMEZONE || 'Africa/Nairobi';
    const time = moment().tz(timezone).format('HH:mm:ss');
    const date = moment().tz(timezone).format('dddd, DD MMMM YYYY');

    const uptime = () => {
      let sec = process.uptime();
      let h = Math.floor(sec / 3600);
      let m = Math.floor((sec % 3600) / 60);
      let s = Math.floor(sec % 60);
      return `${h}h ${m}m ${s}s`;
    };

    // Random menu image (BMB style)
    const randomIndex = Math.floor(Math.random() * 10) + 1;
    const imagePath = path.join(__dirname, '..', 'plugins', `menu${randomIndex}.jpg`);
    let imageBuffer;
    try { imageBuffer = fs.readFileSync(imagePath); } catch { imageBuffer = null; }

    // Menu header (BMB style)
    let menu = `
┌───────────────────────────┐
│        🦁 NOVA XMD BOT 🦁
├───────────────────────────┤
│  USER      : @${sender.split("@")[0]}
│  RUNTIME   : ${uptime()}
│  MODE      : ${config.MODE}
│  PREFIX    : ${config.PREFIX}
│  OWNER     : ${config.OWNER_NAME}
│  PLUGINS   : ${commands.length}
│  DEV       : Bmb Tech
│  VERSION   : 2.0.0
└────────────────────────────┘`;

    // Group commands by category (music related removed)
    const categories = {};
    for (const cmd of commands) {
      if (cmd.category && !cmd.dontAdd && cmd.pattern) {
        const cat = normalize(cmd.category);

        // Skip music/audio categories completely
        if (cat === 'music' || cat === 'audio') continue;

        categories[cat] = categories[cat] || [];
        categories[cat].push(cmd.pattern.split('|')[0]);
      }
    }

    for (const cat of Object.keys(categories).sort()) {
      const emoji = emojiByCategory[cat] || '🔥';
      menu += `\n\n┏─『 ${emoji} ${toUpperStylized(cat)} ${toUpperStylized('Menu')} 』──⊷\n`;
      for (const c of categories[cat].sort()) {
        menu += `│ ${prefix}${c}\n`;
      }
      menu += `┗──────────────⊷`;
    }

    menu += `\n\n> ${config.DESCRIPTION || toUpperStylized('Explore the bot commands!')}`;

    // Send menu (NO AUDIO INCLUDED)
    await conn.sendMessage(
      from,
      {
        image: imageBuffer ? { buffer: imageBuffer } : { url: config.MENU_IMAGE_URL || 'https://i.ibb.co/YBXN0gZ5/picha.jpg' },
        caption: menu,
        contextInfo: {
          mentionedJid: [sender],
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: config.NEWSLETTER_JID || '120363382023564830@newsletter',
            newsletterName: config.OWNER_NAME || toUpperStylized('𝘕𝘖𝘝𝘈 𝘟𝘔𝘋'),
            serverMessageId: 143
          }
        }
      },
      { quoted: quotedContact }
    );

  } catch (e) {
    console.error('Menu Error:', e.message);
    await reply(`❌ ${toUpperStylized('Error')}: Failed to show menu.\n${toUpperStylized('Details')}: ${e.message}`);
  }
});