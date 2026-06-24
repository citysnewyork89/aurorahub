const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const downloadTokenSchema = new mongoose.Schema({
  token: { type: String, default: uuidv4, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) },
  used: { type: Boolean, default: false }
});

downloadTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('DownloadToken', downloadTokenSchema);
