const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: process.env.DISCORD_CALLBACK_URL,
  scope: ['identify', 'email', 'guilds', 'guilds.members.read']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ discordId: profile.id });
    const avatarUrl = profile.avatar
      ? `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.png`
      : `https://cdn.discordapp.com/embed/avatars/0.png`;

    if (user) {
      user.username = profile.username;
      user.discriminator = profile.discriminator || '0';
      user.avatar = avatarUrl;
      user.email = profile.email;
      user.accessToken = accessToken;
      await user.save();
    } else {
      user = await User.create({
        discordId: profile.id,
        username: profile.username,
        discriminator: profile.discriminator || '0',
        avatar: avatarUrl,
        email: profile.email,
        accessToken
      });
    }
    return done(null, user);
  } catch (err) {
    return done(err, null);
  }
}));
