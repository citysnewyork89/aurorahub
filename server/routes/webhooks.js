const router = require('express').Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const DownloadToken = require('../models/DownloadToken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

// Ko-fi sends data as form-encoded "data" field (JSON string)
router.post('/kofi', async (req, res) => {
  try {
    const raw = req.body?.data;
    if (!raw) return res.sendStatus(400);
    const data = JSON.parse(raw);

    // Verify token
    if (data.verification_token !== process.env.KOFI_VERIFICATION_TOKEN) {
      return res.sendStatus(401);
    }

    // Only handle shop orders
    if (data.type !== 'Shop Order') return res.sendStatus(200);

    // Find pending order by email match (Ko-fi sends buyer email)
    const order = await Order.findOne({ email: data.email, status: 'pending' })
      .sort({ createdAt: -1 })
      .populate('items.product')
      .populate('user');

    if (!order) return res.sendStatus(200);

    order.status = 'paid';
    order.kofiTransactionId = data.kofi_transaction_id;
    order.kofiEmail = data.email;
    await order.save();

    // Generate PDF receipt
    await generatePDF(order);

    // Send Discord DMs
    const { sendPurchaseDM } = require('../utils/discordBot');
    await sendPurchaseDM(order);

    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

async function generatePDF(order) {
  return new Promise((resolve, reject) => {
    const dir = './uploads/receipts';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const filePath = `${dir}/receipt-${order.orderId}.pdf`;

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Logo
    const logoPath = path.join(__dirname, '../assets/logo-black.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 50, 45, { width: 120 });
    }

    // Title
    doc.fontSize(22).font('Helvetica-Bold').text('Purchase Invoice', 0, 50, { align: 'center' });
    doc.moveDown(3);

    // Order details
    doc.fontSize(11).font('Helvetica-Bold').text('Order Details', 50);
    doc.font('Helvetica').fontSize(10);
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString('en-GB')}`);
    doc.text(`Ko-fi Transaction: ${order.kofiTransactionId || 'N/A'}`);
    doc.moveDown();

    // Buyer
    doc.font('Helvetica-Bold').fontSize(11).text('Buyer Information');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Discord: ${order.discordUsername}`);
    doc.text(`Roblox: ${order.robloxUsername}`);
    doc.text(`Email: ${order.email}`);
    doc.moveDown();

    // Products table
    doc.font('Helvetica-Bold').fontSize(11).text('Products');
    doc.moveDown(0.5);
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Product', 50, tableTop);
    doc.text('Original', 350, tableTop);
    doc.text('Final', 460, tableTop);
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown();

    doc.font('Helvetica').fontSize(10);
    order.items.forEach(item => {
      const y = doc.y;
      doc.text(item.title, 50, y, { width: 280 });
      doc.text(`€${item.price.toFixed(2)}`, 350, y);
      doc.text(`€${item.finalPrice.toFixed(2)}`, 460, y);
      doc.moveDown();
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    // Totals
    doc.font('Helvetica').text(`Subtotal: €${order.subtotal.toFixed(2)}`, { align: 'right' });
    if (order.discountAmount > 0) {
      doc.text(`Discount (${order.promoCode}): -€${order.discountAmount.toFixed(2)}`, { align: 'right' });
    }
    doc.font('Helvetica-Bold').fontSize(12).text(`Total paid: €${order.total.toFixed(2)}`, { align: 'right' });
    doc.moveDown(2);

    doc.fontSize(9).font('Helvetica').fillColor('#888')
      .text('Thank you for your purchase at aurorahub. This document confirms your order.', { align: 'center' });
    doc.text('© 2026 aurorahub. All rights reserved.', { align: 'center' });

    doc.end();
    stream.on('finish', () => {
      order.pdfPath = `/uploads/receipts/receipt-${order.orderId}.pdf`;
      order.save().then(resolve).catch(reject);
    });
    stream.on('error', reject);
  });
}

module.exports = router;
module.exports.generatePDF = generatePDF;
