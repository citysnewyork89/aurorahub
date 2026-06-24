const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const Order = require('../models/Order');
const Product = require('../models/Product');
const DownloadToken = require('../models/DownloadToken');
const { isAuth } = require('../middleware/auth');

// Generate a download token for a product the user owns
router.post('/token', isAuth, async (req, res) => {
  try {
    const { productId } = req.body;
    // Verify ownership
    const order = await Order.findOne({
      user: req.user._id,
      status: 'paid',
      'items.product': productId
    });
    if (!order) return res.status(403).json({ error: 'No license found' });

    const token = await DownloadToken.create({
      token: uuidv4(),
      user: req.user._id,
      product: productId
    });
    res.json({ token: token.token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get token info (product name, validity) without consuming it
router.get('/info/:token', async (req, res) => {
  try {
    const tokenDoc = await DownloadToken.findOne({ token: req.params.token }).populate('product');
    if (!tokenDoc) return res.status(404).json({ error: 'Invalid token' });
    if (tokenDoc.expiresAt < new Date()) return res.status(410).json({ error: 'Token expired' });
    if (tokenDoc.used) return res.status(410).json({ error: 'Token already used' });
    // Verify ownership
    if (tokenDoc.user.toString() !== req.user?._id?.toString()) return res.status(403).json({ error: 'Not authorized' });
    res.json({ productName: tokenDoc.product?.title || 'Product' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Use a download token
router.get('/:token', async (req, res) => {
  try {
    const tokenDoc = await DownloadToken.findOne({ token: req.params.token }).populate('product');
    if (!tokenDoc) return res.status(404).json({ error: 'Invalid or expired token' });
    if (tokenDoc.expiresAt < new Date()) return res.status(410).json({ error: 'Token expired' });
    if (tokenDoc.used) return res.status(410).json({ error: 'Token already used' });

    const product = tokenDoc.product;
    if (!product) return res.status(404).json({ error: 'Product not found' });

    tokenDoc.used = true;
    await tokenDoc.save();

    if (product.fileType === 'link' && product.fileLink) {
      return res.redirect(product.fileLink);
    }

    if (product.filePath) {
      const fullPath = path.join(__dirname, '..', product.filePath);
      if (!fs.existsSync(fullPath)) return res.status(404).json({ error: 'File not found' });
      return res.download(fullPath, path.basename(product.filePath));
    }

    res.status(404).json({ error: 'No file available' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
