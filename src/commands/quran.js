const { EmbedBuilder, ApplicationCommandOptionType } = require('discord.js');
const { useQueue } = require('discord-player');

module.exports = {
	name: 'quran',
	description: 'Permet de mettre du Qur\'an dans un salon vocal',
	options: [
    {
      name: "sourate",
      description: "La sourate du Qur'an que vous souhaitez ecouter",
      type: ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true
    },
    {
      name: "recitateur",
      description: "Le nom du recitateur du Qur'an que vous souhaitez ecouter",
      type: ApplicationCommandOptionType.String,
      required: false,
      autocomplete: true
    }
  ],
	run: async(client, interaction, { errorEmbed, successEmbed }) => {
    let surah = "sourate" + interaction.options.getString('sourate');
    const reciter = interaction.options.getString('recitateur');
    if (reciter) surah += ` ${reciter}`;

    await interaction.deferReply();

    const voiceChannelMember = interaction.member.voice.channel;
    if (!voiceChannelMember) return errorEmbed("Tu n'es pas dans un salon vocal!", false, "editReply", true);
    
    const voiceChannelClient = (await interaction.guild.members.fetchMe()).voice.channel;
    if (voiceChannelClient && voiceChannelClient.id !== voiceChannelMember.id) return errorEmbed("Tu n'es pas dans le même salon vocal que moi!", false, "editReply", true);

    try {
      const { track } = await client.player.play(voiceChannelMember, surah, {
        requestedBy: interaction.user,
        nodeOptions: {
          metadata: interaction,
          volume: 70,
          selfDeaf: true,
          leaveOnEmpty: true,
          leaveOnEnd: true,
        }
      });

      const queue = useQueue(interaction.guildId);
      if (!queue.isEmpty())
        return successEmbed(`**${track.title}** ajouté à la file d'attente!`, false, false, "editReply");
      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`**${track.title}** est entrain d'etre recitee.`)
        .addFields([
          { name: "Recitateur", value: `${track.author}` },
          { name: "Durée", value: `${track.duration}` },
          { name: "Lien", value: `[Clique ici](${track.url})` }
        ])
  
      interaction.editReply({ embeds: [embed] });
    } catch (e) {
      console.error(e);
      interaction.editReply({ content: `Une erreur s'est produite lors du lancement de la sourate.` })
    }
  },
  runAutocomplete: async(client, interaction) => {
    const focusedOption = interaction.options.getFocused(true);

    const response = focusedOption.name == "sourate" ? client.data.surahs : client.data.reciters;
    const filtered = [];
    if(focusedOption.value !== "") {
        const filtredArray = [];
        filtredArray.push(...response.filter(r => r.name.toLowerCase() == focusedOption.value.toLowerCase()));
        filtredArray.push(...response.filter(r => r.name.toLowerCase().startsWith(focusedOption.value.toLowerCase())));
        filtredArray.push(...response.filter(r => r.name.toLowerCase().includes(focusedOption.value.toLowerCase())));

        const unique = [...new Set(filtredArray)];
        filtered.push(...unique);
    } else {
        filtered.push(...response);
    }

    interaction.respond(filtered.slice(0, 25).map(e => ({ name: e.name, value: e.name }))).catch(() => {})
    
  }
}