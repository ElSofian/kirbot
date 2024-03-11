const { ApplicationCommandOptionType, InteractionType } = require('discord.js');

module.exports = {
	name: 'avatar',
	description: 'Affiche l\'avatar d\'un membre.',
	options: [{
		name: 'membre',
		description: "Le membre dont vous voulez voir l'avatar.",
		type: ApplicationCommandOptionType.User,
    required: false
	}],
	run: async(client, interaction) => {
		if (interaction?.type == InteractionType.ApplicationCommand)
    {
  		const member = interaction.options.getMember('membre') || interaction.member;
  
  		const url = `${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}&ignore=true`;
      interaction.reply({ content: `Voici l'[avatar](${url}) de **${member.toString()}**.` });
    } else {
      const message = interaction;
      const member = message.mentions.members.first() || message.member;

      const url = `${member.user.displayAvatarURL({ dynamic: true, size: 1024 })}&ignore=true`;
      message.channel.send({ content: `Voici l'[avatar](${url}) de **${member.toString()}**.` });
    }
  }
}