import { Link } from 'react-router-dom';
import { Empty, Pill } from '../components/ui';
import { useStore } from '../context/Store';
import { formatDate, money, paymentLabel, statusLabel } from '../lib/format';
import { useTitle } from '../lib/useTitle';

export function Orders() {
  useTitle('Order history');
  const { myOrders } = useStore();

  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="eyebrow">Customer</p>
        <h1>Order history</h1>
      </header>
      {myOrders.length === 0 ? (
        <Empty
          title="No orders yet."
          text="When you place an order, it will live here with its payment and tracking."
          action={
            <Link className="btn" to="/">
              Shop collection
            </Link>
          }
        />
      ) : (
        <ul className="order-list">
          {myOrders.map((order) => (
            <li key={order.id} className="order-row">
              <div>
                <p className="eyebrow">{order.id}</p>
                <h2>{order.items.map((item) => item.name).join(', ')}</h2>
                <p className="quiet">
                  {formatDate(order.createdAt)} ·{' '}
                  {(() => {
                    const count = order.items.reduce((sum, item) => sum + item.qty, 0);
                    return `${count} ${count === 1 ? 'piece' : 'pieces'}`;
                  })()}{' '}
                  · {order.location.city}
                </p>
              </div>
              <div className="order-side">
                <strong>{money(order.payment.amount)}</strong>
                <Pill status={order.status}>{statusLabel(order.status)}</Pill>
                <Pill status={order.payment.status}>{paymentLabel(order.payment.status)}</Pill>
                <Link className="btn small" to={`/track/${order.id}`}>
                  Track
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
