const axios = require("axios");

const meta = {
  name: "gpt",
  version: "1.0.0",
  aliases: ["ai", "ask"],
  description: "Ask GPT a question using BetaDash API",
  author: "Giomier",
  prefix: "both", // works with or without prefix
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: "Usage: gpt <your question>"
};

async function onStart({ bot, args, message, msg }) {
  if (!args[0]) {
    return message.reply("❗ Please provide a question.\nExample: gpt Hello");
  }

  const query = args.join(" ");
  const encodedQuery = encodeURIComponent(query);
  const url = `https://betadash-api-swordslush-production.up.railway.app/gpt4?ask=${encodedQuery}`;

  try {
    const res = await axios.get(url, { timeout: 10000 });
    const replyText =
      res.data?.content || res.data?.response || "⚠️ No response from GPT.";

    await message.reply(replyText);
  } catch (err) {
    console.error("GPT API Error:", err.message);
    await message.reply("❌ Error: Failed to fetch GPT response. Please try again later.");
  }
}

module.exports = { meta, onStart };