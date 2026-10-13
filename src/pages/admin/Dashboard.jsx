import { Link } from 'react-router-dom';
import { Pill } from '../../components/ui';
import { useStore } from '../../context/Store';
import { formatDate, money, statusLabel } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';

export function Dashboard() {
  useTitle('Admin');
  const { orders, products } = useStore();
  const open = orders.filter((order) => order.status !== 'delivered').length;
  const value = orders.reduce((sum, order) => sum + order.payment.amount, 0);
  const review = orders.filter((order) => order.payment.status === 'pending_review').length;
  const low = products.filter((product) => product.stock > 0 && product.stock <= 3);
  const recent = orders.slice(0, 5);

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Studio overview</p>
        <h1>Today in the house</h1>
      </header>
      <div className="stats">
        <article className="stat">
          <span>Open orders</span>
          <strong>{open}</strong>
        </article>
        <article className="stat">
          <span>Order value</span>
          <strong>{money(value)}</strong>
        </article>
        <article className="stat">
          <span>Payments to review</span>
          <strong>{review}</strong>
        </article>
        <article className="stat">
          <span>Products</span>
          <strong>{products.length}</strong>
        </article>
      </div>
      <section className="panel">
        <div className="shop-head">
          <h2>Recent customer orders</h2>
          <Link to="/admin/orders">View all</Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Placed</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/track/${order.id}`}>{order.id}</Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>{money(order.payment.amount)}</td>
                  <td>
                    <Pill status={order.status}>{statusLabel(order.status)}</Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {low.length > 0 && (
        <section className="panel">
          <h2>Running low</h2>
          <ul className="plain-list">
            {low.map((product) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <span>{product.stock} left</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
