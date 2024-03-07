const fs = require('node:fs')
const path = require('node:path')

const commands_path = path.resolve(__dirname, '..', 'commands');

module.exports = (client) => {
	const commandFiles = fs.readdirSync(commands_path).filter(file => file.endsWith('.js'));

	let stack = [];
	client.commands = {};

	for (const file of commandFiles) {
		const filePath = path.join(commands_path, file);
		const command = require(filePath);


		if ('name' in command && 'run' in command) {
			client.commands[command.name] = command;
			stack.push(command);
		} else {
			console.error(`The command at ${filePath} is missing a required "name" or "run" property.`);
		}
	}
	client.logger.success(`${stack.length} commands loaded!`);
	return (stack);
}