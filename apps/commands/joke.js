const axios = require('axios');

const meta = {
  name: "joke",
  version: "1.0.0",
  aliases: ["telljoke", "randomjoke"],
  description: "Get a random joke to make you laugh!",
  author: "JokeBotDev",
  prefix: "both",
  category: "utility",
  type: "anyone",
  cooldown: 5,
  guide: ""
};

async function onStart({ bot, chatId, args, message }) {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    const { setup, punchline } = response.data;
    const jokeMessage = `${setup}\n\n${punchline}`;
    message.reply(jokeMessage);
  } catch (error) {
    message.reply("Oops, couldn't fetch a joke right now. Try again later!");
  }
}

module.exports = { meta, onStart };