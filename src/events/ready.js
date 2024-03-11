const { Events, ActivityType } = require('discord.js');
const axios = require('axios');
const moment = require('moment');

module.exports = {
	name: Events.ClientReady,
	once: true,
	run: async(client) => {
		client.logger.info("Ready!");

		client.user.setPresence({
			activities: [{ name: `Among Us Avec Bilal`, type: ActivityType.Playing }],
		});

		// Prayer alert system
		
		// Définir un ensemble pour stocker les heures de prière déjà vérifiées
		const checkedPrayers = new Set();

		// Function to handle prayer alert system
		const handlePrayerAlerts = async () => {
			const cities = await client.db.get("prayer_alerts");
			const today = new Date();
			let year = today.getFullYear();
			let month = today.getMonth() + 1;
			let day = today.getDate();

			// Ajouter un décalage horaire à l'heure actuelle
			const offsetHours = 1; // Modifier en fonction de votre décalage horaire
			const currentTime = moment().add(offsetHours, 'hours');
			// const currentTime = moment()   // <- QUAND ON CODE EN LOCAL ET NON SUR L'HEBERGEUR

			const channelId = "1214899328607592469";
			for (const city in cities) {
				const response = await axios.get(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}`, {
					params: {
						city: city,
						country: 'France',
						method: 12
					}
				});

				const times = response.data.data;
				const todayTimes = times[day - 1];
				const prayerTimes = todayTimes.timings;

				for (const prayer of Object.keys(prayerTimes)) {
					if (["Sunrise", "Sunset", "Imsak", "Midnight", "Firstthird", "Lastthird"].includes(prayer)) continue;
					const prayerTime = moment(`${day} ${month} ${year} ${prayerTimes[prayer]}`, "DD MM YYYY HH:mm")
					if (prayerTime.isAfter(currentTime)) {
						const prayerIdentifier = `${city}-${prayer}-${day}-${month}-${year}`;
						if (!checkedPrayers.has(prayerIdentifier)) {
							checkedPrayers.add(prayerIdentifier);
							const timeLeft = moment.duration(prayerTime.diff(currentTime));
							const channel = client.channels.cache.get(channelId);
							// client.logger.info(`C'est l'heure de la priere de ${prayer} a ${client.functions.cfl(city)}: ${timeLeft.humanize()}`);
							setTimeout(async() => {
								const members = await client.db.get(`prayer_alerts.${city.toLowerCase()}`);
								if (channel)
								{
									const inVocalMembers = members.filter(m => channel.guild.members.cache.get(m).voice.channel);
									if (inVocalMembers.length > 0)
                    channel.send({ content: `${inVocalMembers.map(m => `<@${m}>`).join(" ")}, il est temps de prier ${prayer} à ${client.functions.cfl(city)} !` });
								}
							}, timeLeft.asMilliseconds());
						}
					}
				}
			}

			// Check if it's the last day of the month, if so, update year and month
			if (day === new Date(year, month, 0).getDate()) {
				month = month % 12 + 1;
				day = 1;
				if (month === 1) {
					year++;
				}
			} else {
				day++;
			}
		};

		// Run the prayer alert system initially
		handlePrayerAlerts();

		// Set an interval to run the prayer alert system every hour
		const interval = setInterval(handlePrayerAlerts, 60 * 60 * 1000); // 1 hour in milliseconds

		const clearCheckedPrayers = () => {
			checkedPrayers.clear();
		}
		// Calculate milliseconds until midnight
		const now = moment();
		const midnight = moment().endOf('day');
		const msUntilMidnight = midnight.diff(now);

		// Set timeout to clear checkedPrayers at midnight
		setTimeout(clearCheckedPrayers, msUntilMidnight);

		// Make sure to clear the interval when your bot is being stopped
		// For example, in your client's 'once' event 'ClientShutdown', you can add:
		// clearInterval(interval);

		client.interval = interval;
		// ------------------------------

	}
};
