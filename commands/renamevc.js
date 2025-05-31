const { SlashCommandBuilder } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10'); // ✅ Import flags properly
const voiceDB = require('../db/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('renamevc')
    .setDescription('Rename your temporary voice channel')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('New channel name')
        .setRequired(true)
    ),
  async execute(interaction) {
    const member = interaction.member;
    const channel = member.voice.channel;

    if (!channel) {
      return interaction.reply({
        content: '❌ You are not in a voice channel.',
        flags: MessageFlags.Ephemeral
      });
    }

    const tracked = voiceDB.getAllTempChannels().find(c => c.channel_id === channel.id);

    if (!tracked) {
      return interaction.reply({
        content: '❌ This is not a managed temp channel.',
        flags: MessageFlags.Ephemeral
      });
    }

    if (tracked.owner_id !== member.id) {
      return interaction.reply({
        content: '❌ You are not the owner of this voice channel.',
        flags: MessageFlags.Ephemeral
      });
    }

    const newName = interaction.options.getString('name').substring(0, 100);
    await channel.setName(newName);
    voiceDB.setPreferredName(interaction.user.id, newName);

    await interaction.reply({
      content: `✅ Channel renamed to \`${newName}\``,
      flags: MessageFlags.Ephemeral
    });
  }
};
