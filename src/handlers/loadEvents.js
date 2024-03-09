const fs = require('node:fs')
const path = require('node:path')
const events_path = path.resolve(__dirname, '..', 'events');

module.exports = (client) => {
	const eventFiles = fs.readdirSync(events_path).filter(file => file.endsWith('.js'));

	let i = 0;
	for (const file of eventFiles) {
		const filePath = path.join(events_path, file);
		const event = require(filePath);

    if (event.player)
        client.player.events.on(event.name, (...args) => event.run(client, ...args));
		else if (event.once)
			client.once(event.name, (...args) => event.run(client, ...args));
		else
			client.on(event.name, (...args) => event.run(client, ...args));
		i++;
	}
	client.logger.success(`${i} events loaded!`);
}