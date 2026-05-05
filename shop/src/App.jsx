import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ShopProvider } from './context/ShopContext';
import { AuthProvider } from './context/AuthContext';
import { AdminDataProvider } from './context/AdminDataContext';
import { AuthGateProvider } from './context/AuthGateContext';
import Header from './components/Header';
import Footer from './components/Footer';
import MobileBottomNav from './components/MobileBottomNav';
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import FavoritesPage from './pages/FavoritesPage';
import ProfilePage from './pages/ProfilePage';

// Admin pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBanners from './pages/admin/AdminBanners';
import AdminSales from './pages/admin/AdminSales';
import AdminPickupPoints from './pages/admin/AdminPickupPoints';
import AdminSalesAdmins from './pages/admin/AdminSalesAdmins';
import AdminOrders from './pages/admin/AdminOrders';
import AdminLowStock from './pages/admin/AdminLowStock';
import AdminPopular from './pages/admin/AdminPopular';
import AdminStores from './pages/admin/AdminStores';
import AdminStaffStats from './pages/admin/AdminStaffStats';

// Sayt qatlami (header + footer bilan)
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminDataProvider>
          <ShopProvider>
            <AuthGateProvider>
            <Routes>
              {/* Yashirin admin marshrutlar - /Tty0xssmart */}
              <Route path="/Tty0xssmart/login" element={<AdminLoginPage />} />
              <Route path="/Tty0xssmart" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="sales" element={<AdminSales />} />
                <Route path="pickup-points" element={<AdminPickupPoints />} />
                <Route path="sales-admins" element={<AdminSalesAdmins />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="low-stock" element={<AdminLowStock />} />
                <Route path="popular" element={<AdminPopular />} />
                <Route path="stores" element={<AdminStores />} />
                <Route path="my-stats" element={<AdminStaffStats />} />
              </Route>

              {/* Sayt routes — header/footer bilan */}
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/catalog" element={<PublicLayout><CatalogPage /></PublicLayout>} />
              <Route path="/product/:id" element={<PublicLayout><ProductPage /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/favorites" element={<PublicLayout><FavoritesPage /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />
              <Route path="*" element={
                <PublicLayout>
                  <div className="container-custom py-20 text-center">
                    <h1 className="text-4xl font-bold mb-2">404</h1>
                    <p className="text-gray-500">Sahifa topilmadi / Страница не найдена</p>
                  </div>
                </PublicLayout>
              } />
            </Routes>
            </AuthGateProvider>
          </ShopProvider>
        </AdminDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
