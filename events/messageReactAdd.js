// === messageReactAdd.js ===
const reactionDB = require('../db/reactionRoleManager');

module.exports = {
  name: 'messageReactionAdd',
  async execute(reaction, user) {
    if (user.bot) return;

    // Ensure full data for uncached reactions
    if (reaction.partial) {
      try {
        await reaction.fetch();
        if (reaction.message.partial) await reaction.message.fetch();
      } catch (err) {
        console.error('Failed to fetch reaction:', err);
        return;
      }
    }

    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const data = reactionDB.getReactionRole(reaction.message.id, emojiKey);
    if (!data) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    try {
      await member.roles.add(data.role_id);
      reactionDB.addUserReactionRole(user.id, reaction.message.id, emojiKey, data.role_id);
    } catch (err) {
      console.error(`Failed to add role to ${user.tag}:`, err);
    }
  }
};