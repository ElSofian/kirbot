const { Events, EmbedBuilder, InteractionType, InteractionCollector } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	run: async(client, interaction) => {
		if(!interaction.inGuild() || !interaction.guildId) return;

		const errorEmoji = await client.db.get("emojis.error");
		const successEmoji = await client.db.get("emojis.success");
		
		// Functions
		
		function errorEmbed(description, justEmbed = false, replyType = "reply", ephemeral = true) {
			if(!justEmbed) return interaction[replyType]({ embeds: [new EmbedBuilder().setColor("Red").setDescription(`${errorEmoji} ${description}`)], components: [], content: null, files: [], ephemeral: ephemeral }).catch(() => {});
			else return new EmbedBuilder().setColor("Red").setDescription(`${errorEmoji} ${description}`)
		}
		
		function successEmbed(description, justEmbed = false, ephemeral = false, replyType = "reply") {
			if(!justEmbed) return interaction[replyType]({ embeds: [new EmbedBuilder().setColor("Green").setDescription(`${successEmoji} ${description}`)], components: [], content: null, files: [], ephemeral: ephemeral }).catch(() => {})
			else return new EmbedBuilder().setColor("Green").setDescription(`${successEmoji} ${description}`)
		}

		// -----------------------------------------
	
		const command = interaction.client.commands[interaction.commandName];
		if (!command && interaction.type !== InteractionType.MessageComponent) {
			client.logger.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}
		if (command && command.admin && !["683269450086219777", "1123546366099066901"].includes(interaction.member.id))
			return errorEmbed("Vous n'avez pas la permission d'utiliser cette commande.");

		try {
			if (interaction.type == InteractionType.ApplicationCommandAutocomplete) await command.runAutocomplete(client, interaction, { errorEmbed, successEmbed });
			else if (interaction.type == InteractionType.ApplicationCommand) await command.run(client, interaction, { errorEmbed, successEmbed });
			else if (interaction.type == InteractionType.MessageComponent) {
				
				const customId = interaction.customId;
				if (!customId) return;

				let method;
				if (customId.startsWith("auto_role.")) method = "auto-role";

				switch (method) {
					case "auto-role": {
						const roles = await client.db.get("auto_role.roles");
						if (!roles || !roles.length) return errorEmbed("Aucun rôle n'a été configuré pour l'auto-role.", false, "followUp", true);

						const role = customId.split(".")[1];
						if (!roles.includes(role)) return errorEmbed("Ce rôle n'est pas configuré pour l'auto-role.", false, "followUp", true);

						const member = interaction.member;
						if (!member) return errorEmbed("Impossible de trouver le membre.", false, "followUp", true);

						try {
							if (member.roles.cache.has(role)) {
								await member.roles.remove(role);
								await interaction.deferUpdate();
								successEmbed("Le rôle a été retiré avec succès.", false, true, "followUp");
							} else {
								await member.roles.add(role);
								await interaction.deferUpdate();
								successEmbed("Le rôle a été ajouté avec succès.", false, true, "followUp");
							}
						} catch (error) {
							console.error(error);
							await interaction.followUp({ content: "Il y a eu une erreur lors de l'ajout du rôle.", ephemeral: true });
						}
						break;
					}
				}

			}
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while reply or deferred command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
		}
	},
};
