const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const voiceDB = require('../db/voiceManager');
const config = require('../config.json');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removevcuser')
    .setDescription('Remove a user\'s access to your temporary voice channel.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to remove access from')
        .setRequired(true)
    ),
  async execute(interaction) {
const { hasCommandPermission } = require('../utils/permissions');

if (!hasCommandPermission(interaction, 'removevcuser')) {
  return interaction.reply({
    content: '❌ You do not have permission to use this command.',
    flags: MessageFlags.Ephemeral
  });
}


    const member = interaction.member;
    const channel = member.voice.channel;
    const targetUser = interaction.options.getUser('user');

    if (!channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.',   flags: MessageFlags.Ephemeral });
    }

    const tracked = voiceDB.getAllTempChannels().find(c => c.channel_id === channel.id);

    if (!tracked || tracked.owner_id !== member.id) {
      return interaction.reply({ content: '❌ You are not the owner of this voice channel.',   flags: MessageFlags.Ephemeral });
    }

    try {
      await channel.permissionOverwrites.delete(targetUser.id);
      voiceDB.removeVCUser(member.id, targetUser.id);
      const remaining = voiceDB.getVCUsers(member.id);
if (remaining.length === 0) {
  await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
    Connect: true,
    ViewChannel: true
  });
}
await interaction.reply({
content: `✅ ${targetUser.username} has been removed from your channel access list.`,
  flags: MessageFlags.Ephemeral
});
    } catch (err) {
      console.error(err);
      await interaction.reply({ content: '❌ Failed to remove permissions.',   flags: MessageFlags.Ephemeral });
    }
  }
};
