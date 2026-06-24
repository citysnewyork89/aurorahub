const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Product = require('../models/Product');
const { isAdmin } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = file.fieldname === 'images' ? './uploads/images' : './uploads/files';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
  }
});
const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

// GET all public products
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = { visibility: 'public' };
    if (search) query.title = { $regex: search, $options: 'i' };
    if (category && category !== 'all') query.category = category;
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const cats = await Product.distinct('category', { visibility: 'public' });
    res.json(cats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single product by slug
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });
    if (!product) return res.status(404).json({ error: 'Not found' });
    if (product.visibility === 'private') return res.status(403).json({ error: 'Private' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: create product
router.post('/', isAdmin, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'files', maxCount: 10 }
]), async (req, res) => {
  try {
    const { title, description, price, discountPercent, discountPrice, kofiLink, category, tag, visibility, fileType, fileLink } = req.body;
    const images = req.files?.images?.map(f => '/uploads/images/' + f.filename) || [];
    const filePaths = req.files?.files?.map(f => '/uploads/files/' + f.filename) || [];
    const product = await Product.create({
      title, description, price: parseFloat(price),
      discountPercent: parseFloat(discountPercent) || 0,
      discountPrice: discountPrice ? parseFloat(discountPrice) : null,
      images, kofiLink, category: category || 'General', tag, visibility: visibility || 'public',
      fileType: fileType || 'file',
      filePath: filePaths[0] || null,
      fileLink: fileLink || null
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: update product
router.put('/:id', isAdmin, upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'files', maxCount: 10 }
]), async (req, res) => {
  try {
    const updates = { ...req.body };
    if (req.files?.images?.length) updates.images = req.files.images.map(f => '/uploads/images/' + f.filename);
    if (req.files?.files?.length) updates.filePath = '/uploads/files/' + req.files.files[0].filename;
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: delete product
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
