const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true },
  discountPercent: { type: Number, default: 0 },
  discountPrice: { type: Number, default: null },
  images: [String],
  fileType: { type: String, enum: ['file', 'link'], default: 'file' },
  filePath: String,
  fileLink: String,
  kofiLink: { type: String, default: '' },
  category: { type: String, default: 'General' },
  tag: { type: String, default: '' },
  visibility: {
    type: String,
    enum: ['public', 'unlisted', 'private'],
    default: 'public'
  },
  slug: { type: String, unique: true }
}, { timestamps: true });

productSchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + Date.now();
  }
  next();
});

productSchema.virtual('finalPrice').get(function() {
  if (this.discountPrice) return this.discountPrice;
  if (this.discountPercent > 0) return this.price * (1 - this.discountPercent / 100);
  return this.price;
});

module.exports = mongoose.model('Product', productSchema);
