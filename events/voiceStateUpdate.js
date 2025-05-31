const voiceDB = require('../db/voiceManager');

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState) {
    const user = newState.member;

    // === User joins a voice channel ===
    if (!oldState.channelId && newState.channelId) {
      const joinedChannel = newState.channel;

      if (joinedChannel.name === '➕ Create Voice') {
        const parent = joinedChannel.parent;

        try {
          // ✅ Pull saved name or fallback
          const savedName = voiceDB.getPreferredName(user.id);
          const channelName = savedName || `🔊 ${user.user.username}`;

          // 🧹 Remove stale VC entries
          for (const c of voiceDB.getAllTempChannels()) {
            if (c.owner_id === user.id && c.channel_id !== oldState?.channelId) {
              voiceDB.removeTempChannel(c.channel_id);
            }
          }

          // ✅ Create the new VC (private by default)
          const tempChannel = await joinedChannel.guild.channels.create({
            name: channelName,
            type: 2,
            parent: parent,
            permissionOverwrites: [
              {
                id: user.id,
                allow: ['Connect', 'ManageChannels', 'ViewChannel'],
              },
              {
                id: joinedChannel.guild.roles.everyone,
                deny: ['Connect', 'ViewChannel'],
              },
            ],
          });

          // ✅ Add saved invitees (safely)
          const allowedUsers = voiceDB.getVCUsers(user.id);

          if (allowedUsers.length === 0) {
            // No invitees — revert to public
            await tempChannel.permissionOverwrites.edit(joinedChannel.guild.roles.everyone, {
              Connect: true,
              ViewChannel: true
            });
          } else {
            for (const userId of allowedUsers) {
              if (!userId || typeof userId !== 'string') continue; // Skip invalid rows

              try {
                const member = await joinedChannel.guild.members.fetch(userId);
                if (!member) continue;

                await tempChannel.permissionOverwrites.edit(member.id, {
                  Connect: true,
                  ViewChannel: true
                });
              } catch (err) {
                console.error(`Failed to apply permission for user ${userId}:`, err);
              }
            }
          }

          // ✅ Store temp channel
          voiceDB.addTempChannel(tempChannel.id, user.id);

          // ⏱ Move user after short delay
          setTimeout(async () => {
            const freshUser = await joinedChannel.guild.members.fetch(user.id);
            if (freshUser.voice.channelId === joinedChannel.id) {
              await freshUser.voice.setChannel(tempChannel).catch(console.error);
            }
          }, 500);
        } catch (err) {
          console.error('Error creating/moving to temp VC:', err);
        }
      }
    }

    // === Clean up empty temp VCs ===
    if (
      oldState.channelId &&
      oldState.channel &&
      oldState.channel.members.size === 0
    ) {
      const isTracked = voiceDB.getAllTempChannels().find(c => c.channel_id === oldState.channelId);
      if (isTracked) {
        await oldState.channel.delete().catch(console.error);
        voiceDB.removeTempChannel(oldState.channelId);
      }
    }
  }
};
