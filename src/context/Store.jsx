import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSeed } from '../data/seed';
import { CATEGORIES, FREE_SHIPPING, SHIPPING_FEE, SIZES, productError, statusLabel } from '../lib/format';

const KEY = 'sudos-store-v5';
const StoreContext = createContext(null);

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.version === 5 && Array.isArray(parsed.products) && Array.isArray(parsed.orders)) {
        return parsed;
      }
    }
  } catch {
    /* use a fresh boutique if stored data is unreadable */
  }
  return createSeed();
}

function cartKey(state) {
  const user = state.users.find((item) => item.id === state.currentUserId);
  return user?.role === 'customer' ? user.id : 'guest';
}

function capLines(lines, products) {
  return lines.flatMap((line) => {
    const product = products.find((item) => item.id === line.productId);
    if (!product || product.stock < 1) return [];
    return [{ ...line, qty: Math.min(line.qty, product.stock) }];
  });
}

function mergeLines(current = [], incoming = []) {
  const out = current.map((line) => ({ ...line }));
  incoming.forEach((line) => {
    const found = out.find((item) => item.productId === line.productId && item.size === line.size);
    if (found) found.qty += line.qty;
    else out.push({ ...line });
  });
  return out;
}

function sanitizeProduct(data, id, prev) {
  const sizes = SIZES.filter((size) => (data.sizes || []).includes(size));
  return {
    id,
    name: String(data.name || '').trim(),
    price: Math.round(Number(data.price)),
    category: CATEGORIES.includes(data.category) ? data.category : 'Essentials',
    color: String(data.color || '').trim(),
    fabric: String(data.fabric || '').trim(),
    description: String(data.description || '').trim(),
    image: String(data.image || '').trim(),
    sizes: sizes.length ? sizes : ['S', 'M', 'L'],
    stock: Math.max(0, Math.round(Number(data.stock) || 0)),
    featured: Boolean(data.featured),
    createdAt: prev?.createdAt || new Date().toISOString(),
  };
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(load);
  const [toasts, setToasts] = useState([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const commit = (next) => {
    stateRef.current = next;
    setState(next);
  };

  const toast = (message) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2800);
  };

  const api = useMemo(() => {
    const login = (email, password, expectedRole) => {
      const s = stateRef.current;
      const clean = email.trim().toLowerCase();
      const user = s.users.find((item) => item.email === clean && item.password === password);
      if (!user) return { ok: false, error: 'Those details do not match an account.' };
      if (expectedRole && user.role !== expectedRole) {
        return {
          ok: false,
          error:
            user.role === 'admin'
              ? 'This is an admin account. Switch to the Admin tab.'
              : 'This is a customer account. Switch to the Customer tab.',
        };
      }
      const merged =
        user.role === 'customer'
          ? capLines(mergeLines(s.carts[user.id], s.carts.guest), s.products)
          : s.carts[user.id] || [];
      commit({
        ...s,
        currentUserId: user.id,
        carts: { ...s.carts, guest: user.role === 'customer' ? [] : s.carts.guest, [user.id]: merged },
      });
      return { ok: true, user };
    };

    const logout = () => commit({ ...stateRef.current, currentUserId: null });

    const register = ({ name, email, password }) => {
      const s = stateRef.current;
      const clean = email.trim().toLowerCase();
      const trimmed = name.trim();
      if (trimmed.length < 2) return { ok: false, error: 'Enter your name.' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return { ok: false, error: 'Enter a valid email.' };
      if (!password || password.length < 6) return { ok: false, error: 'Use a password of at least 6 characters.' };
      if (s.users.some((item) => item.email === clean)) {
        return { ok: false, error: 'An account with this email already exists.' };
      }
      const user = {
        id: `c${Math.random().toString(36).slice(2, 8)}`,
        name: trimmed,
        email: clean,
        password,
        role: 'customer',
        phone: '',
        address: null,
      };
      const bag = capLines(s.carts.guest || [], s.products);
      commit({
        ...s,
        users: [...s.users, user],
        currentUserId: user.id,
        carts: { ...s.carts, guest: [], [user.id]: bag },
      });
      return { ok: true, user };
    };

    const addToCart = (productId, size, qty = 1) => {
      const s = stateRef.current;
      const user = s.users.find((item) => item.id === s.currentUserId);
      if (user?.role === 'admin') return { ok: false, error: 'Sign in with a customer account to shop.' };
      const product = s.products.find((item) => item.id === productId);
      if (!product) return { ok: false, error: 'That item is no longer listed.' };
      if (!size || !product.sizes.includes(size)) return { ok: false, error: 'Choose a size.' };
      if (product.stock < 1) return { ok: false, error: 'This item is sold out.' };
      const key = cartKey(s);
      const lines = (s.carts[key] || []).map((line) => ({ ...line }));
      const index = lines.findIndex((line) => line.productId === productId && line.size === size);
      const existing = index >= 0 ? lines[index].qty : 0;
      if (existing + qty > product.stock) {
        return { ok: false, error: `Only ${product.stock} available${size ? ` in size ${size}` : ''}.` };
      }
      if (index >= 0) lines[index].qty = existing + qty;
      else {
        lines.push({
          id: `l${Math.random().toString(36).slice(2, 9)}`,
          productId,
          size,
          qty,
        });
      }
      commit({ ...s, carts: { ...s.carts, [key]: lines } });
      return { ok: true };
    };

    const updateQty = (lineId, qty) => {
      const s = stateRef.current;
      const key = cartKey(s);
      const lines = (s.carts[key] || []).map((line) => {
        if (line.id !== lineId) return line;
        const product = s.products.find((item) => item.id === line.productId);
        const max = product ? Math.max(product.stock, 1) : qty;
        return { ...line, qty: Math.max(1, Math.min(qty, max)) };
      });
      commit({ ...s, carts: { ...s.carts, [key]: lines } });
    };

    const removeFromCart = (lineId) => {
      const s = stateRef.current;
      const key = cartKey(s);
      commit({
        ...s,
        carts: { ...s.carts, [key]: (s.carts[key] || []).filter((line) => line.id !== lineId) },
      });
    };

    const placeOrder = ({ location, note, payment }) => {
      const s = stateRef.current;
      const user = s.users.find((item) => item.id === s.currentUserId);
      if (!user || user.role !== 'customer') {
        return { ok: false, error: 'Sign in as a customer to place an order.' };
      }
      const cart = s.carts[user.id] || [];
      if (!cart.length) return { ok: false, error: 'Your bag is empty.' };

      const products = s.products.map((item) => ({ ...item }));
      const items = [];
      for (const entry of cart) {
        const product = products.find((item) => item.id === entry.productId);
        if (!product) return { ok: false, error: 'An item in your bag is no longer available.' };
        if (product.stock < entry.qty) {
          return { ok: false, error: `Only ${product.stock} left of ${product.name}.` };
        }
        product.stock -= entry.qty;
        items.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          size: entry.size,
          qty: entry.qty,
          image: product.image,
        });
      }

      const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
      const shipping = subtotal >= FREE_SHIPPING ? 0 : SHIPPING_FEE;
      const amount = subtotal + shipping;
      const seq = s.seq + 1;
      const now = new Date().toISOString();
      const savedLocation = {
        fullName: location.fullName.trim(),
        phone: location.phone.trim(),
        line1: location.line1.trim(),
        city: location.city.trim(),
        state: location.state,
        pincode: location.pincode.trim(),
      };
      const order = {
        id: `SD-${seq}`,
        customerId: user.id,
        customerName: user.name,
        customerEmail: user.email,
        items,
        location: savedLocation,
        note: (note || '').trim(),
        payment: {
          method: payment.method,
          label: payment.label,
          status: payment.method === 'cod' ? 'cod_due' : 'pending_review',
          amount,
          note: '',
          reviewedAt: null,
        },
        status: 'placed',
        carrier: '',
        trackingNo: '',
        history: [{ status: 'placed', at: now, note: 'Order placed' }],
        createdAt: now,
      };

      commit({
        ...s,
        seq,
        products,
        orders: [order, ...s.orders],
        carts: { ...s.carts, [user.id]: [] },
        users: s.users.map((item) =>
          item.id === user.id
            ? { ...item, phone: savedLocation.phone, address: location.save ? savedLocation : item.address }
            : item,
        ),
      });
      return { ok: true, order };
    };

    const addProduct = (data) => {
      const product = sanitizeProduct(data, `d${Math.random().toString(36).slice(2, 8)}`);
      const error = productError(product);
      if (error) return { ok: false, error };
      commit({ ...stateRef.current, products: [product, ...stateRef.current.products] });
      return { ok: true, product };
    };

    const updateProduct = (id, data) => {
      const s = stateRef.current;
      const prev = s.products.find((item) => item.id === id);
      if (!prev) return { ok: false, error: 'That item was not found.' };
      const product = sanitizeProduct(data, id, prev);
      const error = productError(product);
      if (error) return { ok: false, error };
      commit({
        ...s,
        products: s.products.map((item) => (item.id === id ? product : item)),
      });
      return { ok: true, product };
    };

    const deleteProduct = (id) => {
      const s = stateRef.current;
      const carts = {};
      Object.entries(s.carts).forEach(([key, lines]) => {
        carts[key] = lines.filter((line) => line.productId !== id);
      });
      commit({
        ...s,
        products: s.products.filter((item) => item.id !== id),
        carts,
      });
    };

    const updateLookbook = (patch) => {
      commit({ ...stateRef.current, lookbook: { ...stateRef.current.lookbook, ...patch } });
    };

    const updateOrder = (id, patch) => {
      const s = stateRef.current;
      const orders = s.orders.map((order) => {
        if (order.id !== id) return order;
        const now = new Date().toISOString();
        const next = {
          ...order,
          status: patch.status || order.status,
          carrier: patch.carrier ?? order.carrier,
          trackingNo: patch.trackingNo ?? order.trackingNo,
        };
        if (patch.status && patch.status !== order.status) {
          next.history = [
            ...order.history,
            {
              status: patch.status,
              at: now,
              note: patch.eventNote || statusLabel(patch.status),
            },
          ];
        } else if (patch.eventNote) {
          next.history = [...order.history, { status: order.status, at: now, note: patch.eventNote }];
        }
        return next;
      });
      commit({ ...s, orders });
    };

    const reviewPayment = (id, status, note) => {
      const s = stateRef.current;
      const orders = s.orders.map((order) => {
        if (order.id !== id) return order;
        const message =
          status === 'reviewed' ? 'Payment reviewed' : status === 'on_hold' ? 'Payment placed on hold' : 'Payment updated';
        return {
          ...order,
          payment: {
            ...order.payment,
            status,
            note: note ?? order.payment.note,
            reviewedAt: new Date().toISOString(),
          },
          history: [...order.history, { status: order.status, at: new Date().toISOString(), note: message }],
        };
      });
      commit({ ...s, orders });
    };

    const resetDemo = () => {
      commit(createSeed());
      toast('Sample boutique restored.');
    };

    return {
      login,
      logout,
      register,
      addToCart,
      updateQty,
      removeFromCart,
      placeOrder,
      addProduct,
      updateProduct,
      deleteProduct,
      updateLookbook,
      updateOrder,
      reviewPayment,
      resetDemo,
      toast,
    };
  }, []);

  const user = state.users.find((item) => item.id === state.currentUserId) || null;
  const key = user?.role === 'customer' ? user.id : 'guest';
  const cart = (state.carts[key] || [])
    .map((line) => ({ ...line, product: state.products.find((item) => item.id === line.productId) }))
    .filter((line) => line.product);
  const cartCount = cart.reduce((sum, line) => sum + line.qty, 0);
  const myOrders =
    user?.role === 'customer' ? state.orders.filter((order) => order.customerId === user.id) : state.orders;

  const value = {
    ...state,
    user,
    cart,
    cartCount,
    myOrders,
    toasts,
    ...api,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
