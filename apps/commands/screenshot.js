const axios = require("axios");
const fs = require("fs");
const path = require("path");

const meta = {
  name: "screenshot",
  version: "1.0.1",
  aliases: ["ss", "capture"],
  description: "Downloads a preset Facebook share screenshot using BetaDash API",
  author: "Giomer Amores",
  prefix: "both",
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: "Usage: screenshot [0 or 1] (auto fetches Facebook share)"
};

// Array of links (old + new)
const urls = [
  "https://betadash-api-swordslush-production.up.railway.app/screenshot?url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BNcYvGF55%2F",
  "https://betadash-api-swordslush-production.up.railway.app/screenshot?url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17PoKpE8iv%2F"
];

async function onStart({ bot, args, message }) {
  const index = parseInt(args[0]) || 0; // 0 = first link, 1 = second link
  const apiUrl = urls[index % urls.length];
  const outputFile = `facebook_screenshot_${index}.png`;

  message.reply("📸 Fetching Facebook share screenshot...");

  try {
    const response = await axios({
      method: "get",
      url: apiUrl,
      responseType: "stream",
      headers: {
        "Accept": "image/*,application/octet-stream",
        "User-Agent": "axios/1.8.3",
        "Accept-Encoding": "gzip, compress, deflate, br"
      }
    });

    const outputPath = path.resolve(outputFile);
    const writer = fs.createWriteStream(outputPath);

    response.data.pipe(writer);

    writer.on("finish", async () => {
      await message.reply(`✅ Screenshot saved successfully: ${outputPath}`);
    });

    writer.on("error", async (err) => {
      await message.reply(`❌ Write error: ${err.message}`);
    });

  } catch (error) {
    console.error("❌ Failed to fetch screenshot:", error.message);
    if (error.response) console.error(`Status: ${error.response.status}`);
    await message.reply("❌ Failed to capture screenshot. Please try again later.");
  }
}

module.exports = { meta, onStart };