const { EmbedBuilder } = require("discord.js");

module.exports = {
  name: "playerStart",
  player: true,
  run: async(client, queue, track) => {

    const interaction = queue.metadata;
    
    const embed = new EmbedBuilder()
    .setColor("Green")
    .setAuthor({ name: `Demandé par ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
    .setDescription(`**${track.title}** est entrain d'etre recite.`)
    .addFields([
      { name: "Recitateur", value: `${track.author}` },
      { name: "Durée", value: `${track.duration}` },
      { name: "Lien", value: `[Clique ici](${track.url})` }
    ])

    client.player.startTime = Date.now();
    client.player.currentTrack = track;
    await interaction.channel.send({ embeds: [embed] });
  }
}