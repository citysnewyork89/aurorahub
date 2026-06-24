const router = require('express').Router();
const { isAdmin } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Settings = require('../models/Settings');
const FAQ = require('../models/FAQ');

// Sales report
router.get('/sales', isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    let query = { status: 'paid' };
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { discordUsername: { $regex: search, $options: 'i' } },
        { robloxUsername: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    const orders = await Order.find(query).populate('items.product user').sort({ createdAt: -1 });
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    res.json({ orders, totalRevenue, totalSales: orders.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All products (including private)
router.get('/products', isAdmin, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings
router.get('/settings', isAdmin, async (req, res) => {
  try {
    const settings = await Settings.find();
    const obj = {};
    settings.forEach(s => obj[s.key] = s.value);
    res.json(obj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/settings', isAdmin, async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await Settings.findOneAndUpdate({ key }, { value }, { upsert: true });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// FAQs
router.get('/faqs', async (req, res) => {
  try {
    const faqs = await FAQ.find().sort({ order: 1, createdAt: 1 });
    res.json(faqs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/faqs', isAdmin, async (req, res) => {
  try {
    const faq = await FAQ.create(req.body);
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/faqs/:id', isAdmin, async (req, res) => {
  try {
    const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(faq);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/faqs/:id', isAdmin, async (req, res) => {
  try {
    await FAQ.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
