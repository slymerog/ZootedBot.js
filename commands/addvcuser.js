const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const voiceDB = require('../db/voiceManager');
const config = require('../config.json');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addvcuser')
    .setDescription('Allow a user to join your temporary voice channel.')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to grant access to')
        .setRequired(true)
    ),
  async execute(interaction) {
    const allowedRoles = config.commandPermissions.addvcuser;
    const hasPermission = interaction.member.roles.cache.some(role =>
      allowedRoles.includes(role.name)
    );

    if (!hasPermission) {
      return interaction.reply({
        content: '❌ You do not have permission to use this command.',
        flags: MessageFlags.Ephemeral
      });
    }

    const member = interaction.member;
    const channel = member.voice.channel;
    const targetUser = interaction.options.getUser('user');

    if (!channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const tracked = voiceDB.getAllTempChannels().find(c => c.channel_id === channel.id);

    if (!tracked || tracked.owner_id !== member.id) {
      return interaction.reply({ content: '❌ You are not the owner of this voice channel.', ephemeral: true });
    }

    try {
      // ✅ Grant access and persist
      await channel.permissionOverwrites.edit(targetUser.id, {
        Connect: true,
        ViewChannel: true
      });

      voiceDB.addVCUser(member.id, targetUser.id);

      // ✅ If this is the first user added, make the channel private
      const totalAllowed = voiceDB.getVCUsers(member.id);
      if (totalAllowed.length === 1) {
        await channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
          Connect: false,
          ViewChannel: false,
        });
      }
await interaction.reply({
   content: `✅ ${targetUser.username} can now join your voice channel.`,
  flags: MessageFlags.Ephemeral
});
    } catch (err) {
      console.error(err);
      await interaction.reply({
        content: '❌ Failed to update permissions.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
