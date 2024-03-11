const { EmbedBuilder, ApplicationCommandOptionType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
    name: 'alerte-priere',
    description: 'Permet d\'etre averti lorsque l\'horaire de la priere de votre ville entrera',
    options: [{
        name: 'ville',
        description: 'La ville ou vous habitez',
        type: ApplicationCommandOptionType.String,
        required: true
    }],
    run: async (client, interaction, { errorEmbed, successEmbed }) => {
      const city = interaction.options.getString('ville');
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // Months are zero-indexed, so we add 1

      try {
        const response = await axios.get(`http://api.aladhan.com/v1/calendarByCity/${year}/${month}`, {
            params: {
                city: city,
                country: 'France', // Assuming you're working with French cities, change accordingly
                method: 12 // Adjust the method as needed, here 2 stands for Umm Al-Qura University, Makkah
            }
        });

        const times = response?.data?.data; // Assuming the times data is structured inside 'data' object
        if (!times) return errorEmbed("Les horaires concernant cette ville ne sont pas disponibles.");

          // Further processing or sending the prayer times to Discord can be done here
		    if (!client.db.get(`prayer_alerts.${city.toLowerCase()}`))
            await client.db.set(`prayer_alerts.${city.toLowerCase()}`, [interaction.member.id]);
			  else
            await client.db.push(`prayer_alerts.${city.toLowerCase()}`, interaction.member.id);
			  successEmbed("Vous allez etre alerte des que l'heure de la prochaine priere arrivera insha’‎الله !");

        } catch (error) {
            console.error('Error fetching prayer times:', error);
            // Handle errors, send error message, etc.
        }
    }
}
