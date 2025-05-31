const { Events } = require('discord.js');
const config = require('../config.json');

module.exports = {
  name: Events.GuildMemberAdd,
  once: false,
  async execute(member) {
    const channel = member.guild.channels.cache.get(config.welcomeChannelId);
    if (!channel) return;

    const welcomeMessage = config.welcomeMessage
      .replace('{{user}}', `<@${member.id}>`)
      .replace('{{server}}', member.guild.name);

    channel.send({ content: welcomeMessage });
  },
};
