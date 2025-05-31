const { SlashCommandBuilder } = require('discord.js');
const voiceDB = require('../db/voiceManager');
const config = require('../config.json');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unlockvc')
    .setDescription('Remove all invited users and make your voice channel public again.'),
  async execute(interaction) {
const { hasCommandPermission } = require('../utils/permissions');

if (!hasCommandPermission(interaction, 'unlockvc')) {
  return interaction.reply({
    content: '❌ You do not have permission to use this command.',
    flags: MessageFlags.Ephemeral
  });
}


    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({ content: '❌ You must be in a voice channel.', ephemeral: true });
    }

    const tracked = voiceDB.getAllTempChannels().find(c => c.channel_id === channel.id);
    if (!tracked || tracked.owner_id !== member.id) {
      return interaction.reply({
        content: '❌ You are not the owner of this voice channel.',
        flags: MessageFlags.Ephemeral
      });
    }

    try {
      // Remove all invited users from DB
      voiceDB.clearVCUsers(member.id);

      // Reset channel to public
      await channel.permissionOverwrites.set([
        {
          id: member.id,
          allow: ['Connect', 'ManageChannels', 'ViewChannel']
        },
        {
          id: interaction.guild.roles.everyone,
          allow: ['Connect', 'ViewChannel']
        }
      ]);

await interaction.reply({
  content: '✅ Voice channel is now unlocked and public.',
  flags: MessageFlags.Ephemeral
});

    } catch (err) {
      console.error('Error unlocking VC:', err);
      await interaction.reply({
        content: '❌ Failed to unlock your voice channel.',
        flags: MessageFlags.Ephemeral
      });
    }
  }
};
