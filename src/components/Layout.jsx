import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';
import { BrandLogo } from './BrandLogo';

export function SiteLayout() {
  const { user, cartCount, logout } = useStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const accountTo = user?.role === 'admin' ? '/admin' : user ? '/orders' : '/login';

  useEffect(() => {
    setOpen(false);
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.hash]);

  return (
    <div className="site">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <button
            className="nav-toggle"
            type="button"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="menu-lines" aria-hidden="true" />
          </button>
          <Link to="/" className="wordmark" aria-label="Sodos home">
            <BrandLogo className="header-logo" />
          </Link>
          <div className="header-actions">
            <Link to={{ pathname: '/', hash: '#shop' }} aria-label="Search">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="11" cy="11" r="6.25" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 16.5L20 20.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
            <Link to="/cart" className="bag-link desktop-only" aria-label={`Bag, ${cartCount} ${cartCount === 1 ? 'item' : 'items'}`}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6.5 8.5h11l-.8 11h-9.4l-.8-11Z" stroke="currentColor" strokeWidth="1.6" />
                <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" stroke="currentColor" strokeWidth="1.6" />
              </svg>
              {cartCount > 0 && <span className="bag-count">{cartCount}</span>}
            </Link>
            <Link to={accountTo} aria-label={user ? 'Account' : 'Profile'}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.6" />
                <path d="M5.5 19.2c1.3-2.6 3.6-3.9 6.5-3.9s5.2 1.3 6.5 3.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </Link>
          </div>
          {open && <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={() => setOpen(false)} />}
          <nav className={open ? 'nav open' : 'nav'}>
            <button className="nav-close" type="button" onClick={() => setOpen(false)}>
              Close
            </button>
            <NavLink to="/" end>
              Shop
            </NavLink>
            <Link to="/?tab=Tailoring#shop">Tailoring</Link>
            <Link to="/?tab=Shirts#shop">Shirts</Link>
            <Link to="/?tab=Outerwear#shop">Outerwear</Link>
            {user?.role === 'customer' && <NavLink to="/orders">Orders</NavLink>}
            {user && <NavLink to="/track">Track</NavLink>}
            {user?.role === 'admin' && <NavLink to="/admin">Back office</NavLink>}
            {user ? (
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
            ) : (
              <NavLink to="/login">Sign in</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main id="main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Main">
        <div className="tabbar-main">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'on' : undefined)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Home
          </NavLink>
          <button type="button" onClick={() => setOpen(true)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 7h8M4 12h6M14 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 0 2.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Menu
          </button>
          <Link to="/?view=new#shop">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3.5 13.2 8h4.6l-3.7 2.8 1.4 4.5L12 12.6 8.5 15.3l1.4-4.5L6.2 8h4.6L12 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
            </svg>
            New
          </Link>
          <Link to="/cart" className={location.pathname === '/cart' ? 'on' : undefined}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7 8h10l-.7 11H7.7L7 8Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9 8V7a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            Bag
            {cartCount > 0 && <span className="tab-count">{cartCount}</span>}
          </Link>
        </div>
        <Link className="tabbar-side" to={{ pathname: '/', hash: '#studio' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 10.5h16M6 10.5V19h12v-8.5M4 10.5 6 6h12l2 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>
          Studio
        </Link>
      </nav>
      <footer className="site-footer" id="studio">
        <div className="wrap footer-grid">
          <div className="foot-brand">
            <BrandLogo className="footer-logo" />
            <p>Modern menswear. The house of premium.</p>
          </div>
          <div>
            <h2>Shop</h2>
            <Link to="/">All clothing</Link>
            <Link to="/?tab=Tailoring#shop">Tailoring</Link>
            <Link to="/?tab=Shirts#shop">Shirts</Link>
            <Link to="/?tab=Outerwear#shop">Outerwear</Link>
          </div>
          <div>
            <h2>Help</h2>
            <Link to="/track">Track an order</Link>
            <Link to="/orders">Order history</Link>
            <Link to="/cart">Your bag</Link>
            <Link to="/login">Sign in</Link>
          </div>
          <div>
            <h2>Studio</h2>
            <p>Bengaluru · Mumbai</p>
            <p>hello@sudos.com</p>
            <Link to="/login" state={{ role: 'admin' }}>
              Admin
            </Link>
          </div>
        </div>
        <div className="wrap foot-note">
          <span>© {new Date().getFullYear()} Sodos</span>
          <span>A demonstration boutique. Orders stay in this browser.</span>
        </div>
      </footer>
    </div>
  );
}
