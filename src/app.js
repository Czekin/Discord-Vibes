const Discord = require('discord.js');
const opus = require('@discordjs/opus');
const ms = require('ms');
const ytdl = require('ytdl-core');
const yt = require('youtube-info');

require('ffmpeg');
require('ffmpeg-static');

const vibeURLs = ['https://www.youtube.com/watch?v=25jHkLvTRtA', 'https://www.youtube.com/watch?v=7NOSDKb0HlU'];

const bot = new Discord.Client();

bot.on('ready', () => {
    console.log('ready');
    bot.user.setActivity('🍹 | Discord Lofi Vibes', {type: 'LISTENING'});
});

bot.on('message', async (msg) => {
    if(msg.author.bot || msg.channel.type == 'dm') return;

    const play = (url) => {
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(url[1]), {volume: 0.1});
            msg.channel.send(`<a:Music:601415495517863948> | Starting Discord Vibes in channel **${msg.member.voice.channel.name}**`);

            dispatcher.on('finish', async () => {
                msg.channel.send('Stream has ended...');
            });
            dispatcher.on('error', (err) => {
                if(err.name == 'input stream: Status code: 416') dispatcher = connection.play(ytdl(url[1]), {volume: 0.1});
                else return console.log(err);
            });
        });
    };

    if(msg.content.startsWith('!play')){
        if(!msg.member.voice.channel) return;
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return;
            if(msg.guild.me.voice.speaking) return msg.channel.send("I'm already playing...");
            else{
                play(vibeURLs);
            }
        }else{
            play(vibeURLs);
        }
    }

    if(msg.content.startsWith('!stop')){
        if(!msg.member.voice.channel) return;
        if(msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return;

            if(!msg.guild.me.voice.speaking) return msg.channel.send("I'm not playing...");
            else msg.guild.me.voice.connection.dispatcher.end();
        }else{
            return msg.channel.send("I'm not in voice channel!");
        }
    }

    if(msg.content.startsWith('!quit')){
        if(!msg.member.voice.channel) return;
        if(!msg.guild.me.voice.channel){
            if(msg.member.voice.channel.id !== msg.guild.me.voice.channel.id) return;
            
            return msg.channel.send("I'm not in voice channel!")
        }else{
            await msg.guild.me.voice.connection.dispatcher.end();
            msg.guild.me.voice.connection.disconnect();
            return msg.channel.send("👋");
        }
    }
});

bot.login('NzQxMzkyMjkzNzUxMTYwOTAy.Xy25YQ.OMiMDan2mw_RjGsGwZYSIdct8Jg');