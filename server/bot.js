const { Client, GatewayIntentBits, EmbedBuilder, SlashCommandBuilder, REST, Routes } = require('discord.js');
const { setClient } = require('./utils/discordBot');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', async () => {
  console.log(`🤖 Bot online: ${client.user.tag}`);
  setClient(client);

  const settings = await getSettings();
  const activity = settings.botActivity || 'Your Products';
  client.user.setActivity(activity, { type: 3 }); // WATCHING

  await registerCommands();
});

async function getSettings() {
  try {
    const Settings = require('./models/Settings');
    const all = await Settings.find();
    const obj = {};
    all.forEach(s => obj[s.key] = s.value);
    return obj;
  } catch { return {}; }
}

async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('profile')
      .setDescription('View your aurorahub profile and purchased products'),
    new SlashCommandBuilder()
      .setName('products')
      .setDescription('List all available products in the store')
  ].map(c => c.toJSON());

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);
  try {
    await rest.put(
      Routes.applicationGuildCommands(process.env.DISCORD_CLIENT_ID, process.env.DISCORD_GUILD_ID),
      { body: commands }
    );
    console.log('✅ Slash commands registered');
  } catch (err) {
    console.error('Command registration error:', err);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const settings = await getSettings();
  const embedColor = settings.botEmbedColor ? parseInt(settings.botEmbedColor.replace('#', ''), 16) : 0x000000;

  if (interaction.commandName === 'profile') {
    await interaction.deferReply({ ephemeral: true });
    try {
      const User = require('./models/User');
      const Order = require('./models/Order');
      const user = await User.findOne({ discordId: interaction.user.id });

      if (!user) {
        return interaction.editReply({ content: 'You have no account on aurorahub yet. Visit the store to get started!' });
      }

      const orders = await Order.find({ user: user._id, status: 'paid' }).populate('items.product');
      const products = [];
      orders.forEach(o => o.items.forEach(i => { if (i.product) products.push(i.product.title); }));

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(`${interaction.user.username}'s Profile`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: 'Discord', value: interaction.user.username, inline: true },
          { name: 'Total Orders', value: String(orders.length), inline: true },
          { name: 'Products', value: products.length > 0 ? products.join('\n') : 'None', inline: false }
        )
        .setFooter({ text: 'aurorahub' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: 'Error fetching profile.' });
    }
  }

  if (interaction.commandName === 'products') {
    await interaction.deferReply();
    try {
      const Product = require('./models/Product');
      const products = await Product.find({ visibility: 'public' }).sort({ createdAt: -1 });

      if (!products.length) return interaction.editReply({ content: 'No products available.' });

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('Available Products')
        .setDescription(
          products.map(p => {
            const price = p.discountPrice || p.price;
            return `**${p.title}** — €${price.toFixed(2)}${p.tag ? ` \`${p.tag}\`` : ''}`;
          }).join('\n')
        )
        .setFooter({ text: `aurorahub · ${products.length} products available` })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    } catch (err) {
      await interaction.editReply({ content: 'Error fetching products.' });
    }
  }
});

client.login(process.env.DISCORD_BOT_TOKEN);

module.exports = client;