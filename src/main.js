const { Client, GatewayIntentBits, Events } = require('discord.js');
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
      GatewayIntentBits.GuildMembers
	] 
});
client.logger = new (require('./structures/Logger'))();
client.db = new QuickDB();

const commands = loadCommands(client);
loadEvents(client);

client.login(process.env.TOKEN);
client.once(Events.ClientReady, (client)=>{
	registerCommands(client, commands);
})

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
	console.error('Unhandled promise rejection:', error);
});