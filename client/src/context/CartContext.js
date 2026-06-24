import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);

  const add = (product) => {
    if (!items.find(i => i._id === product._id)) setItems(p => [...p, product]);
    setOpen(true);
  };
  const remove = (id) => setItems(p => p.filter(i => i._id !== id));
  const clear = () => setItems([]);
  const total = items.reduce((sum, i) => sum + (i.discountPrice || i.price), 0);

  return (
    <CartContext.Provider value={{ items, add, remove, clear, total, open, setOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
