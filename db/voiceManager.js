const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'voiceChannels.db'));

// ✅ Create table with all 3 columns
db.prepare(`
  CREATE TABLE IF NOT EXISTS temp_channels (
    channel_id TEXT PRIMARY KEY,
    owner_id TEXT
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    owner_id TEXT PRIMARY KEY,
    name TEXT
  )
`).run();


module.exports = {
// Temp channel tracking
addTempChannel(channelId, ownerId) {
  db.prepare(`INSERT OR REPLACE INTO temp_channels (channel_id, owner_id) VALUES (?, ?)`).run(channelId, ownerId);
},
removeTempChannel(channelId) {
  db.prepare(`DELETE FROM temp_channels WHERE channel_id = ?`).run(channelId);
},
getChannelByOwner(ownerId) {
  return db.prepare(`SELECT * FROM temp_channels WHERE owner_id = ?`).get(ownerId);
},
getAllTempChannels() {
  return db.prepare(`SELECT * FROM temp_channels`).all();
},

// User preference storage
setPreferredName(ownerId, name) {
  db.prepare(`INSERT OR REPLACE INTO user_preferences (owner_id, name) VALUES (?, ?)`).run(ownerId, name);
},
getPreferredName(ownerId) {
  const row = db.prepare(`SELECT name FROM user_preferences WHERE owner_id = ?`).get(ownerId);
  return row?.name || null;
}
};
