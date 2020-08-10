const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const messages = require('./utils/messages');
const utils = require('./utils/utils');
const fs = require('fs');

const discordMix = 'https://www.youtube.com/watch?v=25jHkLvTRtA';
const radioStations = ['https://www.youtube.com/watch?v=7NOSDKb0HlU', 'https://www.youtube.com/watch?v=5yx6BWlEVcY', 'https://www.youtube.com/watch?v=-5KAN9_CzSA',
'https://www.youtube.com/watch?v=5qap5aO4i9A', 'https://www.youtube.com/watch?v=DWcJFNfaw9c', 'https://www.youtube.com/watch?v=rPWaeLyZZMQ'];

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

    if(msg.mentions.has(bot.user)){
        let onlyMention = msg.content.trim().split(/ +/g);
        if(onlyMention[0] !== `<@!${bot.user.id}>` || onlyMention[1] !== undefined) return;

        let embed = new Discord.MessageEmbed()
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Prefix ﹥ \`${bot.prefix}\`\nCommands ﹥ \`${bot.prefix}help\`\nSource ﹥ \`${bot.prefix}source\``)
        .setFooter(utils.embedFooter, utils.embedFooterAvatarURL(bot))
        .setColor(utils.embedColor);

        msg.channel.send(embed);
    }

    if(!msg.content.startsWith(bot.prefix)) return;
    const args = msg.content.slice(bot.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    const radio = () => {
        if(!args[0]){
            let embed = new Discord.MessageEmbed()
            .setTitle('**Radio Stations**')
            .setAuthor(bot.user.username, bot.user.avatarURL())
            .setDescription(`How to use radio?\n\`${bot.prefix}radio <station ID>\`\n
            ***Station ID. Radio Name***
            **1.** *lofi hip hop - beats to study/relax*
            **2.** *lofi hip hop - jazzy & lofi hip hop beats*
            **3.** *coffee lofi hip hop beats*
            **4.** *lofi hip hop - beats to relax/study*
            **5.** *lofi hip hop - beats to sleep/chill*
            **6.** *Coffee Positive Morning Jazz & Bossa Nova Music*`)
            .setFooter(utils.embedFooter, utils.embedFooterAvatarURL)
            .setColor(utils.embedColor);

            return msg.channel.send(embed);
        }

        let radioID;
        switch(args[0]){
            case '1':
                radioID = 1;
                break;
            case '2':
                radioID = 2;
                break;
            case '3':
                radioID = 3;
                break;
            case '4':
                radioID = 4;
                break;
            case '5':
                radioID = 5;
                break;
            case '6':
                radioID = 6;
                break;
            default:
                return msg.channel.send(`... Incorrect station ID!`);
        }
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(radioStations[radioID], {quality: 'highestaudio', highWaterMark: 1 << 25}), {volume: 0.1});
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
                    dispatcher = connection.play(ytdl(radioStations[radioID]), {quality: 'highestaudio', highWaterMark: 1 << 25}, {volume: 0.1});
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

    const play = () => {
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(discordMix, {quality: 'highestaudio', highWaterMark: 1 << 25}), {volume: 0.3});
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
                    dispatcher = connection.play(ytdl(discordMix, {quality: 'highestaudio', highWaterMark: 1 << 25}), {volume: 0.3});
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
        .setDescription(`\`${bot.prefix}radio <station ID (e.g. 2)>\` ﹥ Starting stream lofi vibes in voice channel.
        \`${bot.prefix}play\` ﹥ Starting Discord Lofi Mix in voice channel.
        \`${bot.prefix}stop\` ﹥ Stopping stream/Lofi Mix in voice channel.
        \`${bot.prefix}quit\` ﹥ Stopping Lofi Mix/Stream and leaving voice channel.
        \`${bot.prefix}source\` ﹥ Links to bot sources.`)
        .setFooter(utils.embedFooter, utils.embedFooterAvatarURL(bot))
        .setColor(utils.embedColor);

        msg.channel.send(embed);
    }

    if(command === 'source'){
        let embed = new Discord.MessageEmbed()
        .setTitle('**Source**')
        .setAuthor(bot.user.username, bot.user.avatarURL())
        .setDescription(`Links to bot sources.
        **Me**
        [GitHub](https://github.com/MadMatix/Discord-Vibes)
        [Support Server](https://discord.gg/trwajaprace)
        [Invite](https://discord.com/oauth2/authorize?client_id=741392293751160902&scope=bot&permissions=104188993)
        **Radio**
        [Discord Lofi Mix](https://www.youtube.com/watch?v=25jHkLvTRtA)
        [lofi hip hop - beats to study/relax](https://www.youtube.com/watch?v=7NOSDKb0HlU)
        [lofi hip hop - jazzy & lofi hip hop beats](https://www.youtube.com/watch?v=5yx6BWlEVcY)
        [coffee lofi hip hop beats](https://www.youtube.com/watch?v=-5KAN9_CzSA)
        [lofi hip hop - beats to relax/study](https://www.youtube.com/watch?v=5qap5aO4i9A)
        [lofi hip hop - beats to sleep/chill](https://www.youtube.com/watch?v=DWcJFNfaw9c)
        [Coffee Positive Morning Jazz & Bossa Nova Music](https://www.youtube.com/watch?v=rPWaeLyZZMQ)
        **Made with**
        discord.js [(NPM)](https://www.npmjs.com/package/discord.js) [(GitHub)](https://github.com/discordjs/discord.js)
        ffmpeg-static [(NPM)](https://www.npmjs.com/package/ffmpeg-static) [(GitHub)](https://github.com/eugeneware/ffmpeg-static)
        ytdl-core [(NPM)](https://npmjs.com/package/ytdl-core) [(GitHub)](https://github.com/fent/node-ytdl-core)
        fs [(NPM)](https://www.npmjs.com/package/fs) [(GitHub)](https://github.com/npm/security-holder)
        text to speech [(Web)](https://responsivevoice.org/text-to-speech-languages/uk-english-text-to-speech/)`)
        .setFooter(utils.embedFooter, utils.embedFooterAvatarURL(bot))
        .setColor(utils.embedColor);

        msg.channel.send(embed);
    }

    if(command === 'testradio'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);

            msg.member.voice.channel.join().then(connection => {
                const dispatcher = connection.play('https://rs7-krk2-cyfronet.rmfstream.pl/rmf_maxxx?listenerid=b41ff36d11be1f25f7d30b467c9bb19e&awparams=companionAds%3Atrue&aw_0_1st.version=1.1.4%3Ahtml5&aw_0_1st.playerid=RMF_Player_JS_P&aw_0_1st.skey=1597064352&aw_0_req.gdpr=true&aw_0_1st.playerid=RMF_Player_JS_P&aw_0_1st.oaid=1592785330944_0.9565910149627561', {volume: 0.3});
                bot.playing = true;
                bot.streamType = 'none';
                msg.react('✅');
                msg.channel.send('Starting test for new radio station.');

                dispatcher.on('finish', () => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log('end');
                });

                dispatcher.on('error', (err) => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log(err);
                });
            });
        }else{
            msg.member.voice.channel.join().then(connection => {
                const dispatcher = connection.play('https://rs7-krk2-cyfronet.rmfstream.pl/rmf_maxxx?listenerid=b41ff36d11be1f25f7d30b467c9bb19e&awparams=companionAds%3Atrue&aw_0_1st.version=1.1.4%3Ahtml5&aw_0_1st.playerid=RMF_Player_JS_P&aw_0_1st.skey=1597064352&aw_0_req.gdpr=true&aw_0_1st.playerid=RMF_Player_JS_P&aw_0_1st.oaid=1592785330944_0.9565910149627561', {volume: 0.3});
                bot.playing = true;
                bot.streamType = 'none';
                msg.react('✅');
                msg.channel.send('Starting test for new radio station.');

                dispatcher.on('finish', () => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log('end');
                });

                dispatcher.on('error', (err) => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log(err);
                });
            });
        }
    }

    if(command === 'test'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);

            msg.member.voice.channel.join().then(connection => {
                const dispatcher = connection.play(fs.createReadStream('src/utils/sounds/radioOffline.mp3'));
                bot.playing = true;
                bot.streamType = 'none';
                msg.react('✅');
                msg.channel.send('This station is currently offline.');

                dispatcher.on('finish', () => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log('end');
                });

                dispatcher.on('error', (err) => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log(err);
                });
            });
        }else{
            msg.member.voice.channel.join().then(connection => {
                const dispatcher = connection.play(fs.createReadStream('src/utils/sounds/radioOffline.mp3'));
                bot.playing = true;
                bot.streamType = 'none';
                msg.react('✅');
                msg.channel.send('This station is currently offline.');

                dispatcher.on('finish', () => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log('end');
                });

                dispatcher.on('error', (err) => {
                    bot.playing = false;
                    bot.streamType = 'none';
                    return console.log(err);
                });
            });
        }
    }

    if(command === 'radio'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);
            else{
                radio();
            }
        }else{
            radio();
        }
    }

    if(command === 'play'){
        if(!msg.member.voice.channel) return msg.channel.send(messages.userNotConnected);
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return msg.channel.send(messages.userNotInMyChannel);
            else{
                play();
            }
        }else{
            play();
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
                bot.streamType = 'none';

                switch(bot.streamType){
                    case 'play':
                        return msg.channel.send('Stopped Lofi Mix.');
                    case 'radio':
                        return msg.channel.send('Stopped Stream.');
                    case 'none':
                        return msg.channel.send('Stopped Playing.');
                    default:
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