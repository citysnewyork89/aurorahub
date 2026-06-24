const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, default: () => 'AH-' + uuidv4().slice(0,8).toUpperCase(), unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  discordId: String,
  discordUsername: String,
  robloxUsername: String,
  email: String,
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String,
    price: Number,
    discountPrice: Number,
    finalPrice: Number
  }],
  subtotal: Number,
  discountAmount: { type: Number, default: 0 },
  promoCode: String,
  total: Number,
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
  kofiTransactionId: String,
  kofiEmail: String,
  downloadsSent: { type: Boolean, default: false },
  pdfPath: String
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
