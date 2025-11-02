const axios = require("axios");
const { URL } = require("url");

const meta = {
  name: "lookup",
  version: "1.0.8",
  aliases: ["fbid", "fblink"],
  description: "Find Facebook numeric ID from any Facebook profile link or username.",
  author: "DJ Remi Soms",
  prefix: "both",
  category: "tools",
  type: "anyone",
  cooldown: 3,
  guide: "lookup <facebook link or username>"
};

function normalizeFbLink(input) {
  let text = input.trim();
  if (/^[A-Za-z0-9.\-_]+$/.test(text)) text = `https://www.facebook.com/${text}`;
  if (!/^https?:\/\//i.test(text)) text = "https://" + text;

  try {
    const u = new URL(text);
    if (u.hostname.startsWith("m.")) u.hostname = "www.facebook.com";
    if (/^(l|lm)\.facebook\.com$/i.test(u.hostname)) u.hostname = "www.facebook.com";
    return u.href;
  } catch {
    return text;
  }
}

async function onStart({ bot, args, message, usages }) {
  const chatId = message.chat?.id || message.chatId;

  try {
    const input = args.join(" ").trim();
    if (!input) return usages();

    const fbLink = normalizeFbLink(input);
    await bot.sendChatAction(chatId, "typing");

    // ✅ Step 1: Try Betadash API
    const apiUrl = `https://betadash-api-swordslush-production.up.railway.app/lookup?fblink=${encodeURIComponent(fbLink)}`;
    let res = await axios.get(apiUrl, { timeout: 15000 });
    let data = res.data;

    // ✅ Step 2: Fallback to Graph API if no ID found
    if (data.error && data.error.toLowerCase().includes("specified element not found")) {
      const username = fbLink.split("facebook.com/")[1].split(/[/?#]/)[0];
      const graphUrl = `https://graph.facebook.com/${username}`;
      try {
        const graphRes = await axios.get(graphUrl);
        data = graphRes.data;
        data.source = "Facebook Graph API";
      } catch {
        return bot.sendMessage(
          chatId,
          `⚠️ No Facebook ID found.\n🔗 *Link:* ${fbLink}\n\nMake sure the profile is *public* and valid.`,
          { parse_mode: "Markdown" }
        );
      }
    }

    const fbId =
      data.id ||
      data.fbId ||
      data.facebook_id ||
      data.result?.id ||
      data.data?.id ||
      (typeof data === "string" ? data.match(/\b\d{5,}\b/)?.[0] : null);

    if (!fbId) {
      return bot.sendMessage(
        chatId,
        `⚠️ Could not find a valid Facebook ID.\n🔗 *Link:* ${fbLink}`,
        { parse_mode: "Markdown" }
      );
    }

    const name = data.name || data.username || "Unknown";
    const link = data.link || fbLink;
    const profilePic = `https://graph.facebook.com/${fbId}/picture?type=large`;

    const caption =
      `🔍 *Facebook Lookup Result*\n\n` +
      `👤 *Name:* ${name}\n` +
      `🆔 *Facebook ID:* \`${fbId}\`\n` +
      `🔗 *Profile:* [Open Link](${link})\n\n` +
      `— DJ Remi Soms Bot`;

    await bot.sendPhoto(chatId, profilePic, {
      caption,
      parse_mode: "Markdown"
    });

  } catch (error) {
    console.error("[lookup]", error.message);
    const errText = error.response?.data?.error
      ? error.response.data.error
      : error.message;
    await bot.sendMessage(chatId, `❌ Lookup failed.\n\nReason: ${errText}`);
  }
}

module.exports = { meta, onStart };