import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getWasteCollectionInfo } from '../utils/wasteCollectionUtils';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems,              setCartItems]              = useState([]);
  const [deliveryCharge,         setDeliveryCharge]         = useState(0);
  const [wasteCollectionSelected, setWasteCollectionSelected] = useState(false);

  // Persist cart to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('buildmart_cart');
      if (saved) setCartItems(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem('buildmart_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Cart actions
  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...product, quantity }];
    });
  };

  const removeFromCart  = (id)  => setCartItems(prev => prev.filter(i => i.id !== id));
  const clearCart       = ()    => { setCartItems([]); localStorage.removeItem('buildmart_cart'); };
  const updateDeliveryCharge = (c) => setDeliveryCharge(c);
  const toggleWasteCollection   = ()    => setWasteCollectionSelected(p => !p);

  const updateQuantity = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };

  // Derived totals
  const subtotal   = useMemo(() => cartItems.reduce((t, i) => t + i.basePrice * i.quantity, 0), [cartItems]);
  const cartCount  = useMemo(() => cartItems.reduce((t, i) => t + i.quantity, 0), [cartItems]);

  // Waste collection — uses existing util, safe fallback if util missing
  const wasteCollectionInfo = useMemo(() => {
    try {
      return getWasteCollectionInfo(subtotal + deliveryCharge, wasteCollectionSelected);
    } catch {
      return { isSelected: wasteCollectionSelected, fee: 0, isFree: false, displayText: '', whatsappText: '', invoiceText: '' };
    }
  }, [subtotal, deliveryCharge, wasteCollectionSelected]);

  const wasteCollectionFee    = wasteCollectionInfo.fee    ?? 0;
  const wasteCollectionIsFree = wasteCollectionInfo.isFree ?? false;
  const grandTotal = subtotal + deliveryCharge + (wasteCollectionSelected ? wasteCollectionFee : 0);

  return (
    <CartContext.Provider value={{
      // state
      cartItems, cartCount,
      subtotal, deliveryCharge, grandTotal,
      // waste collection
      wasteCollectionSelected, wasteCollectionInfo,
      wasteCollectionFee, wasteCollectionIsFree,
      toggleWasteCollection,
      // actions
      addToCart, removeFromCart, updateQuantity, clearCart, updateDeliveryCharge,
    }}>
      {children}
    </CartContext.Provider>
  );
};
