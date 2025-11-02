const axios = require('axios');

const meta = {
  name: "funfact",
  version: "1.0.0",
  aliases: ["fact", "randomfact"],
  description: "Get a random fun fact to brighten your day!",
  author: "FunFactBotDev",
  prefix: "both",
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: ""
};

async function onStart({ bot, chatId, args, message }) {
  try {
    const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
    const fact = response.data.text;
    message.reply(`🧠 Did you know? ${fact}`);
  } catch (error) {
    message.reply("Oops, couldn't fetch a fun fact right now. Try again later!");
  }
}

module.exports = { meta, onStart };