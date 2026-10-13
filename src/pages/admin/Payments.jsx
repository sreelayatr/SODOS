import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pill } from '../../components/ui';
import { useStore } from '../../context/Store';
import { formatWhen, money, paymentLabel } from '../../lib/format';
import { useTitle } from '../../lib/useTitle';

const FILTERS = [
  ['all', 'All'],
  ['pending_review', 'Needs review'],
  ['reviewed', 'Reviewed'],
  ['on_hold', 'On hold'],
  ['cod_due', 'Cash on delivery'],
];

export function AdminPayments() {
  useTitle('Payments');
  const { orders, reviewPayment, toast } = useStore();
  const [filter, setFilter] = useState('pending_review');
  const [notes, setNotes] = useState({});

  const visible = useMemo(
    () => orders.filter((order) => filter === 'all' || order.payment.status === filter),
    [orders, filter],
  );

  function review(order, status) {
    reviewPayment(order.id, status, notes[order.id] ?? order.payment.note);
    toast(status === 'reviewed' ? `${order.id} payment reviewed.` : `${order.id} placed on hold.`);
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Accounts</p>
        <h1>Review payment</h1>
      </header>
      <div className="chips">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" className={filter === id ? 'chip on' : 'chip'} onClick={() => setFilter(id)}>
            {label}
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Review note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visible.map((order) => (
              <tr key={order.id}>
                <td>
                  <Link to={`/admin/track/${order.id}`}>{order.id}</Link>
                  <div className="quiet">{formatWhen(order.createdAt)}</div>
                </td>
                <td>{order.customerName}</td>
                <td>{order.payment.label}</td>
                <td>{money(order.payment.amount)}</td>
                <td>
                  <Pill status={order.payment.status}>{paymentLabel(order.payment.status)}</Pill>
                </td>
                <td>
                  <input
                    value={notes[order.id] ?? order.payment.note}
                    placeholder="Note for the record"
                    onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))}
                  />
                </td>
                <td className="actions">
                  <button className="text-btn" type="button" onClick={() => review(order, 'reviewed')}>
                    Mark reviewed
                  </button>
                  <button className="text-btn danger" type="button" onClick={() => review(order, 'on_hold')}>
                    Hold
                  </button>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan="7">Nothing in this queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
