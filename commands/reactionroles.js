const { SlashCommandBuilder } = require('discord.js');
const reactionDB = require('../db/reactionRoleManager');
const { MessageFlags } = require('discord-api-types/v10');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionrole')
    .setDescription('Manage reaction roles')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a reaction role')
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji for the reaction role')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to assign')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('ID of the message to react to')
            .setRequired(true))
        .addBooleanOption(option =>
          option.setName('non_removable')
            .setDescription('Prevent users from removing this role'))
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a reaction role')
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji of the reaction role to remove')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('ID of the message the reaction is on')
            .setRequired(true))
    ),

  async execute(interaction) {
    const config = require('../config.json'); // make sure this is at the top if not already

const allowedRoles = config.commandPermissions.reactionrole || [];
const hasPermission = interaction.member.roles.cache.some(role =>
  allowedRoles.includes(role.name)
);

if (!hasPermission) {
  return interaction.reply({
    content: '❌ You do not have permission to use this command.',
    flags: MessageFlags.Ephemeral
  });
}

    const sub = interaction.options.getSubcommand();

    if (sub === 'add') {
      const emojiInput = interaction.options.getString('emoji');
      const parsedEmoji = interaction.client.emojis.resolve(emojiInput)?.id || emojiInput;
      const role = interaction.options.getRole('role');
      const messageId = interaction.options.getString('message_id');
      const nonRemovable = interaction.options.getBoolean('non_removable') || false;

      try {
        reactionDB.addReactionRole(messageId, parsedEmoji, role.id, nonRemovable);

        const channel = interaction.channel;
        const targetMessage = await channel.messages.fetch(messageId);
        await targetMessage.react(parsedEmoji);

        await interaction.reply({
          content: `✅ Reaction role added. React with ${emojiInput} to get <@&${role.id}>.`,
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        console.error('Failed to add reaction role:', err);
        await interaction.reply({
          content: '❌ Failed to add reaction role. Make sure the message ID and emoji are valid.',
          flags: MessageFlags.Ephemeral
        });
      }
    }

    if (sub === 'remove') {
      const emojiInput = interaction.options.getString('emoji');
      const parsedEmoji = interaction.client.emojis.resolve(emojiInput)?.id || emojiInput;
      const messageId = interaction.options.getString('message_id');

      try {
        reactionDB.removeReactionRole(messageId, parsedEmoji);

        const channel = interaction.channel;
        const targetMessage = await channel.messages.fetch(messageId);
        const reaction = targetMessage.reactions.cache.get(parsedEmoji);
        if (reaction) await reaction.remove();

        await interaction.reply({
          content: `✅ Reaction role for ${emojiInput} removed from message ${messageId}.`,
          flags: MessageFlags.Ephemeral
        });
      } catch (err) {
        console.error('Failed to remove reaction role:', err);
        await interaction.reply({
          content: '❌ Failed to remove reaction role. Ensure message ID and emoji are correct.',
          flags: MessageFlags.Ephemeral
        });
      }
    }
  }
};
