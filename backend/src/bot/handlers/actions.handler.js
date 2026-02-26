const { pool } = require('../../database/connection');

async function handleClientActions(bot, ctx) {
  // Client-specific inline keyboard actions can be handled here
}

async function handleDriverActions(bot, ctx) {
  // Driver-specific inline keyboard actions can be handled here
}

async function handleAdminActions(bot, ctx) {
  // Admin-specific inline keyboard actions can be handled here
}

module.exports = {
  handleClientActions,
  handleDriverActions,
  handleAdminActions
};
