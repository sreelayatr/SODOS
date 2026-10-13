import { Navigate, Route, Routes } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { RequireAuth } from './components/Guard';
import { SiteLayout } from './components/Layout';
import { Toaster } from './components/ui';
import { StoreProvider } from './context/Store';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Orders } from './pages/Orders';
import { Product } from './pages/Product';
import { Track } from './pages/Track';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminImages } from './pages/admin/Images';
import { AdminOrders } from './pages/admin/Orders';
import { AdminPayments } from './pages/admin/Payments';
import { AdminProducts } from './pages/admin/Products';
import { useTitle } from './lib/useTitle';
import { Link } from 'react-router-dom';

function NotFound() {
  useTitle('Not found');
  return (
    <div className="wrap page">
      <div className="empty">
        <h1>This page is no longer in the collection.</h1>
        <Link className="btn" to="/">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Toaster />
        <Routes>
          <Route path="login" element={<Login />} />
          <Route element={<SiteLayout />}>
            <Route index element={<Home />} />
            <Route path="dress/:id" element={<Product />} />
            <Route path="cart" element={<Cart />} />
            <Route
              path="checkout"
              element={
                <RequireAuth role="customer">
                  <Checkout />
                </RequireAuth>
              }
            />
            <Route
              path="orders"
              element={
                <RequireAuth role="customer">
                  <Orders />
                </RequireAuth>
              }
            />
            <Route
              path="track"
              element={
                <RequireAuth>
                  <Track />
                </RequireAuth>
              }
            />
            <Route
              path="track/:orderId"
              element={
                <RequireAuth>
                  <Track />
                </RequireAuth>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route
            path="admin"
            element={
              <RequireAuth role="admin">
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="images" element={<AdminImages />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="track" element={<Track />} />
            <Route path="track/:orderId" element={<Track />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
