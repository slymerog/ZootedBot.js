const config = require('../config.json');

/**
 * Checks if a member has permission to run a command,
 * either by role name match or by Administrator permission.
 * 
 * @param {CommandInteraction} interaction - The interaction object
 * @param {string} commandName - The name of the command (as defined in config)
 * @returns {boolean}
 */
function hasCommandPermission(interaction, commandName) {
  const allowedRoles = config.commandPermissions[commandName] || [];

  const hasRole = interaction.member.roles.cache.some(role =>
    allowedRoles.includes(role.name)
  );

  const isAdmin = interaction.member.permissions.has('Administrator');

  return hasRole || isAdmin;
}

module.exports = { hasCommandPermission };
