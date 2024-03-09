const { Events } = require('discord.js'); 

module.exports = {
	name: Events.GuildMemberAdd,
	run: async(client, member) => {
		const role = await client.db.get('new_member_role');
		if (!role)
			return ;

		try {
			member.roles.add(role);
		} catch (e) {
			console.error(e);
		}
	}
}