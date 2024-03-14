const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
	name: 'test',
	description: 'Commande pour effectuer des tests',
	admin: true,
	run: async(client, interaction, { errorEmbed }) => {
		interaction.reply({ content: "OK!" });
	}
}