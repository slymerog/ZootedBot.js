const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10'); // Add this line
const config = require('../config.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupautovc')
    .setDescription('Setup an auto voice channel system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const allowedRoles = config.commandPermissions.setupautovc;
const hasPermission = interaction.member.roles.cache.some(role =>
  allowedRoles.includes(role.name)
);

if (!hasPermission) {
  return interaction.reply({
    content: '❌ You do not have permission to use this command.',
      flags: MessageFlags.Ephemeral
  });
}

    const guild = interaction.guild;

    // Create Category
    const category = await guild.channels.create({
      name: '🔊 Voice Channels',
      type: 4, // GUILD_CATEGORY
    });

    // Create Voice Channel
    const voiceChannel = await guild.channels.create({
      name: '➕ Create Voice',
      type: 2, // GUILD_VOICE
      parent: category.id,
    });

    // Send ephemeral response using flags (no warning!)
    await interaction.reply({
      content: `✅ Auto voice system created!\nCategory: ${category.name}\nJoin channel: ${voiceChannel.name}`,
      flags: MessageFlags.Ephemeral,
    });
  },
};