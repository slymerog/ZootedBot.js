const voiceDB = require('../db/voiceManager');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);

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
        // If channel is already gone or inaccessible
        voiceDB.removeTempChannelByChannelId(channel_id);
      }
    }
  },
};
