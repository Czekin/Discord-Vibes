const express = require('express');
const port = process.env.PORT || 1605;

const app = express();
app.listen(port, () => {
    console.log('Server is running...');
});
app.get('/', (req, res) => {
    res.send('Bot running i think...');
});

//==========
// Bot
//==========

const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const messages = require('./utils/messages');

const vibeURLs = ['https://www.youtube.com/watch?v=25jHkLvTRtA', 'https://www.youtube.com/watch?v=7NOSDKb0HlU'];

const bot = new Discord.Client({
    disableMentions: 'everyone',
    partials: ['CHANNEL', 'GUILD_MEMBER', 'MESSAGE', 'REACTION', 'USER']
});
bot.prefix = '.';
bot.playing = false;
bot.streamType = 'none';

bot.on('ready', () => {
    console.log('ready');
    bot.user.setActivity('🍹 | Discord Lofi Vibes', {type: 'LISTENING'});
});

bot.on('message', async (msg) => {
    if(msg.author.bot || msg.channel.type == 'dm') return;

    if(!msg.content.startsWith(bot.prefix)) return;
    const args = msg.content.slice(bot.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const radio = (url) => {
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(url[1], {quality: 'highestaudio'}), {volume: 0.1});
            msg.channel.send(`<a:Music:601415495517863948> | Starting Lofi Vibes Radio in **${msg.member.voice.channel.name}** voice channel.`);
            bot.playing = true;
            bot.streamType = 'radio';

            dispatcher.on('finish', async () => {
                msg.channel.send("Stream has ended.");
                bot.playing = false;
                bot.streamType = 'none';
            });
            dispatcher.on('error', (err) => {
                if(err.name == 'input stream: Status code: 416'){
                    dispatcher = connection.play(ytdl(url[1]), {volume: 0.1});
                    bot.playing = true;
                    bot.streamType = 'radio';
                }
                else{
                    bot.playing = false;
                    bot.streamType = 'none';
                    throw console.log(err);
                }
            });
        });
    };

    const play = (url) => {
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(url[0], {quality: 'highestaudio'}), {volume: 0.1});
            msg.channel.send(`<a:Music:601415495517863948> | Starting Discord Lofi Mix in **${msg.member.voice.channel.name}** voice channel.`);
            bot.playing = true;
            bot.streamType = 'play';

            dispatcher.on('finish', async () => {
                msg.channel.send("Discord Lofi Mix has ended. Switching to Lofi Stream...");
                radio(vibeURLs);
                bot.streamType = 'radio';
            });
            dispatcher.on('error', (err) => {
                if(err.name == 'input stream: Status code: 416'){
                    dispatcher = connection.play(ytdl(url[0]), {volume: 0.1});
                    bot.playing = true;
                    bot.streamType = 'play';
                }
                else{
                    bot.playing = false;
                    bot.streamType = 'none';
                    throw console.log(err);
                }
            });
        });
    };

    if(command === 'help'){
        let embed = new Discord.MessageEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`\`${bot.prefix}radio\` - Starting stream lofi vibes in voice channel.
        \`${bot.prefix}play\` - Starting Discord Lofi Mix in voice channel.
        \`${bot.prefix}stop\` - Stopping stream/Lofi Mix in voice channel.
        \`${bot.prefix}quit\` - Stopping/Lofi Mix stream and leaving voice channel.
        \`${bot.prefix}source\` - Links to music source.`)
        .setFooter('Created by Czekin#0001 • @discordjs/opus', bot.users.cache.get('189083017686417410').avatarURL())
        .setColor('#ffaa00');

        msg.channel.send(embed);
    }

    if(command === 'source'){
        let embed = new Discord.MessageEmbed()
        .setTitle('**Source**')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription('[Radio Stream](https://www.youtube.com/watch?v=7NOSDKb0HlU)\n[Discord Lofi Mix](https://www.youtube.com/watch?v=25jHkLvTRtA)')
        .setFooter('Created by Czekin#0001 • @discordjs/opus', bot.users.cache.get('189083017686417410').avatarURL())
        .setColor('#ffaa00');

        msg.channel.send(embed);
    }

    if(command === 'radio'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);
            if(bot.playing == true) return msg.channel.send(messages.alreadyPlaying);
            else{
                radio(vibeURLs);
            }
        }else{
            radio(vibeURLs);
        }
    }

    if(command === 'play'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);
            if(bot.playing == true) return msg.channel.send(messages.alreadyPlaying);
            else{
                play(vibeURLs);
            }
        }else{
            play(vibeURLs);
        }
    }

    if(command === 'stop'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);

            if(bot.playing == false) return msg.channel.send(messages.notPlaying);
            else{
                msg.guild.me.voice.connection.dispatcher.destroy();
                bot.playing = false;

                switch(bot.streamType){
                    case 'play':
                        bot.streamType = 'none';
                        return msg.channel.send('Stopped Lofi Mix.');
                    case 'radio':
                        bot.streamType = 'none';
                        return msg.channel.send('Stopped Stream.');
                    case 'none':
                        bot.streamType = 'none';
                        return msg.channel.send('Stopped Playing.');
                    default:
                        bot.streamType = 'none';
                        return msg.channel.send('`[streamTypeSwitch]: Undefined error.` Please contact with developer.');
                }
            }
        }else{
            return msg.channel.send(messages.noVoiceChannelConnection);
        }
    }

    if(command === 'quit'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(!msg.guild.me.voice.channel){
            return msg.channel.send(messages.noVoiceChannelConnection);
        }else{
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);
            
            if(bot.playing == true){
                msg.guild.me.voice.connection.dispatcher.destroy();
                bot.playing = false;
            }
            msg.guild.me.voice.connection.disconnect();
            return msg.channel.send("👋");
        }
    }
});

bot.login(require('./auth.json').token);