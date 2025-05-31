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
          // ✅ Pull saved name or fall back to default
          const savedName = voiceDB.getPreferredName(user.id);
          const channelName = savedName || `🔊 ${user.user.username}`;

          // 🧹 Remove any old channels owned by this user
          for (const c of voiceDB.getAllTempChannels()) {
            if (c.owner_id === user.id && c.channel_id !== oldState?.channelId) {
              voiceDB.removeTempChannel(c.channel_id);
            }
          }

          // ✅ Create the new temporary voice channel
          const tempChannel = await joinedChannel.guild.channels.create({
            name: channelName,
            type: 2,
            parent: parent,
            permissionOverwrites: [
              {
                id: user.id,
                allow: ['Connect', 'ManageChannels'],
              },
              {
                id: joinedChannel.guild.roles.everyone,
                allow: ['Connect'],
              },
            ],
          });

          // ✅ Store channel ID for tracking (but don't touch name now)
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

    // === Clean up empty temp channels ===
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
