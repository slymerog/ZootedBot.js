const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'voiceChannels.db'));

// === Table: Temp Channels ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS temp_channels (
    channel_id TEXT PRIMARY KEY,
    owner_id TEXT
  )
`).run();

// === Table: User Preferences (for saved VC names) ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_preferences (
    owner_id TEXT PRIMARY KEY,
    name TEXT
  )
`).run();

// === Table: Voice Permissions (for persistent invite list) ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS voice_permissions (
    owner_id TEXT,
    allowed_user_id TEXT,
    PRIMARY KEY (owner_id, allowed_user_id)
  )
`).run();

module.exports = {
  // === Temp VC tracking ===
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
  clearVCUsers(ownerId) {
  db.prepare(`DELETE FROM voice_permissions WHERE owner_id = ?`).run(ownerId);
  },

  // === User Preferences ===
  setPreferredName(ownerId, name) {
    db.prepare(`INSERT OR REPLACE INTO user_preferences (owner_id, name) VALUES (?, ?)`).run(ownerId, name);
  },
  getPreferredName(ownerId) {
    const row = db.prepare(`SELECT name FROM user_preferences WHERE owner_id = ?`).get(ownerId);
    return row?.name || null;
  },

  // === Persistent VC Permissions ===
  addVCUser(ownerId, userId) {
    db.prepare(`INSERT OR IGNORE INTO voice_permissions (owner_id, allowed_user_id) VALUES (?, ?)`).run(ownerId, userId);
  },
  removeVCUser(ownerId, userId) {
    db.prepare(`DELETE FROM voice_permissions WHERE owner_id = ? AND allowed_user_id = ?`).run(ownerId, userId);
  },
  getVCUsers(ownerId) {
    return db.prepare(`SELECT allowed_user_id FROM voice_permissions WHERE owner_id = ?`).all(ownerId).map(row => row.allowed_user_id);
  }
};
