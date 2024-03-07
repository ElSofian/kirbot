const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	run: (client) => {
		client.logger.info("Ready!");

		client.user.setPresence({
			activities: [{ name: `Ready or Not`, type: ActivityType.Playing }],
		});
	},
};
