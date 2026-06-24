const axios = require('axios');

const isAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ error: 'Not authenticated' });
};

const isAdmin = async (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
  try {
    const response = await axios.get(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${req.user.discordId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );
    const member = response.data;
    const isOwner = member.user && member.user.id === process.env.DISCORD_GUILD_ID;
    const hasRole = member.roles && member.roles.includes(process.env.DISCORD_ADMIN_ROLE_ID);
    if (hasRole || isOwner || req.user.isAdmin) return next();
    return res.status(403).json({ error: 'Not authorized' });
  } catch (err) {
    return res.status(403).json({ error: 'Not authorized' });
  }
};

const isInGuild = async (req, res, next) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
  try {
    await axios.get(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${req.user.discordId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );
    return next();
  } catch (err) {
    return res.status(403).json({ error: 'not_in_guild', invite: process.env.DISCORD_SERVER_INVITE });
  }
};

module.exports = { isAuth, isAdmin, isInGuild };
