const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'); 

module.exports = {
	name: Events.GuildMemberAdd,
	run: async(client, member) => {
		
    const role = await client.db.get('new_member_role');
		if (!role)
			return ;

		try {
			member.roles.add(role);
      const remindersMembers = await client.db.get('reminders');
      if (!remindersMembers)
          await client.db.set("reminders", []);
      if (remindersMembers.includes(member.id)) return;
      
      const embed = new EmbedBuilder()
      .setColor("Green")
      .setTitle("Salam oualeykoum wa rahmatullah wa barakatuh")
      .setDescription(`Tu viens de rejoindre le serveur **${member.guild.name}**, qui veut dire "Terre de Paix"
      
      Ce serveur est un serveur ou en tant que musulman tu pourras t'epanouir avec les autres dans le respect et la bienveillance car je suis la pour veiller sur cela. Si tu souhaites recevoir des rappels en prive, tu peux cliquer sur le bouton **Accepter**. Ces rappels seront des invocations a dire lorsque tu quittes ton groupe d'ami ou autre (aucun spam).
      
      Bienvenue sur la Terre de Paix!`);

      const rows = new ActionRowBuilder().setComponents(
        new ButtonBuilder().setCustomId("accept").setLabel("Accepter").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("refuse").setLabel("Refuser").setStyle(ButtonStyle.Danger)
      )

      const message = await member.send({ embeds: [embed], components: [rows] });
      if (!message) return;

      const collector = await message.createMessageComponentCollector({ time: 60000 });
      if (!collector) return;

      collector.on("collect", async (i) => {
        if (i?.customId == "accept") {
          await client.db.push("reminders", member.id);
          member.send("Tu as accepté les rappels ! Baaraka الله oufik");
        } else
          member.send("Ton choix a bien ete pris en compte, je te remercie !")
        await message.edit({ components: [] });
        collector.stop();
        console.log(await client.db.get("reminders"));
      })

      collector.on("end", async (i) => {
        await message.edit({ components: [] });
      })
		} catch (e) {
			console.error(e);
		}
	}
}