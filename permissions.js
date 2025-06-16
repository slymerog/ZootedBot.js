const config = require('../config.json');

/**
 * Checks if a member has permission to run a command,
 * either by role name match, being a booster, or by Administrator permission.
 * 
 * @param {CommandInteraction} interaction - The interaction object
 * @param {string} commandName - The name of the command (as defined in config)
 * @returns {boolean}
 */
function hasCommandPermission(interaction, commandName) {
  const member = interaction.member;

  const allowedRoles = config.commandPermissions[commandName] || [];

  // Check for named roles
  const hasNamedRole = member.roles.cache.some(role =>
    allowedRoles.includes(role.name)
  );

  // Check if member is a booster
  const isBooster = allowedRoles.includes('Booster') && !!member.premiumSince;

  // Check for admin permissions
  const isAdmin = member.permissions.has('Administrator');

  return hasNamedRole || isBooster || isAdmin;
}

module.exports = { hasCommandPermission };