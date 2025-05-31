const Database = require('better-sqlite3');
const path = require('path');
const db = new Database(path.resolve(__dirname, 'reactionRoles.db'));

// === Table: Reaction Roles ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS reaction_roles (
    message_id TEXT,
    emoji TEXT,
    role_id TEXT,
    non_removable INTEGER DEFAULT 0,
    PRIMARY KEY (message_id, emoji)
  )
`).run();
db.prepare(`
  CREATE TABLE IF NOT EXISTS user_reaction_roles (
    user_id TEXT,
    message_id TEXT,
    emoji TEXT,
    role_id TEXT,
    PRIMARY KEY (user_id, message_id, emoji)
  )
`).run();

module.exports = {
  addReactionRole(messageId, emoji, roleId, nonRemovable = false) {
    db.prepare(`
      INSERT OR REPLACE INTO reaction_roles (message_id, emoji, role_id, non_removable)
      VALUES (?, ?, ?, ?)
    `).run(messageId, emoji, roleId, nonRemovable ? 1 : 0);
  },

  removeReactionRole(messageId, emoji) {
    db.prepare(`
      DELETE FROM reaction_roles WHERE message_id = ? AND emoji = ?
    `).run(messageId, emoji);
  },

  getReactionRole(messageId, emoji) {
    return db.prepare(`
      SELECT * FROM reaction_roles WHERE message_id = ? AND emoji = ?
    `).get(messageId, emoji);
  },

  getAllReactionRolesForMessage(messageId) {
    return db.prepare(`
      SELECT * FROM reaction_roles WHERE message_id = ?
    `).all(messageId);
  },

  addUserReactionRole(userId, messageId, emoji, roleId) {
  db.prepare(`
    INSERT OR REPLACE INTO user_reaction_roles (user_id, message_id, emoji, role_id)
    VALUES (?, ?, ?, ?)
  `).run(userId, messageId, emoji, roleId);
},

removeUserReactionRole(userId, messageId, emoji) {
  db.prepare(`
    DELETE FROM user_reaction_roles
    WHERE user_id = ? AND message_id = ? AND emoji = ?
  `).run(userId, messageId, emoji);
},

getUserReactionRoles(userId) {
  return db.prepare(`
    SELECT * FROM user_reaction_roles WHERE user_id = ?
  `).all(userId);
},
getAllReactionRoles() {
  return db.prepare(`SELECT * FROM reaction_roles`).all();
}
};
