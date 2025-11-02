const axios = require("axios");

const meta = {
  name: "spotify2",
  version: "1.0.0",
  aliases: ["sp2", "spotifydl"],
  description: "Play or download music from Spotify",
  author: "ShawnDesu (final fix by DJ Remi Soms)",
  prefix: "both",
  category: "music",
  type: "anyone",
  cooldown: 5,
  guide: "spotify2 [song name]"
};

async function onStart({ bot, args, message, usages }) {
  try {
    // 📝 Get the search query
    const query = args.join(" ").trim();
    if (!query) return usages();

    const chatId = message.chat?.id || message.chatId;

    // 🌐 API Base (set manually if not using global.api.neko)
    const baseAPI = global?.api?.neko || "https://nekobot.xyz/api";

    // 🎵 Step 1: Search for tracks
    const searchUrl = `${baseAPI}/search/spotify?q=${encodeURIComponent(query)}`;
    const searchResponse = await axios.get(searchUrl, { timeout: 20000 });
    const searchData = searchResponse.data;

    if (!searchData?.result || searchData.result.length === 0) {
      return bot.sendMessage(chatId, "❌ No tracks found for your query.");
    }

    const firstTrack = searchData.result[0];
    const spotifyUrl = firstTrack.url;

    // 🎧 Step 2: Download song data
    const downloadUrl = `${baseAPI}/downloader/spotify?url=${encodeURIComponent(spotifyUrl)}`;
    const downloadResponse = await axios.get(downloadUrl, { timeout: 20000 });
    const data = downloadResponse.data?.result;

    if (!data || !data.downloadUrl) {
      return bot.sendMessage(chatId, "❌ Failed to retrieve the download link.");
    }

    // 🎶 Extract details
    const title = data.title || "Unknown Title";
    const artist = data.artist || "Unknown Artist";
    const duration = data.duration || "Unknown Duration";
    const link = data.link || spotifyUrl;
    const thumbnail = data.thumbnail;
    const audioUrl = data.downloadUrl;

    const caption = `🎧 *${title}*\n👤 Artist: ${artist}\n🕒 Duration: ${duration}\n🔗 [Listen on Spotify](${link})`;

    // 🖼️ Step 3: Send thumbnail with details
    if (thumbnail) {
      await bot.sendPhoto(chatId, thumbnail, {
        caption,
        parse_mode: "Markdown"
      });
    } else {
      await bot.sendMessage(chatId, caption, { parse_mode: "Markdown" });
    }

    // 🎵 Step 4: Send the MP3 file
    await bot.sendChatAction(chatId, "upload_audio");
    await bot.sendAudio(chatId, audioUrl, {
      caption: "✅ Now playing 🎶",
      parse_mode: "Markdown"
    });
  } catch (error) {
    // ⚠️ Error handling
    console.error(`[${meta.name}] Error:`, error);
    const chatId = message.chat?.id || message.chatId;
    await bot.sendMessage(
      chatId,
      `❌ [${meta.name}] » An error occurred while processing your request.\n\nDetails: ${error.message}`
    );
  }
}

module.exports = { meta, onStart };