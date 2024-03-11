const { useQueue, QueueRepeatMode } = require('discord-player');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'queue',
  description: 'Affiche la queue de recitation du Qur\'an',
  run: async(client, interaction, { errorEmbed, successEmbed }) => {
    const queue = useQueue(interaction.guild.id);
    if (!queue || !queue.isPlaying()) return errorEmbed("Il n'y a pas de Qur'an en cours de recitation.");

    const embeds = (index) => {
      const queue = useQueue(interaction.guild.id);
      const currentTrackEmbed = new EmbedBuilder()
      .setColor("Green")
      .setThumbnail(queue.currentTrack.thumbnail)
      .setTitle(`Recitation actuelle`)
      .addFields([
        { name: `Recitateur`, value: queue.currentTrack.author },
        { name: `Sourate`, value: queue.currentTrack.title },
        { name: `Durée`, value: queue.currentTrack.duration },
        { name: `Lien`, value: `[Clique ici](${queue.currentTrack.url})` }
      ]);

      const tracks = [currentTrackEmbed];
      if (index == 0)
          return tracks[0];
      if (!queue || !queue?.tracks)
          return index >= 0 ? index == 0 ? tracks?.[index] : null : tracks;
      for (let i = 0; i < queue.tracks.data.length; i++) {
        const embed = new EmbedBuilder()
        .setColor("Green")
        .setThumbnail(queue.tracks.data[i].thumbnail)
        .setTitle(`Recitation n\*${i + 1}`)
        .addFields([
          { name: `Recitateur`, value: queue.tracks.data[i].author },
          { name: `Sourate`, value: queue.tracks.data[i].title },
          { name: `Durée`, value: queue.tracks.data[i].duration },
          { name: `Lien`, value: `[Clique ici](${queue.tracks.data[i].url})` }
        ])
        tracks.push(embed);
      }
      return index >= 0 ? tracks?.[index] : tracks;
    }

    const rows = (i) => {
      const queue = useQueue(interaction.guild.id);
      const firstLine = new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('previous').setEmoji('<:leftarrow:1216534364104691722>').setStyle(ButtonStyle.Primary).setDisabled(i == 0),
        (queue?.node.isPaused()
        ? new ButtonBuilder().setCustomId("resume").setEmoji("<:resume:1216561515575115777>").setStyle(ButtonStyle.Secondary)
        : new ButtonBuilder().setCustomId("pause").setEmoji("<:pause:1216532117538734113>").setStyle(ButtonStyle.Secondary)),
        (client.player.muted
         ? new ButtonBuilder().setCustomId('unmute').setEmoji('<:unmute:1216559774498422794>').setStyle(ButtonStyle.Secondary)
         : new ButtonBuilder().setCustomId('mute').setEmoji('<:mute:1216541877822816368>').setStyle(ButtonStyle.Secondary)),
        new ButtonBuilder().setCustomId('next').setEmoji('<:rightarrow:1216532118914596884>').setStyle(ButtonStyle.Primary).setDisabled(i == embeds().length - 1));
      
      const secondLine = new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId('play').setEmoji('<:play:1216532116293287976>').setStyle(ButtonStyle.Success).setDisabled(i == 0),
        new ButtonBuilder().setCustomId('loop').setEmoji('<:loop:1216541447038308452>').setStyle(ButtonStyle.Secondary).setDisabled(i != 0).setDisabled(queue?.repeatMode == QueueRepeatMode.TRACK),
        new ButtonBuilder().setCustomId("volume").setEmoji("<:volume:1216532180298371283>").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("delete").setEmoji("<:delete:1216531303680446595>").setStyle(ButtonStyle.Danger)
      )

      return [firstLine, secondLine];
    }

    const message = await interaction.reply({ embeds: [embeds(0)], components: rows(0) });
    if (!message) return;

    const collector = await message.createMessageComponentCollector({ time: 180000, filter: (i) => i.user.id == interaction.user.id });
    if (!collector) return;

    let index = 0;
    collector.on("collect", async (i) => {
      const queue = useQueue(interaction.guild.id);
      switch (i.customId) {
        case "previous": index--; break;
        case "next": index++; break;
        case "loop": queue.setRepeatMode(QueueRepeatMode.TRACK); break;
        case "mute": queue.setSelfMute(true); client.player.muted = true; break;
        case "unmute": queue.setSelfMute(false); client.player.muted = false; break;
        case "pause": queue.node.pause(); break;
        case "resume": queue.node.resume(); break;
        case "play": {
          queue.node.skipTo(index - 1);
          index = 0;
          return setTimeout(() => {
            i.editReply({ embeds: [embeds(index)], components: rows(index) });
          }, 2000);
        }
        case "delete": {
          if (index == 0)
          {
            if (queue.tracks.data[0])
            {
              i.deferUpdate();
              queue.node.skipTo(index);
              index = 0;
              return setTimeout(() => {
                i.editReply({ embeds: [embeds(index)], components: rows(index) });
              }, 2000);
            } else {
              queue.node.stop();
              queue.delete();
            }
          }
          if (!queue?.tracks?.data?.length)
          {
            queue.node.stop();
            return collector.stop();
          }
          queue.node.remove(index - 1);
          index--;
          break;
        }
        case "volume": {
          const message = await i.channel.send({ embeds: [new EmbedBuilder().setColor("#ce822b").setDescription("Veuillez entrer un nombre entre 0 et 200 compris pour changer le volume ou envoyez \"cancel\" pour annuler.")], ephemeral: true });
          if (!message) return;

          const messageCollector = await message.channel.createMessageCollector({ time: 45000, filter: (ii) => ii.author.id == i.user.id });
          if (!messageCollector) return;

          messageCollector.on("collect", async (ii) => {
            ii.delete();
            if (ii.content.toLowerCase() == "cancel")
              return messageCollector.stop();
            else if (parseInt(ii.content) >= 0 && parseInt(ii.content) <= 200)
              queue.node.setVolume(parseInt(ii.content));
            ii.channel.send({ embeds: [successEmbed(`Le volume a ete mis sur \`${ii.content}%\`.`, true)] });
            messageCollector.stop();
          });

          messageCollector.on("end", () => {
            message.delete().catch(() => {});
          })
          break;
        }

      }
      i.update({ embeds: [embeds(index)], components: rows(index) });
    });

    collector.on("end", async () => {
      await interaction.editReply({ components: [] }).catch(() => {});
    })
  }
}