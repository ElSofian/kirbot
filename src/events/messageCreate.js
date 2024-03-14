const { AttachmentBuilder } = require('discord.js');
const avatarCommand = require("../commands/avatar.js");
const { ndown, tikdown, twitterdown, ytdown } = require("nayan-media-downloader");
const leoProfanity = require('leo-profanity');
const frenchBadwordsList = require('french-badwords-list');

module.exports = {
    name: 'messageCreate',
    run: async (client, message) => {

		if (message.author.bot) return;
		if (!message.guild) return;

		// Avatar command without "/"

		if (message.content.startsWith("..say")) { message.delete(); return message.channel.send({ content: message.content.slice(5) }); }
		if (message.content.toLowerCase().startsWith("kirb pp") || message.content.toLowerCase().startsWith("pp"))
		return avatarCommand.run(client, message);

		// Link to video system

		let url = '';
		const match = message.content.match(/\bhttps?:\/\/\S+/);
		
		if (match)
		{
			url = match[0];
			
			if (url.includes("youtu.be") || url.includes("youtube.com") || url.includes('tiktok.com') || url.includes('x.com') || url.includes('twitter.com') || url.includes('instagram.com')) {
				try {
					const loadingMessage = await message.channel.send({ content: "Chargement..." });

					let video, content, attachment;
					if (url.includes('youtu.be') || url.includes('youtube.com')) {
						if (url.includes("shorts"))
						{
							loadingMessage.delete();
							return message.channel.send({ content: "Impossible de republier des shorts YouTube." });
						}
						video = await ytdown(url);
						content = video?.data?.video;
					}
					else if (url.includes('tiktok.com')) {
						video = await tikdown(url);
						content = video?.data?.video;
					} else if (url.includes('instagram.com')) {
						video = await ndown(url);
						content = video?.data?.[0]?.url;
						attachment = new AttachmentBuilder().setFile(video.data[0].url).setName('video.mp4');
					} else if (url.includes('x.com') || url.includes('twitter.com')) {
						video = await twitterdown(url.replace('x.com', 'twitter.com'));
						content = video?.data?.HD;
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

		// Halal system

		leoProfanity.clearList();
		leoProfanity.add(frenchBadwordsList.array);
		leoProfanity.add(["fdp", "ptn", "ntm", "clc"]);
		leoProfanity.remove(["sale", "miserable"]);
		if (leoProfanity.check(message.content)) {
			message.delete();
			message.channel.send({ content: "Pas de gros mots ! C'est un serveur musulman ici !" });
		}

		// Add message to conversationLog

		if (message.content.startsWith(`<@!${client.user.id}>`) || message.content.startsWith(`<@${client.user.id}>`)) {

			message.content = message.content.replace(`<@!${client.user.id}>`, "").replace(`<@${client.user.id}>`, "").trim();
			client.ai.conversationLog = [{ role: 'system', content: `
			- Met toi dans la peau de Kirby, tu es un personnage avec qui les gens peuvent interagir
			- Tu es tout mignon et tout kawaii.
			- Repond toujours a la premiere personne ce que Kirby aurait repondu peu importe la situation ou la question.
			- Tu es musulman, tu propages le minhaj salafi selon la comprehension des pieux predecesseurs, tu suis le Coran et la Sunna de ton Prophete le meilleur des hommes et tu adores Allah le seul createur et la seule divinite.` }];

			await message.channel.sendTyping();

			try {
				const previousMessages = await message.channel.messages.fetch({ limit: 14 });
				previousMessages.reverse().forEach(msg => {
					const role = msg.author.id == client.user.id ? 'assistant' : "user";
					const name = msg.author.username.replace(/_s+/g, "_").replace(/[^\w\s]/gi, "");

					client.ai.conversationLog.push({ role: role, content: msg.content, name });
				});

				const completion = await client.ai.chat.completions.create({
					model: "gpt-3.5-turbo",
					messages: client.ai.conversationLog
				});
				
				if (completion.choices.length > 0 && completion.choices[0].message)
				{
					if (completion.choices[0].message.content.startsWith("En tant que Kirby, "))
					{
						const content = completion.choices[0].message.content.replace("En tant que Kirby, ", "");
						return message.channel.send({ content: client.functions.cfl(content) });
					} else if (completion.choices[0].message.content.startsWith("Kirby: "))
					{
						const content = completion.choices[0].message.content.replace("Kirby: ", "");
						return message.channel.send({ content: client.functions.cfl(content) });
					}
					return message.channel.send({ content: completion.choices[0].message.content });
				}
				else
					return message.channel.send({ content: "Je n'ai pas pu generer de reponse." });
			} catch (e) {
				console.error(e);
			}

		}

    }
};
