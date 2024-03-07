module.exports = {
	name: 'ping',
	description: 'Replies with Pong!',
	run: async(client, interaction) => {
		interaction.reply(`Latency \`${Date.now() - interaction.createdTimestamp}ms\`\nAPI \`${Math.round(interaction.client.ws.ping)}ms\``);
	}
}