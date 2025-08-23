// events/ready.js
const voiceDB = require('../db/voiceManager');
const reactionDB = require('../db/reactionRoleManager');
const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

    // === Clean up empty temp voice channels ===
    const trackedChannels = voiceDB.getAllTempChannels();
    for (const { channel_id } of trackedChannels) {
      try {
        // Try cache first to reduce API calls
        let channel = client.channels.cache.get(channel_id);
        if (!channel) {
          channel = await client.channels.fetch(channel_id).catch(() => null);
        }

        if (!channel) {
          // Channel is gone; just clean the DB entry
          voiceDB.removeTempChannel(channel_id);
          continue;
        }

        // Only voice-like channels have a members collection
        const memberCount = channel?.members?.size ?? 0;
        if (memberCount === 0) {
          await channel.delete('Startup cleanup of leftover empty temp VC');
          voiceDB.removeTempChannel(channel_id); // <-- fixed function name
          console.log(`🧹 Deleted leftover temp channel: ${channel.name}`);
        }
      } catch (err) {
        // If fetch/delete failed, still clear the DB record to prevent leaks
        try {
          voiceDB.removeTempChannel(channel_id); // <-- fixed function name
        } catch (dbErr) {
          console.error('DB cleanup failed after channel fetch/delete error:', dbErr);
        }
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

            break; // message found in this guild; stop scanning further channels
          } catch {
            continue;
          }
        }
      }
    }

    // === Rehydrate reaction role assignments (summary by default; verbose with DEBUG_REACTION_ROLES=1) ===
    const DEBUG_RR = process.env.DEBUG_REACTION_ROLES === '1';
    let restored = 0;
    let already = 0;
    let failures = 0;

    for (const guild of client.guilds.cache.values()) {
      // Ensure member cache is populated for role checks
      await guild.members.fetch().catch(() => {});

      for (const member of guild.members.cache.values()) {
        const stored = reactionDB.getUserReactionRoles(member.id) || [];
        for (const { role_id, message_id, emoji } of stored) {
          if (!member.roles.cache.has(role_id)) {
            try {
              await member.roles.add(role_id);
              restored++;
              if (DEBUG_RR) {
                console.log(`🔁 Restored ${role_id} to ${member.user.tag} from ${message_id} (${emoji})`);
              }
            } catch (err) {
              failures++;
              console.error(`❌ Failed restoring role for ${member.user.tag} (${role_id}):`, err);
            }
          } else {
            already++;
            if (DEBUG_RR) {
              console.log(`ℹ️ ${member.user.tag} already has ${role_id}`);
            }
          }
        }
      }
    }

    console.log(`✅ Reaction-role rehydrate complete: ${restored} restored, ${already} already present, ${failures} failed.`);
  }
};