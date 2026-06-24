const router = require('express').Router();
const Promo = require('../models/Promo');
const { isAdmin } = require('../middleware/auth');

router.get('/', isAdmin, async (req, res) => {
  try {
    const promos = await Promo.find().populate('products', 'title').sort({ createdAt: -1 });
    res.json(promos);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', isAdmin, async (req, res) => {
  try {
    const promo = await Promo.create({ ...req.body, code: req.body.code.toUpperCase() });
    res.json(promo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const promo = await Promo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(promo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Promo.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
