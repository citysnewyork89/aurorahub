let clientInstance = null;

function setClient(client) {
  clientInstance = client;
}

async function sendPurchaseDM(order) {
  if (!clientInstance) return;
  try {
    const user = await clientInstance.users.fetch(order.discordId);
    if (!user) return;

    const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
    const Settings = require('./models/Settings');
    const settings = await Settings.find();
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);

    const embedColor = settingsObj.botEmbedColor ? parseInt(settingsObj.botEmbedColor.replace('#', ''), 16) : 0x000000;

    // Summary embed
    const summaryEmbed = new EmbedBuilder()
      .setColor(embedColor)
      .setTitle('Purchase Confirmed')
      .addFields(
        { name: 'Order ID', value: order.orderId, inline: true },
        { name: 'Total', value: `€${order.total.toFixed(2)}`, inline: true },
        { name: 'Date', value: new Date(order.createdAt).toLocaleString('en-GB'), inline: false },
        { name: 'Roblox', value: order.robloxUsername, inline: true },
        { name: 'Email', value: order.email, inline: true }
      )
      .setFooter({ text: 'aurorahub · Thank you for your purchase' })
      .setTimestamp();

    await user.send({ embeds: [summaryEmbed] });

    // One embed per product
    const baseUrl = process.env.CLIENT_URL;
    for (const item of order.items) {
      if (!item.product) continue;

      const productEmbed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle(item.title)
        .setDescription('> Download your purchased product by clicking the button below.');

      // Generate download token
      const DownloadToken = require('./models/DownloadToken');
      const { v4: uuidv4 } = require('uuid');
      const tokenDoc = await DownloadToken.create({
        token: uuidv4(),
        user: order.user,
        product: item.product
      });

      const downloadUrl = `${baseUrl}/download/${tokenDoc.token}`;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel('Download Product')
          .setStyle(ButtonStyle.Link)
          .setURL(downloadUrl)
      );

      await user.send({ embeds: [productEmbed], components: [row] });
    }
  } catch (err) {
    console.error('DM error:', err.message);
  }
}

module.exports = { setClient, sendPurchaseDM };