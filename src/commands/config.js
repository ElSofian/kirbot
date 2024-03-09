const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');

module.exports = {
	name: 'config',
	description: 'Permet de configurer le bot.',
	admin: true,
	options: [
		{
			name: "auto-role",
			description: "Permet de configurer l'auto-role.",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: "ajouter",
					description: "Ajouter un role a l'auto-role.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [{
						name: "role",
						description: "Le role a ajouter.",
						type: ApplicationCommandOptionType.Role,
						required: true
					}]
				},
				{
					name: "supprimer",
					description: "Supprimer un role de l'auto-role.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [{
						name: "role",
						description: "Le role a supprimer.",
						type: ApplicationCommandOptionType.Role,
						required: true
					}]
				},
				{
					name: "message",
					description: "Configurer le message de l'auto-role.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [{
						name: "message",
						description: "Le message de l'auto-role.",
						type: ApplicationCommandOptionType.String,
						required: true
					}]
				},
				{
					name: "liste",
					description: "Lister les roles de l'auto-role.",
					type: ApplicationCommandOptionType.Subcommand
				}
			]
		},
		{
			name: "new_member_role",
			description: "Permet de configurer le role de bienvenue.",
			type: ApplicationCommandOptionType.Subcommand,
			options: [{
				name: "role",
				description: "Le role de bienvenue.",
				type: ApplicationCommandOptionType.Role,
				required: true
			}]
		},
		{
			name: "emojis",
			description: "Permet de configurer les emojis du bot.",
			type: ApplicationCommandOptionType.SubcommandGroup,
			options: [
				{
					name: "error",
					description: "Configurer l'emoji d'erreur.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [{
						name: "emoji",
						description: "L'emoji d'erreur.",
						type: ApplicationCommandOptionType.String,
						required: true
					}]
				},
				{
					name: "success",
					description: "Configurer l'emoji de succès.",
					type: ApplicationCommandOptionType.Subcommand,
					options: [{
						name: "emoji",
						description: "L'emoji de succès.",
						type: ApplicationCommandOptionType.String,
						required: true
					}]
				}
			]
		
		}
	],
	run: async(client, interaction, { successEmbed, errorEmbed }) => {
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		if (subcommand == "new_member_role") {
			const role = interaction.options.getRole("role");
			await client.db.set("new_member_role", role.id);
			return successEmbed(`Le role ${role} a été configuré comme role de bienvenue.`);
		}

		switch (subcommandGroup) {
			case "auto-role": {
				const role = interaction.options.getRole("role");

				switch (subcommand) {
					case "ajouter": 
						await client.db.push("auto_role.roles", role.id);
						return successEmbed(`Le role ${role} a été ajouté a l'auto-role.`);
					case "supprimer":
						await client.db.pull("auto_role.roles", role.id);
						return successEmbed(`Le role ${role} a été supprimé de l'auto-role.`);
					case "message":
						const message = interaction.options.getString("message");
						if (!message.startsWith("https://discord.com/channels"))
							return errorEmbed("Le message doit être un lien discord vers le message.");
						await client.db.set("auto_role.message", message);
						return successEmbed(`Le message de l'auto-role a été configuré.`);
					case "liste":
						const roles = await client.db.get("auto_role.roles");
						if (!roles || !roles.length)
							return errorEmbed("Aucun role n'a été configuré pour l'auto-role.");
						const embed = new EmbedBuilder()
							.setColor("#11d8b8")
							.setTitle("Auto-role")
							.setDescription(`Les roles configurés pour l'auto-role sont :\n\n${roles.map(role => `- <@&${role}>`).join("\n")}`);
						return interaction.reply({ embeds: [embed] });
				}
				break;
			}

			case "emojis": {		
				switch (subcommand) {
					case "error": {
						const emoji = interaction.options.getString("emoji");
						await client.db.set("emojis.error", emoji);
						return successEmbed(`L'emoji ${emoji} a été configuré comme emoji d'erreur.`);
					}
					case "success": {
						const emoji = interaction.options.getString("emoji");
						await client.db.set("emojis.success", emoji);
						return successEmbed(`L'emoji ${emoji} a été configuré comme emoji de succès.`);
					}
				}
			}
		}
	},	
}