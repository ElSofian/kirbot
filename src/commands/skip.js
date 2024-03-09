const { useQueue, QueueRepeatMode } = require('discord-player');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'skip',
  description: 'Avance a la prochaine recitation.',
  run: async(client, interaction, { errorEmbed, successEmbed }) => {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return errorEmbed("Il n'y a pas de Qur'an en cours de recitation.");
    if (!queue.history.nextTrack) return errorEmbed("Il n'y a pas de recitation apres celle en cours.");

    const voiceChannelMember = interaction.member.voice.channel;
    if (!voiceChannelMember) return errorEmbed("Tu n'es pas dans un salon vocal.");
    const voiceChannelClient = (await interaction.guild.members.fetchMe()).voice.channel;
    if (voiceChannelClient && voiceChannelClient.id != voiceChannelMember.id) return errorEmbed("Tu n'es pas dans le meme salon vocal que moi!");

  queue.node.skip();
  successEmbed("La recitation suivante a ete lancee !");

  }
}