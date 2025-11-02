const fs = require("fs");
const path = require("path");

const meta = {
  name: "help",
  aliases: ["h"],
  version: "1.1.0",
  author: "System",
  description: "Displays all available bot commands dynamically.",
  guide: "",
  cooldown: 5,
  prefix: "both",
  type: "anyone",
  category: "system",
};

async function onStart({ bot, chatId, msg, message }) {
  try {
    // ✅ Default prefix and symbol
    const prefix = (global.settings && global.settings.prefix) || "/";
    const symbol = (global.settings && global.settings.symbols) || "•";

    // ✅ Automatically detect commands folder
    // Adjust path if your folder structure is different
    const commandsDir = path.join(__dirname, "../"); // if help.js is inside /commands/system/
    let allCommands = [];

    // ✅ Read all command folders and JS files
    const folders = fs.readdirSync(commandsDir);
    for (const folder of folders) {
      const folderPath = path.join(commandsDir, folder);
      if (fs.lstatSync(folderPath).isDirectory()) {
        const files = fs
          .readdirSync(folderPath)
          .filter((file) => file.endsWith(".js"));
        files.forEach((file) => {
          const commandName = file.replace(".js", "");
          allCommands.push(commandName);
        });
      }
    }

    // ✅ Remove duplicates and sort alphabetically
    allCommands = [...new Set(allCommands.sort())];

    // ✅ Format command list
    const helpLines = allCommands
      .map((cmd) => `│➥ ${symbol} ${prefix}${cmd}`)
      .join("\n");

    // ✅ Final message
    const helpMessage = 
`📜 *Bot Commands*

╭─────────────────✦
│ Available Commands (${allCommands.length})
├───✦
${helpLines}
╰─────────────────✦

💡 Type \`${prefix}help <command>\` for more info.`;

    // ✅ Send to chat or console
    if (message?.reply) {
      await message.reply(helpMessage, { parse_mode: "Markdown" });
    } else if (bot && chatId) {
      await bot.sendMessage(chatId, helpMessage, { parse_mode: "Markdown" });
    } else {
      console.log(helpMessage);
    }
  } catch (error) {
    console.error("❌ Error in help command:", error);
    if (bot && chatId) {
      await bot.sendMessage(chatId, "❌ Error while loading help menu.");
    }
  }
}

module.exports = { meta, onStart };