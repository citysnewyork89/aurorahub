const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  discountValue: { type: Number, required: true },
  applicableTo: { type: String, enum: ['all', 'specific'], default: 'all' },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  expiresAt: { type: Date },
  active: { type: Boolean, default: true },
  usageCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Promo', promoSchema);
