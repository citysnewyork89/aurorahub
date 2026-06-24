import React from 'react';

export default function TermsModal({ onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="modal-header">
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>Purchase Terms</h2>
          <button className="modal-close" onClick={onClose}><span className="material-icons">close</span></button>
        </div>
        <div className="modal-body" style={{ fontSize: 13, color: '#aaa', lineHeight: 1.9 }}>
          <p>By purchasing this product, the buyer agrees to the following Terms and Conditions:</p>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>1. Refund Policy</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Refunds are only available if the delivered file is defective, corrupted, or unusable due to an error on the seller's part.</li>
            <li>Refund requests based on a change of mind or after successful delivery will not be accepted.</li>
          </ul>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>2. Payments Under Review or On Hold</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Buyers may not request a refund while the payment is pending, under review, or on hold by the bank or payment provider.</li>
            <li>The buyer must wait until the payment has been approved or declined by the payment provider.</li>
          </ul>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>3. Product Delivery</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>The product file will only be delivered once the payment has been successfully received and credited to the seller's account.</li>
            <li>Files will not be delivered for payments that are pending, under review, or on hold.</li>
          </ul>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>After Purchase</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Every order is manually verified by the seller before delivery.</li>
            <li>The product will not be delivered until payment verification has been completed.</li>
            <li>During this verification period, the buyer may not cancel the order or request a refund.</li>
          </ul>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>Fraudulent Chargebacks or Claims</h3>
          <ul style={{ paddingLeft: '1.2rem' }}>
            <li>Buyers are strictly prohibited from opening false disputes, chargebacks, or refund claims after receiving the product.</li>
            <li>Any fraudulent activity may result in the permanent suspension of the license and loss of access to the product.</li>
          </ul>
          <h3 style={{ color: '#fff', marginTop: '1.2rem', marginBottom: '0.4rem', fontSize: 14 }}>License</h3>
          <p>The license is personal, non-transferable, and intended exclusively for the original purchaser. The buyer may not:</p>
          <ul style={{ paddingLeft: '1.2rem', marginTop: '0.4rem' }}>
            <li>Share the file with any third party.</li>
            <li>Give the product away for free.</li>
            <li>Resell the product to third parties.</li>
            <li>Transfer the license to another person.</li>
            <li>Grant access to the license or files to anyone else.</li>
            <li>Distribute or publish the product without the seller's prior written permission.</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>Violation of these terms may result in immediate termination of the license without refund.</p>
        </div>
      </div>
    </div>
  );
}
