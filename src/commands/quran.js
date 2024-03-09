const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, ApplicationCommand, time } = require('discord.js');

const timeUntilTrackPlay = (client, track) => {
  const elapsedSeconds = Math.floor((Date.now() - client.player.startTime) / 1000);
  const trackQueue = track?.queue?.tracks?.data;
  let totalTimeUntilPlay = 0, minutesUntilPlay = 0, secondsUntilPlay = 0;

  if (trackQueue)
  {
    for (let i = 0; i < trackQueue.length; i++)
    {
      if (trackQueue[i].id == track.id) continue;
      const trackDuration = trackQueue[i].duration;
      const durationSplit = trackDuration.split(':');
      const trackMinutes = parseInt(durationSplit[0]);
      const trackSeconds = parseInt(durationSplit[1]);
      totalTimeUntilPlay += (trackMinutes * 60000 + trackSeconds * 1000);
    }
    totalTimeUntilPlay += (client.player.currentTrack.__metadata.source.duration - elapsedSeconds);
  }

  minutesUntilPlay = Math.floor(totalTimeUntilPlay / 60000); // Conversion des millisecondes en minutes
  secondsUntilPlay = Math.floor((totalTimeUntilPlay % 60000) / 1000); // Conversion des millisecondes restantes en secondes
  return `${minutesUntilPlay} minutes et ${secondsUntilPlay} secondes`;
}

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
	run: async(client, interaction, { errorEmbed }) => {
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
          leaveOnStop: true,
          leaveOnEmpty: true,
          leaveOnEnd: true,
          
        }
      });

      const embed = new EmbedBuilder()
        .setColor("Green")
        .setAuthor({ name: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(`**${track.title}** ajouté à la file d'attente.`)
        .addFields([
          // { name: "Lecture dans", value: timeUntilTrackPlay(client, track) },
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