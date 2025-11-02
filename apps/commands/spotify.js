const axios = require("axios");

const meta = {
  name: "spotify",
  version: "5.4",
  aliases: ["song", "music"],
  description: "Spotify-style song search and MP3 playback",
  author: "Angel Nico Igdalino (fixed by DJ Remi Soms)",
  prefix: "both",
  category: "music",
  type: "anyone",
  cooldown: 5,
  guide: "spotify [song name]"
};

async function onStart({ bot, args, message, usages }) {
  try {
    // ✅ Get user input
    const songName = args.join(" ").trim();
    if (!songName) return usages();

    const chatId = message.chat?.id || message.chatId;

    // 🎬 Show upload action
    await bot.sendChatAction(chatId, "upload_audio");

    // 🌐 Fetch song data from API
    const apiUrl = `https://golden-bony-solidstatedrive.vercel.app/download/spotysearch?search=${encodeURIComponent(songName)}`;
    const response = await axios.get(apiUrl, { timeout: 20000 });
    const data = response.data;

    // ⚠️ Check if API returned valid result
    if (!data || !data.status || !data.result || !data.result.download_url) {
      return bot.sendMessage(chatId, "❌ No result found or API error.");
    }

    // 🎶 Extract song details
    const result = data.result;
    const title = result.title || "Unknown Title";
    const artist = Array.isArray(result.artists)
      ? result.artists.join(", ")
      : result.artists || "Unknown Artist";

    const durationMs = result.duration || 0;
    const duration =
      durationMs > 0
        ? `${Math.floor(durationMs / 60000)}:${String(
            Math.floor((durationMs % 60000) / 1000)
          ).padStart(2, "0")}`
        : "Unknown";

    const thumbnail = result.thumbnail;
    const audioUrl = result.download_url;

    const caption = `🎧 *${title}*\n👤 Artist: ${artist}\n🕒 Duration: ${duration}`;

    // 🖼️ Send album art + caption
    if (thumbnail) {
      await bot.sendPhoto(chatId, thumbnail, {
        caption,
        parse_mode: "Markdown"
      });
    } else {
      await bot.sendMessage(chatId, caption, { parse_mode: "Markdown" });
    }

    // 🎵 Send the MP3 audio file
    await bot.sendAudio(chatId, audioUrl, {
      caption: "✅ Now playing 🎶",
      parse_mode: "Markdown"
    });

  } catch (error) {
    // ❌ Handle errors safely
    console.error(`[${meta.name}] Error:`, error.message);
    const chatId = message.chat?.id || message.chatId;
    await bot.sendMessage(
      chatId,
      `❌ [${meta.name}] Error fetching song data.\n\nDetails: ${error.message}`
    );
  }
}

module.exports = { meta, onStart };