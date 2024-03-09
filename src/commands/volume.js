const { useQueue, QueueRepeatMode } = require('discord-player');
const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'volume',
  description: 'Permet de gerer le volume de la recitation.',
  options: [{
    name: "volume",
    description: "Le volume que vous voulez mettre (entre 0 et 100).",
    type: ApplicationCommandOptionType.Integer,
    minValue: 0,
    maxValue: 500,
    required: false
  }],
  run: async(client, interaction, { errorEmbed, successEmbed }) => {
    const volume = interaction.options.getInteger('volume');
  
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return errorEmbed("Il n'y a pas de Qur'an en cours de recitation.");

    if (!volume) return successEmbed(`The volume is set to \`${queue.node.volume}%\``);

    if (volume < 0 || volume > 500) return errorEmbed("Le volume doit etre entre 0% et 500%.");
    
    const voiceChannelMember = interaction.member.voice.channel;
    if (!voiceChannelMember) return errorEmbed("Tu n'es pas dans un salon vocal.");
    const voiceChannelClient = (await interaction.guild.members.fetchMe()).voice.channel;
    if (voiceChannelClient && voiceChannelClient.id != voiceChannelMember.id) return errorEmbed("Tu n'es pas dans le meme salon vocal que moi!");

  if (volume == queue.node.volume) return errorEmbed(`Le volume est deja a ${volume}!`);
  
  queue.node.setVolume(volume);
  successEmbed(`Le volume a ete mis sur ${volume}% !`);

  }
}