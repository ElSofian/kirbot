const { EmbedBuilder } = require("discord.js");
const { QueueRepeatMode } = require("discord-player");

module.exports = {
  name: "playerStart",
  player: true,
  run: async(client, queue, track) => {

    const interaction = queue.metadata;
    
    client.player.startTime = Date.now();
    client.player.currentTrack = track;

    if (queue.isEmpty() || queue.repeatMode == QueueRepeatMode.TRACK) return;
    
    const embed = new EmbedBuilder()
    .setColor("Green")
    .setThumbnail(track.thumbnail)
    .setAuthor({ name: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
    .setDescription(`**${track.title}** est entrain d'etre recite.`)
    .addFields([
      { name: "Recitateur", value: `${track.author}` },
      { name: "Durée", value: `${track.duration}` },
      { name: "Lien", value: `[Clique ici](${track.url})` }
    ])

    await interaction.channel.send({ embeds: [embed] });
  }
}