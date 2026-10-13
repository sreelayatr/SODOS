import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { OrderTracker } from '../components/OrderTracker';
import { Empty, Pill } from '../components/ui';
import { useStore } from '../context/Store';
import { formatDate, money, statusLabel } from '../lib/format';
import { useTitle } from '../lib/useTitle';

export function Track() {
  useTitle('Track order');
  const { orderId } = useParams();
  const location = useLocation();
  const { user, orders, myOrders } = useStore();
  const navigate = useNavigate();
  const list = user?.role === 'admin' ? orders : myOrders;
  const [query, setQuery] = useState(orderId || '');
  const [miss, setMiss] = useState('');
  const base = location.pathname.startsWith('/admin') ? '/admin' : '';

  useEffect(() => {
    if (orderId) setQuery(orderId.toUpperCase());
  }, [orderId]);
  const order = orderId ? orders.find((item) => item.id.toLowerCase() === orderId.toLowerCase()) : null;
  const owned = order && (user?.role === 'admin' || order.customerId === user?.id);

  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="eyebrow">Tracking</p>
        <h1>Track the order</h1>
      </header>
      <form
        className="lookup"
        onSubmit={(event) => {
          event.preventDefault();
          const found = list.find((item) => item.id.toLowerCase() === query.trim().toLowerCase());
          if (!found) {
            setMiss('No order with that number was found on this account.');
            return;
          }
          setMiss('');
          navigate(`${base}/track/${found.id}`);
        }}
      >
        <label className="field grow">
          Order number
          <input value={query} placeholder="SD-1904" onChange={(event) => setQuery(event.target.value.toUpperCase())} />
        </label>
        <button className="btn" type="submit">
          Look up
        </button>
      </form>
      {miss && <p className="error">{miss}</p>}

      {location.state?.placed && order && (
        <p className="banner">Order {order.id} is placed. Keep this number to track it.</p>
      )}

      {orderId && !order && <Empty title="No order with that number." text="Check the order number and try again." />}
      {order && !owned && <Empty title="This order is not on your account." />}
      {order && owned && <OrderTracker order={order} manage={user?.role === 'admin'} />}

      {!orderId && (
        <section className="stack">
          <h2>{user?.role === 'admin' ? 'All customer orders' : 'Your orders'}</h2>
          {list.length === 0 ? (
            <Empty title="Nothing to track yet." />
          ) : (
            <ul className="order-list">
              {list.map((item) => (
                <li key={item.id} className="order-row">
                  <div>
                    <p className="eyebrow">{item.id}</p>
                    <h2>{item.customerName}</h2>
                    <p className="quiet">
                      {formatDate(item.createdAt)} · {item.items.map((dress) => dress.name).join(', ')}
                    </p>
                  </div>
                  <div className="order-side">
                    <strong>{money(item.payment.amount)}</strong>
                    <Pill status={item.status}>{statusLabel(item.status)}</Pill>
                    <Link className="btn small" to={`${base}/track/${item.id}`}>
                      Open
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
