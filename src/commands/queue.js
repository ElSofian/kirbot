const { useQueue, QueueRepeatMode } = require('discord-player');
const Pagination = require('../structures/Pagination');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Affiche la queue de recitation du Qur\'an',
  run: async(client, interaction, { errorEmbed }) => {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return errorEmbed("Il n'y a pas de Qur'an en cours de recitation.");
    if (!queue.history.nextTrack) return errorEmbed("Il n'y a pas de recitation apres celle en cours.");

    const embeds = [];
    for (let i = 0; i < queue.tracks.data.length; i++) {
      const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle(`Recitation n\*${i + 1}`)
      .addFields([
        // { name: `Jouee dans`, value: "" },
        { name: `Recitateur`, value: queue.tracks.data[i].author },
        { name: `Sourate`, value: queue.tracks.data[i].title },
        { name: `Durée`, value: queue.tracks.data[i].duration },
        { name: `Lien`, value: `[Clique ici](${queue.tracks.data[i].url})` }
      ])
      embeds.push(embed);
    }

    const pagination = new Pagination(embeds, (embed, i) =>
      embed.setAuthor({ name: `Demandé par ${queue.tracks.data[i].requestedBy.username}`, iconURL: queue.tracks.data[i].requestedBy.displayAvatarURL() })
        .setDescription(`Loop: ${queue.repeatMode == QueueRepeatMode.QUEUE ? "Queue" : queue.repeatMode == QueueRepeatMode.TRACK ? "Track" : "Off"}`)
    )
    await pagination.reply(interaction);
    
  }
}