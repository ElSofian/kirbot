const { ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	name: 'avatar',
	description: 'Affiche l\'avatar d\'un membre.',
	options: [{
		name: 'membre',
		description: "Le membre dont vous voulez voir l'avatar.",
		type: ApplicationCommandOptionType.User
	}],
	run: async(client, interaction, { errorEmbed }) => {
		const member = interaction.options.getMember('membre') || interaction.member;
		if (!member)
			return errorEmbed("Je n'ai pas trouvé le membre.");

		const url = `${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}&ignore=true`;
		interaction.reply({ content: `Voici l'[avatar](${url}) de **${member.toString()}**.` });
	}
}