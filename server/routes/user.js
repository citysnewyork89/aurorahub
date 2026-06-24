const router = require('express').Router();
const { isAuth } = require('../middleware/auth');
const Order = require('../models/Order');

router.get('/profile', isAuth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'paid' }).populate('items.product');
    const products = [];
    orders.forEach(o => o.items.forEach(i => { if (i.product) products.push(i.product); }));
    res.json({ user: req.user, products });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
