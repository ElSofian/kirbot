const { ndown, tikdown, twitterdown } = require("nayan-media-downloader")
const { AttachmentBuilder } = require('discord.js');

module.exports = {
    name: 'messageCreate',
    run: async (client, message) => {
        let url = '';
		const match = message.content.match(/\bhttps?:\/\/\S+/);
		
		if (match)
			url = match[0];
		else
			return;
		
		if (url.includes('tiktok.com') || url.includes('x.com') || url.includes('twitter.com') || url.includes('instagram.com')) {
			try {
				const loadingMessage = await message.channel.send({ content: "Chargement..." });

				let video, content, attachment;
				if (url.includes('tiktok.com')) {
					video = await tikdown(url);
					content = video.data.video;
				} else if (url.includes('instagram.com')) {
					video = await ndown(url);
					content = video.data[0].url;
					attachment = new AttachmentBuilder().setFile(video.data[0].url).setName('video.mp4');
				} else if (url.includes('x.com') || url.includes('twitter.com')) {
					video = await twitterdown(url.replace('x.com', 'twitter.com'));
					content = video.data.HD;
				}
				if (!video || !content)
					return message.channel.send({ content: "Impossible de trouver ou publier la vidéo." });
				loadingMessage.delete();
				message.channel.send({ content: `Tiens la [video](${content}) bg`, files: attachment ? [attachment] : [] }).catch(e => {
					if (e.code == 40005)
						message.channel.send({ content: "La video est trop lourde pour etre envoyee." });
					else
						message.channel.send({ content: error.message });
				})
			} catch (error) {
				console.error(error);
			}
		}
    }
};
