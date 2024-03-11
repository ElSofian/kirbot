const { Client, GatewayIntentBits, Events } = require('discord.js');
const { Player } = require("discord-player");
require('dotenv').config();
const loadCommands = require('./handlers/loadCommands');
const loadEvents = require ('./handlers/loadEvents');
const registerCommands = require('./handlers/registerCommands');
const { QuickDB } = require("quick.db");

const client = new Client({ 
   intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
	  GatewayIntentBits.GuildVoiceStates,
	] 
});
client.logger = new (require('./structures/Logger'))();
client.functions = require('./structures/Functions');
client.data = require("./structures/Data.js");
client.config = require('../config.js');
client.db = new QuickDB();
client.player = new Player(client, {
  ytdlOptions: {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25
  }
});
client.player.extractors.loadDefault();
client.player.startTime = null;
client.player.currentTrack = null;
client.player.muted = false;

const commands = loadCommands(client);
loadEvents(client);

client.login(client.config.TOKEN);

client.once(Events.ClientReady, (cient) => {
  registerCommands(client, commands)
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on("exit", () => {
	if (client.interval)
		clearInterval(client.interval);
})
