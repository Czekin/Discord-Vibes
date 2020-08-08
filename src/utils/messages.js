module.exports = {
    notPlaying: `I'm not playing...`,
    noVoiceChannelConnection: `I'm not in voice channel!`,
    userNotConnected: `You're not connected to voice channel!`,
    userNotInMyChannel: `You're not connected to the same channel as bot!`,
    botNotConnected: `I'm not in voice channel!`
}

module.exports.noVoiceChannelConnection = (msg) => {
    return `I'm already playing in **${msg.guild.me.voice.channel.name}**...`;
}