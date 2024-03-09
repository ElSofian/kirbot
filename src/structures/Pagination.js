const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

const buttonStart = new ButtonBuilder()
.setCustomId("start")
.setEmoji("⏪")
.setStyle(ButtonStyle.Primary);
const buttonLeft = new ButtonBuilder()
.setCustomId("left")
.setEmoji("⬅")
.setStyle(ButtonStyle.Secondary);
const buttonRight = new ButtonBuilder()
.setCustomId("right")
.setEmoji("➡")
.setStyle(ButtonStyle.Secondary);
const buttonEnd = new ButtonBuilder()
.setCustomId("end")
.setEmoji("⏩")
.setStyle(ButtonStyle.Primary);

module.exports = class Pagination {
  constructor(embeds, embedEditOptions) {
    this.embeds = embeds;
    this.embedEditOptions = embedEditOptions ?? (e => e);
  }

  async reply(interaction) {
    let i = 0;
    await interaction.reply({
      embeds: [this.embedEditOptions(this.embeds[i], i)],
      components: [new ActionRowBuilder().setComponents(
          buttonStart.setDisabled(this.embeds.length == 1),
          buttonLeft.setDisabled(this.embeds.length == 1),
          buttonRight.setDisabled(this.embeds.length == 1),
          buttonEnd.setDisabled(this.embeds.length == 1),
      )]
    })

    const collector = (await interaction.fetchReply()).createMessageComponentCollector({ time: 120000, filter: (i) => i.user.id == interaction.user.id })
    if (!collector) return;

    collector.on("collect", async (button) => {
      switch (button.customId) {
        case "start": i = 0; break;
        case "end": i = this.embeds.length - 1; break;
        case "left": {
          if (--i == -1) i = this.embeds.length - 1;
          break;
        }
        case "right": {
          if (++i == this.embeds.length) i = 0;
          break;
        }
      }

      await interaction.editReply({ embeds: [this.embedEditOptions(this.embeds[i], i)] });
      await button.deferUpdate();
    })

    collector.on("end", async () => {
      await interaction.editReply({
        embeds: [this.embedEditOptions(this.embeds[i], i)],
        components: []
      })
    })
  }
}