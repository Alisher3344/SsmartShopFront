import { createContext, useContext, useState, useEffect } from 'react';

const ShopContext = createContext();

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};

export const ShopProvider = ({ children }) => {
  // Cart - localStorage'dan o'qib olamiz
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ssmart_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ssmart_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Har safar o'zgarganida localStorage'ga yozamiz
  useEffect(() => {
    localStorage.setItem('ssmart_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('ssmart_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Cart funksiyalari
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, delta, maxStock = Infinity) => {
    setCart(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = item.qty + delta;
        if (newQty < 1) return item;
        if (newQty > maxStock) return item; // stock'dan oshib ketmasin
        return { ...item, qty: newQty };
      }).filter(item => item.qty >= 1)
    );
  };

  const clearCart = () => setCart([]);

  const isInCart = (id) => cart.some(item => item.id === id);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Favorites funksiyalari
  const toggleFavorite = (product) => {
    setFavorites(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) return prev.filter(item => item.id !== product.id);
      return [...prev, product];
    });
  };

  const isFavorite = (id) => favorites.some(item => item.id === id);

  return (
    <ShopContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart, isInCart,
      cartTotal, cartCount,
      favorites, toggleFavorite, isFavorite,
    }}>
      {children}
    </ShopContext.Provider>
  );
};
