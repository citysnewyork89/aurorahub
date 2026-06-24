const router = require('express').Router();
const passport = require('passport');

router.get('/discord', passport.authenticate('discord'));

router.get('/discord/callback',
  passport.authenticate('discord', { failureRedirect: `${process.env.CLIENT_URL}/?error=auth` }),
  (req, res) => {
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);

router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated' });
  const { discordId, username, discriminator, avatar, email, isAdmin, _id } = req.user;
  res.json({ _id, discordId, username, discriminator, avatar, email, isAdmin });
});

router.get('/me/admin', async (req, res) => {
  if (!req.isAuthenticated()) return res.json({ isAdmin: false });
  try {
    const axios = require('axios');
    const response = await axios.get(
      `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${req.user.discordId}`,
      { headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` } }
    );
    const member = response.data;
    const hasRole = member.roles && member.roles.includes(process.env.DISCORD_ADMIN_ROLE_ID);
    res.json({ isAdmin: hasRole || req.user.isAdmin });
  } catch {
    res.json({ isAdmin: req.user.isAdmin || false });
  }
});

router.post('/logout', (req, res) => {
  req.logout(() => {
    res.json({ success: true });
  });
});

module.exports = router;
