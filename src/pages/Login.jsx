import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../context/Store';
import { useTitle } from '../lib/useTitle';
import { BrandLogo } from '../components/BrandLogo';

const DEMOS = [
  { role: 'customer', name: 'Ananya Rao', email: 'ananya@sudos.com', password: 'customer123' },
  { role: 'customer', name: 'Meera Shah', email: 'meera@sudos.com', password: 'customer123' },
  { role: 'admin', name: 'Studio admin', email: 'admin@sudos.com', password: 'admin123' },
];

export function Login() {
  useTitle('Sign in');
  const { user, login, register } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(location.state?.role === 'admin' ? 'admin' : 'customer');
  const [mode, setMode] = useState('in');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    const from = location.state?.from;
    if (user.role === 'admin') navigate('/admin', { replace: true });
    else navigate(from || '/', { replace: true });
  }, [user, location.state, navigate]);

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function submit(event) {
    event.preventDefault();
    setError('');
    const result =
      mode === 'up' && role === 'customer'
        ? register(form)
        : login(form.email, form.password, role);
    if (!result.ok) setError(result.error);
  }

  return (
    <div className="auth">
      <aside className="auth-brand">
        <BrandLogo className="auth-logo" />
        <h1>Style, built for the modern man.</h1>
        <p>Shop considered menswear, manage your orders, and follow every delivery from the Sudos studio.</p>
      </aside>
      <div className="auth-panel">
        <div className="tabs" role="tablist">
          <button type="button" className={role === 'customer' ? 'tab on' : 'tab'} onClick={() => setRole('customer')}>
            Customer
          </button>
          <button
            type="button"
            className={role === 'admin' ? 'tab on' : 'tab'}
            onClick={() => {
              setRole('admin');
              setMode('in');
            }}
          >
            Admin
          </button>
        </div>
        <h2>{mode === 'up' ? 'Create an account' : role === 'admin' ? 'Admin login' : 'Customer login'}</h2>
        <form onSubmit={submit} className="stack" noValidate>
          {mode === 'up' && (
            <label className="field">
              Name
              <input value={form.name} onChange={(event) => setField('name', event.target.value)} />
            </label>
          )}
          <label className="field">
            Email
            <input
              type="email"
              autoComplete="username"
              value={form.email}
              onChange={(event) => setField('email', event.target.value)}
            />
          </label>
          <label className="field">
            Password
            <input
              type="password"
              autoComplete={mode === 'up' ? 'new-password' : 'current-password'}
              value={form.password}
              onChange={(event) => setField('password', event.target.value)}
            />
          </label>
          {error && <p className="error">{error}</p>}
          <button className="btn full" type="submit">
            {mode === 'up' ? 'Create account' : 'Sign in'}
          </button>
        </form>
        {role === 'customer' && (
          <button className="text-btn" type="button" onClick={() => setMode(mode === 'up' ? 'in' : 'up')}>
            {mode === 'up' ? 'Already have an account? Sign in' : 'New here? Create an account'}
          </button>
        )}
        <div className="demos">
          <p className="eyebrow">Demo accounts</p>
          {DEMOS.filter((item) => item.role === role).map((item) => (
            <button
              key={item.email}
              type="button"
              className="demo"
              onClick={() => {
                setMode('in');
                setForm({ name: '', email: item.email, password: item.password });
                setError('');
              }}
            >
              <strong>{item.name}</strong>
              <span>
                {item.email} · {item.password}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
