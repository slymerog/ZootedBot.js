const voiceDB = require('../db/voiceManager');
const reactionDB = require('../db/reactionRoleManager');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // === Clean up empty temp voice channels ===
    const trackedChannels = voiceDB.getAllTempChannels();
    for (const { channel_id } of trackedChannels) {
      try {
        const channel = await client.channels.fetch(channel_id);
        if (channel && channel.members.size === 0) {
          await channel.delete();
          voiceDB.removeTempChannelByChannelId(channel_id);
          console.log(`🧹 Deleted leftover temp channel: ${channel.name}`);
        }
      } catch (err) {
        voiceDB.removeTempChannelByChannelId(channel_id);
      }
    }

    // === Rehydrate reaction role messages ===
    const allReactionRoles = reactionDB.getAllReactionRoles();
    const groupedByMessage = {};

    for (const { message_id, emoji } of allReactionRoles) {
      if (!groupedByMessage[message_id]) groupedByMessage[message_id] = [];
      groupedByMessage[message_id].push(emoji);
    }

    for (const [messageId, emojiList] of Object.entries(groupedByMessage)) {
      for (const guild of client.guilds.cache.values()) {
        const channels = guild.channels.cache.filter(c => c.isTextBased?.());
        for (const channel of channels.values()) {
          try {
            const message = await channel.messages.fetch(messageId).catch(() => null);
            if (!message) continue;

            for (const emoji of emojiList) {
              const alreadyReacted = message.reactions.cache.has(emoji);
              if (!alreadyReacted) {
                await message.react(emoji).catch(console.error);
                console.log(`🔁 Rehydrated emoji ${emoji} on message ${messageId}`);
              }
            }

            break; // Stop once the message is found and processed
          } catch (err) {
            continue;
          }
        }
      }
    }
  }
};
