const axios = require('axios');

const meta = {
  name: "openai",
  version: "2.0.1",
  aliases: ["ai", "ask"],
  description: "Ask OpenAI anything (via Rapido Operator)",
  author: "ShawnDesu",
  prefix: "both",
  category: "ai",
  type: "anyone",
  cooldown: 5,
  guide: "[your question]"
};

async function onStart({ bot, args = [], message = {}, msg, usages }) {
  try {
    // Ensure args are valid
    const question = Array.isArray(args) ? args.join(" ").trim() : "";
    if (!question) {
      if (typeof usages === "function") return usages();
      return message.reply?.("❓ Please provide a question to ask OpenAI.");
    }

    // Select model automatically
    const model =
      question.length < 80
        ? "gpt-4o-mini"
        : question.length < 250
        ? "gpt-5-mini"
        : "gpt-5-pro";

    // Get sender ID or fallback
    const uid = message.sender?.id || "anonymous_user";

    // Rapido Operator API endpoint
    const apiURL = "https://rapido.zetsu.xyz/api/openai.js";

    // Request response from API
    const response = await axios.get(apiURL, {
      params: { query: question, uid, model },
      timeout: 30000, // 30 seconds
      validateStatus: (status) => status >= 200 && status < 500
    });

    const data = response.data || {};
    const output =
      data.result ||
      data.response ||
      data.output ||
      data.message ||
      data.text ||
      null;

    if (!output) {
      return message.reply?.("⚠️ OpenAI couldn’t generate a response. Please try again later.");
    }

    // Convert markdown to safe Telegram format
    const formatted = output
      .replace(/\*\*(.+?)\*\*/g, (_, content) => `*${content}*`)
      .replace(/__(.+?)__/g, (_, content) => `_${content}_`)
      .trim();

    // Send reply
    return message.reply?.(formatted, { parse_mode: "Markdown" });

  } catch (error) {
    console.error(`[ ${meta.name} ] » Error:`, error);

    const errMsg =
      error?.response?.data?.error ||
      error?.response?.statusText ||
      error?.message ||
      "Unknown error occurred.";

    return message.reply?.(`[ ${meta.name} ] » ❌ Error: ${errMsg}`);
  }
}

module.exports = { meta, onStart };