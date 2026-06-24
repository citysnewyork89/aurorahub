const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const Promo = require('../models/Promo');
const { isAuth, isInGuild } = require('../middleware/auth');

// Create pending order
router.post('/create', isAuth, isInGuild, async (req, res) => {
  try {
    const { items, robloxUsername, email, promoCode } = req.body;
    if (!robloxUsername || robloxUsername.length < 4) return res.status(400).json({ error: 'Invalid Roblox username' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return res.status(400).json({ error: 'Invalid email' });

    const productDocs = await Product.find({ _id: { $in: items } });
    let orderItems = productDocs.map(p => {
      const final = p.discountPrice || (p.discountPercent > 0 ? p.price * (1 - p.discountPercent / 100) : p.price);
      return { product: p._id, title: p.title, price: p.price, discountPrice: p.discountPrice, finalPrice: final };
    });

    let subtotal = orderItems.reduce((sum, i) => sum + i.finalPrice, 0);
    let discountAmount = 0;
    let usedPromo = null;

    if (promoCode) {
      const promo = await Promo.findOne({ code: promoCode.toUpperCase(), active: true });
      if (promo && (!promo.expiresAt || promo.expiresAt > new Date())) {
        const applicable = promo.applicableTo === 'all' || orderItems.some(i => promo.products.includes(i.product));
        if (applicable) {
          discountAmount = promo.discountType === 'percent' ? subtotal * promo.discountValue / 100 : promo.discountValue;
          usedPromo = promo.code;
          promo.usageCount++;
          await promo.save();
        }
      }
    }

    const total = Math.max(0, subtotal - discountAmount);

    const order = await Order.create({
      user: req.user._id,
      discordId: req.user.discordId,
      discordUsername: req.user.username,
      robloxUsername, email,
      items: orderItems,
      subtotal, discountAmount, promoCode: usedPromo, total,
      status: 'pending'
    });

    res.json({ orderId: order.orderId, total, order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Validate promo code
router.post('/validate-promo', isAuth, async (req, res) => {
  try {
    const { code, items } = req.body;
    const promo = await Promo.findOne({ code: code.toUpperCase(), active: true });
    if (!promo || (promo.expiresAt && promo.expiresAt < new Date())) {
      return res.status(404).json({ error: 'Invalid or expired code' });
    }
    res.json({ valid: true, discountType: promo.discountType, discountValue: promo.discountValue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user orders
router.get('/mine', isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'paid' })
      .populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user licenses (paid products)
router.get('/licenses', isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'paid' }).populate('items.product');
    const licenses = [];
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product) licenses.push({ product: item.product, orderId: order.orderId, purchasedAt: order.createdAt });
      });
    });
    res.json(licenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
