const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { MessageFlags } = require('discord-api-types/v10'); // Add this line

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupautovc')
    .setDescription('Setup an auto voice channel system.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
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