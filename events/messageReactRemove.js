// === messageReactRemove.js ===
const reactionDB = require('../db/reactionRoleManager');

module.exports = {
  name: 'messageReactionRemove',
  async execute(reaction, user) {
    if (user.bot) return;

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
    if (!data || data.non_removable) return;

    const member = await reaction.message.guild.members.fetch(user.id);
    if (!member) return;

    try {
      await member.roles.remove(data.role_id);
      reactionDB.removeUserReactionRole(user.id, reaction.message.id, emojiKey);
    } catch (err) {
      console.error(`Failed to remove role from ${user.tag}:`, err);
    }
  }
};