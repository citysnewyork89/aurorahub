import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';

export default function ProductCard({ product, showPrice = true, onClick }) {
  const nav = useNavigate();
  const imgSrc = product.images?.[0] ? `${API_URL}${product.images[0]}` : null;
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPercent > 0 || product.discountPrice;

  const handleClick = () => {
    if (onClick) return onClick(product);
    nav(`/product/${product.slug}`);
  };

  return (
    <div className="product-card" onClick={handleClick}>
      {imgSrc
        ? <img className="product-card-img" src={imgSrc} alt={product.title} />
        : <div className="product-card-no-img"><span className="material-icons" style={{ fontSize: 40 }}>hide_image</span></div>
      }
      {product.tag && <div className="product-card-tag">{product.tag}</div>}
      <div className="product-card-bottom">
        <div className="product-card-title">{product.title}</div>
        {showPrice && (
          <div className="product-card-price">
            {hasDiscount && <span style={{ textDecoration: 'line-through', marginRight: 6, opacity: 0.5 }}>€{product.price.toFixed(2)}</span>}
            €{price.toFixed(2)}
          </div>
        )}
      </div>
    </div>
  );
}
