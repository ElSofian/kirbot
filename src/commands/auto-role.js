const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors } = require("discord.js");

module.exports = {
	name: 'auto-role',
	description: 'Envoie le message pour l\'auto-role',
	admin: true,
	run: async(client, interaction) => {
		const roles = await client.db.get('auto_role.roles');
		if (!roles)
			return interaction.reply({ content: "Aucun rôle n'a été configuré pour l'auto-role", ephemeral: true });

		const rows = new ActionRowBuilder();
		for (let i = 0; i < roles.length; i++) {
			let getRole = interaction.guild.roles.cache.get(roles[i]);
			if (!getRole)
				continue;
			rows.addComponents(
				new ButtonBuilder().setCustomId(`auto_role.${roles[i]}`).setLabel(`${i + 1}`).setStyle(ButtonStyle.Primary)
			);
		}

		const embed = new EmbedBuilder()
		.setColor(Colors.Blurple)
		.setTitle("Auto-role")
		.setDescription(`Choisissez votre rôle parmi la liste ci-dessous :\n\n${roles.map((role, index) => `**${index + 1}** - <@&${role}>`).join("\n")}`);

		const message = await interaction.reply({ embeds: [embed], components: [rows] });
		if (!message || !message?.id)
			return;

		await client.db.set("auto_role.message", `https://discord.com/channels/${interaction.guildId}/${interaction.channelId}/${message.id}`);
	}
}