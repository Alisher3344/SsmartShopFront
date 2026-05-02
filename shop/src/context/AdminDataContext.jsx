import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { bannersApi, pickupPointsApi, productsApi, resolveImage, storesApi } from '../api/client';

const AdminDataContext = createContext();

export const useAdminData = () => {
  const ctx = useContext(AdminDataContext);
  if (!ctx) throw new Error('useAdminData must be used within AdminDataProvider');
  return ctx;
};

// Backend rasm yo'lini absolyut URL'ga aylantirib ProductCard/ProductPage va h.k. uchun normallashtiramiz.
const normalizeProduct = (p) => ({
  ...p,
  image: resolveImage(p.image),
});

const normalizeBanner = (b) => ({
  ...b,
  image: resolveImage(b.image),
});

export const AdminDataProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [banners, setBanners] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, bans, points, sts] = await Promise.all([
        productsApi.list(),
        bannersApi.list(),
        pickupPointsApi.list(),
        storesApi.list().catch(() => []),
      ]);
      setProducts(prods.map(normalizeProduct));
      setBanners(bans.map(normalizeBanner));
      setPickupPoints(points);
      setStores(sts);
    } catch (e) {
      setError(e.message || 'Backend bilan bog\'lanib bo\'lmadi');
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== STORES =====
  const addStore = async (data) => {
    const created = await storesApi.create(data);
    setStores(prev => [...prev, created]);
    return created;
  };
  const updateStore = async (id, data) => {
    const updated = await storesApi.update(id, data);
    setStores(prev => prev.map(s => (s.id === id ? updated : s)));
    return updated;
  };
  const deleteStore = async (id) => {
    await storesApi.delete(id);
    setStores(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ===== MAHSULOTLAR =====
  const addProduct = async (product) => {
    const created = await productsApi.create(product);
    setProducts(prev => [normalizeProduct(created), ...prev]);
    return created;
  };

  const updateProduct = async (id, updates) => {
    const updated = await productsApi.update(id, updates);
    setProducts(prev => prev.map(p => (p.id === id ? normalizeProduct(updated) : p)));
    return updated;
  };

  const deleteProduct = async (id) => {
    await productsApi.delete(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleSale = async (id) => {
    const updated = await productsApi.toggleSale(id);
    setProducts(prev => prev.map(p => (p.id === id ? normalizeProduct(updated) : p)));
  };

  const togglePopular = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    const updated = await productsApi.update(id, { isPopular: !product.isPopular });
    setProducts(prev => prev.map(p => (p.id === id ? normalizeProduct(updated) : p)));
  };

  // ===== BANNERLAR =====
  const addBanner = async (banner) => {
    const created = await bannersApi.create(banner);
    setBanners(prev => [normalizeBanner(created), ...prev]);
    return created;
  };

  const updateBanner = async (id, updates) => {
    const updated = await bannersApi.update(id, updates);
    setBanners(prev => prev.map(b => (b.id === id ? normalizeBanner(updated) : b)));
  };

  const deleteBanner = async (id) => {
    await bannersApi.delete(id);
    setBanners(prev => prev.filter(b => b.id !== id));
  };

  const toggleBannerActive = async (id) => {
    const updated = await bannersApi.toggleActive(id);
    setBanners(prev => prev.map(b => (b.id === id ? normalizeBanner(updated) : b)));
  };

  // ===== PICKUP POINTS =====
  const addPickupPoint = async (data) => {
    const created = await pickupPointsApi.create(data);
    setPickupPoints(prev => [...prev, created]);
    return created;
  };

  const updatePickupPoint = async (id, updates) => {
    const updated = await pickupPointsApi.update(id, updates);
    setPickupPoints(prev => prev.map(p => (p.id === id ? updated : p)));
    return updated;
  };

  const deletePickupPoint = async (id) => {
    await pickupPointsApi.delete(id);
    setPickupPoints(prev => prev.filter(p => p.id !== id));
  };

  const value = useMemo(() => ({
    products,
    banners,
    pickupPoints,
    stores,
    activeBanners: banners.filter(b => b.active),
    activePickupPoints: pickupPoints.filter(p => p.active),
    activeStores: stores.filter(s => s.active),
    saleProducts: products.filter(p => p.onSale),
    popularProducts: products.filter(p => p.isPopular),
    loading,
    error,
    refresh,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleSale,
    togglePopular,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    addPickupPoint,
    updatePickupPoint,
    deletePickupPoint,
    addStore,
    updateStore,
    deleteStore,
  }), [products, banners, pickupPoints, stores, loading, error, refresh]);

  return <AdminDataContext.Provider value={value}>{children}</AdminDataContext.Provider>;
};
