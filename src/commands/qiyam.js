const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed } = require('discord.js');
const axios = require('axios');

module.exports = {
	name: 'qiyam',
	description: 'Affiche les tiers de la nuit.',
	options: [{
		name: "ville",
		description: "La ville pour laquelle vous souhaitez afficher les tiers de la nuit.",
		type: ApplicationCommandOptionType.String,
		required: false
	}],
	run: async(client, interaction, { errorEmbed }) => {
		let city = interaction.options.getString("ville");
		if (!city) {
			const cities = await client.db.get("prayer_alerts");
			Object.entries(cities).forEach(([name, ids]) => {
				if (ids.includes(interaction.member.id)) city = name;
			});
		}
		if (!city) return errorEmbed("Tu n'as pas précisé de ville et tu n'as pas de ville enregistrée.");

		const today = new Date();
		const year = today.getFullYear();
		const month = today.getMonth() + 1;
		const hours = today.getHours();

		try {
			const response = await axios.get(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}`, {
				params: {
					city: city,
					country: 'France',
					method: 12
				}
			});

			const prayerTimes = response?.data?.data[0]?.timings;
			if (!prayerTimes) return errorEmbed("Les horaires concernant cette ville ne sont pas disponibles.");

			let maghribHour = parseInt(prayerTimes.Maghrib.split(':')[0]);
			let firstthirdHour = parseInt(prayerTimes.Firstthird.split(':')[0]);
			let lastthirdHour = parseInt(prayerTimes.Lastthird.split(':')[0]);
			let fajrHour = parseInt(prayerTimes.Fajr.split(':')[0]);

			let currentHour = hours;
			if (currentHour < maghribHour) {
				currentHour += 24;
			}

			maghribHour += (maghribHour < fajrHour) ? 24 : 0;
			firstthirdHour += (firstthirdHour < fajrHour) ? 24 : 0;
			lastthirdHour += (lastthirdHour < fajrHour) ? 24 : 0;
			fajrHour += (fajrHour < maghribHour) ? 24 : 0;

			const embed = new EmbedBuilder()
				.setColor("Green")
				.setDescription(`Voici les tiers de la nuit à **${client.functions.cfl(city)}**:`)
				.addFields([
					{ name: "Premier tiers" + (currentHour >= maghribHour && currentHour < firstthirdHour ? " - Nous y sommes" : ""), value: `${prayerTimes.Maghrib} à ${prayerTimes.Firstthird}` },
					{ name: "Deuxième tiers" + (currentHour >= firstthirdHour && currentHour < lastthirdHour ? " - Nous y sommes" : ""), value: `${prayerTimes.Firstthird} à ${prayerTimes.Lastthird}` },
					{ name: "Dernier tiers" + (currentHour >= lastthirdHour && currentHour < fajrHour ? " - Nous y sommes" : ""), value: `${prayerTimes.Lastthird} à ${prayerTimes.Fajr}` }
				]);

			interaction.reply({ embeds: [embed] });

		} catch (e) {
			console.error(e);
		}

	}
}
