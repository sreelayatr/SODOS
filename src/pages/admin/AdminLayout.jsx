import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/Store';
import { BrandLogo } from '../../components/BrandLogo';

const LINKS = [
  ['/admin', 'Overview', true],
  ['/admin/orders', 'Orders', false],
  ['/admin/products', 'Catalog', false],
  ['/admin/images', 'Images', false],
  ['/admin/payments', 'Payments', false],
  ['/admin/track', 'Tracking', false],
];

export function AdminLayout() {
  const { user, logout, resetDemo } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="admin-shell">
      <aside className="side">
        <div>
          <p className="eyebrow">Back office</p>
          <NavLink to="/admin" className="logo" end aria-label="Sodos admin overview">
            <BrandLogo className="admin-logo" />
          </NavLink>
        </div>
        <nav className="side-nav">
          {LINKS.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="side-foot">
          <p>{user?.name}</p>
          <NavLink to="/">View shop</NavLink>
          <button
            className="text-btn"
            type="button"
            onClick={() => {
              if (window.confirm('Restore the sample products, orders, and accounts?')) {
                resetDemo();
                navigate('/login');
              }
            }}
          >
            Restore sample data
          </button>
          <button
            className="text-btn"
            type="button"
            onClick={() => {
              logout();
              navigate('/');
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <Outlet />
      </div>
    </div>
  );
}
