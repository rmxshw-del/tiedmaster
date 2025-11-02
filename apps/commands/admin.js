const fs = require('fs');
const path = require('path');

// Command configuration
const meta = {
  name: "admin",
  aliases: ["admins", "ad"],
  version: "0.0.2",
  type: "anyone",
  category: "system",
  description: "Admin management command",
  cooldown: 0,
  guide: "[add/list/remove]",
  author: "RemiSoms"
};

// 🧠 Permanent Owner ID (RemiSoms)
const OWNER_ID = "8237683404";

// Command initialization
async function onStart({ bot, message, msg, args, usages }) {
  // Define path to settings.json file
  const settingsPath = path.join(process.cwd(), 'setup', 'settings.json');

  // Load settings file
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (error) {
    console.error("❌ Error reading settings file:", error);
    return message.reply("⚠️ Failed to access admin list configuration.");
  }

  // Initialize admin list
  let admins = settings.admin || [];
  const command = (args[0] || "").toLowerCase();
  let targetId = args[1] || (msg.reply_to_message ? msg.reply_to_message.from.id : null);

  // Extract user ID from reply or mention
  if (msg.reply_to_message && !targetId) {
    targetId = msg.reply_to_message.from.id;
  } else if (args.length > 1) {
    targetId = args[1];
  }

  // Helper: Fetch Telegram user info safely
  async function getUserInfo(userId) {
    try {
      return await bot.getChat(userId);
    } catch (err) {
      console.error("⚠️ Error fetching user info:", err);
      return null;
    }
  }

  // 🧾 LIST ADMINS
  if (command === "list") {
    if (admins.length === 0) return message.reply("No admins found in the system.");

    let listMsg = "👑 *List of System Admins:*\n\n";
    for (let adminId of admins) {
      try {
        const userInfo = await getUserInfo(adminId);
        if (userInfo) {
          const name = `${userInfo.first_name} ${userInfo.last_name || ''}`;
          listMsg += `• ${name}\nhttps://t.me/${userInfo.username || adminId}\n\n`;
        } else {
          listMsg += `• User ID: ${adminId}\n\n`;
        }
      } catch (err) {
        console.error("Error fetching user info:", err);
      }
    }

    // Mark owner separately
    if (!admins.includes(OWNER_ID)) {
      const ownerInfo = await getUserInfo(OWNER_ID);
      if (ownerInfo) {
        listMsg += `⭐ Owner: ${ownerInfo.first_name} ${ownerInfo.last_name || ''}\nhttps://t.me/${ownerInfo.username || OWNER_ID}\n`;
      } else {
        listMsg += `⭐ Owner ID: ${OWNER_ID}\n`;
      }
    }

    return message.reply(listMsg);
  }

  // Permission check (Admin or Owner)
  const isOwner = msg.from.id.toString() === OWNER_ID;
  const isAdmin = admins.includes(msg.from.id.toString());
  const hasPermission = isOwner || isAdmin;

  // ➕ ADD ADMIN
  if (["add", "-a", "a"].includes(command)) {
    if (!hasPermission) {
      return message.reply("🚫 You don't have permission to use this command.");
    }

    const id = parseInt(targetId);
    if (isNaN(id)) return message.reply("⚠️ Invalid ID provided.");
    if (admins.includes(id.toString())) return message.reply("⚠️ This user is already an admin.");

    admins.push(id.toString());
    settings.admin = admins;

    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing settings file:", error);
      return message.reply("❌ Failed to save admin list.");
    }

    const userInfo = await getUserInfo(id);
    const userName = userInfo ? `${userInfo.first_name} ${userInfo.last_name || ''}` : 'User';
    return message.reply(`✅ ${userName} has been added as an admin.`);
  }

  // ➖ REMOVE ADMIN
  if (["remove", "-r", "r"].includes(command)) {
    if (!hasPermission) {
      return message.reply("🚫 You don't have permission to use this command.");
    }

    if (admins.length === 0) return message.reply("⚠️ There are no admins to remove.");

    const id = parseInt(targetId);
    if (isNaN(id)) return message.reply("⚠️ Invalid ID provided.");
    if (!admins.includes(id.toString())) return message.reply("⚠️ This user is not an admin.");

    // Prevent removing the owner
    if (id.toString() === OWNER_ID) {
      return message.reply("🚫 You cannot remove the owner (RemiSoms).");
    }

    settings.admin = admins.filter(a => a !== id.toString());

    try {
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (error) {
      console.error("Error writing settings file:", error);
      return message.reply("❌ Failed to update admin list.");
    }

    const userInfo = await getUserInfo(id);
    const userName = userInfo ? `${userInfo.first_name} ${userInfo.last_name || ''}` : 'User';
    return message.reply(`✅ ${userName} has been removed from admin list.`);
  }

  // ❓ Invalid command usage
  return usages();
}

module.exports = { meta, onStart };