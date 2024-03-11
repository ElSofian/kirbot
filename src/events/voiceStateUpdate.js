const { Events, EmbedBuilder } = require('discord.js'); 

module.exports = {
	name: Events.VoiceStateUpdate,
	run: async (client, oldState, newState) => {
		if (oldState.member.user.bot) return;

    const remindersMembers = await client.db.get("reminders");
    if (!remindersMembers)
        await client.db.set("reminders", []);
    if (!remindersMembers.includes(oldState.member.id)) return;
    
		if (newState.channelId === null || typeof newState.channelId == 'undefined')
		{
			const channelId = "1214646275358855301";
			const channel = oldState.guild.channels.cache.get(channelId);
			if (!channel) return;

			const embed = new EmbedBuilder()
				.setColor("Green")
				.setDescription(`${oldState.member}, tu viens de quitter un salon vocal où tu as sûrement beaucoup parlé alors n'oublie pas l'invocation quand tu quittes tes compagnons:
				
				D'après Abou Houreira (qu'Allah l'agrée), le Prophète (que la prière d'Allah et Son salut soient sur lui) a dit: « Celui qui s'assoit dans une assemblée dans laquelle il a dit beaucoup de paroles futiles et dit avant de se lever de cette assemblée : -Gloire et louange à toi ô Allah, j'atteste qu'aucune autre divinité ne mérite d'être adorée en dehors de toi, je te demande pardon et me repens à toi- sans qu'Allah ne lui expie ce qu'il a dit dans cette assemblée ».`)
				.addFields([
					{ name: "En phonétique", value: "Sobhanaka Allahoumma Wa Bihamdik Ach Hadou An La Ilaha Illa Ant Astaghfirouka Wa Atoubou Ilaik" },
					{ name: "En arabe", value: "سُبْحَانَكَ اللَّهُمَّ وَ بِحَمْدِكَ أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ أَسْتَغْفِرُكَ وَ أَتُوبُ إِلَيكَ" },
				])
				.setFooter({ text: `(Rapporté par Tirmidhi dans ses Sounan n°3433 qui l'a authentifié et il a également été authentifié par Cheikh Albani dans sa correction de Sounan Tirmidhi)` })

			oldState.member.user.send({ embeds: [embed] }).catch(() => {
				channel.send({ content: `||<@${oldState.member.id}>||`, embeds: [embed] });
			})
		}
	}
}