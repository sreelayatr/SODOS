import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill } from '../../components/ui';
import { useStore } from '../../context/Store';
import { STATUSES, formatDate, money, paymentLabel, statusLabel } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';

export function AdminOrders() {
  useTitle('Customer orders');
  const { orders } = useStore();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = status === 'all' || order.status === status;
      const haystack = `${order.id} ${order.customerName} ${order.customerEmail} ${order.items
        .map((item) => item.name)
        .join(' ')}`.toLowerCase();
      return matchesStatus && (!q || haystack.includes(q));
    });
  }, [orders, query, status]);

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Customers</p>
        <h1>View customer orders</h1>
      </header>
      <div className="filters">
        <label className="field grow">
          <span className="sr">Search orders</span>
          <input
            value={query}
            placeholder="Search name, email, or order number"
            onChange={(event) => setQuery(event.target.value)}
          />
        </label>
        <label className="field">
          <span className="sr">Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            {STATUSES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Location</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>
                  <strong>{order.id}</strong>
                  <div className="quiet">{formatDate(order.createdAt)}</div>
                </td>
                <td>
                  {order.customerName}
                  <div className="quiet">{order.customerEmail}</div>
                </td>
                <td>{order.items.map((item) => `${item.name} (${item.size})`).join(', ')}</td>
                <td>
                  {order.location.city}
                  <div className="quiet">{order.location.pincode}</div>
                </td>
                <td>
                  <Pill status={order.payment.status}>{paymentLabel(order.payment.status)}</Pill>
                </td>
                <td>
                  <Pill status={order.status}>{statusLabel(order.status)}</Pill>
                </td>
                <td>{money(order.payment.amount)}</td>
                <td>
                  <Link to={`/admin/track/${order.id}`}>Track</Link>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="8">No orders match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
