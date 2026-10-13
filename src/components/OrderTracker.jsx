import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/Store';
import { STATUSES, formatWhen, money, paymentLabel, statusLabel } from '../lib/format';
import { DressImage } from './ui';
import { Pill } from './ui';

export function OrderTracker({ order, manage }) {
  const { updateOrder, toast } = useStore();
  const [form, setForm] = useState({
    status: order.status,
    carrier: order.carrier || '',
    trackingNo: order.trackingNo || '',
    eventNote: '',
  });

  useEffect(() => {
    setForm({
      status: order.status,
      carrier: order.carrier || '',
      trackingNo: order.trackingNo || '',
      eventNote: '',
    });
  }, [order.id, order.status, order.carrier, order.trackingNo]);

  const index = STATUSES.findIndex((step) => step.id === order.status);

  function save(event) {
    event.preventDefault();
    updateOrder(order.id, form);
    toast(`Tracking updated for ${order.id}.`);
    setForm((current) => ({ ...current, eventNote: '' }));
  }

  return (
    <article className="tracker">
      <header className="tracker-head">
        <div>
          <p className="eyebrow">Order {order.id}</p>
          <h2>{order.customerName}</h2>
          <p className="quiet">
            Placed {formatWhen(order.createdAt)} · {order.customerEmail}
          </p>
        </div>
        <div className="tracker-pills">
          <Pill status={order.status}>{statusLabel(order.status)}</Pill>
          <Pill status={order.payment.status}>{paymentLabel(order.payment.status)}</Pill>
        </div>
      </header>

      <ol className="steps">
        {STATUSES.map((step, stepIndex) => {
          const state = stepIndex < index ? 'done' : stepIndex === index ? 'current' : 'upcoming';
          return (
            <li key={step.id} className={state}>
              <span>{step.label}</span>
            </li>
          );
        })}
      </ol>

      <div className="tracker-grid">
        <section>
          <h3>Items</h3>
          <ul className="mini-lines">
            {order.items.map((item) => (
              <li key={`${item.productId}-${item.size}`}>
                <DressImage src={item.image} alt="" />
                <div>
                  <strong>{item.name}</strong>
                  <p>
                    Size {item.size} · Qty {item.qty}
                  </p>
                </div>
                <span>{money(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="total-line">
            Total <strong>{money(order.payment.amount)}</strong>
          </p>
        </section>
        <section>
          <h3>Delivery location</h3>
          <p>
            {order.location.fullName}
            <br />
            {order.location.line1}
            <br />
            {order.location.city}, {order.location.state} {order.location.pincode}
            <br />
            {order.location.phone}
          </p>
          {order.note && <p className="quiet">Note: {order.note}</p>}
          <h3>Payment</h3>
          <p>
            {order.payment.label}
            <br />
            {paymentLabel(order.payment.status)}
            {order.payment.note ? ` · ${order.payment.note}` : ''}
          </p>
          {(order.carrier || order.trackingNo) && (
            <>
              <h3>Shipment</h3>
              <p>
                {order.carrier || 'Courier'} {order.trackingNo && `· ${order.trackingNo}`}
              </p>
            </>
          )}
        </section>
      </div>

      <section>
        <h3>Updates</h3>
        <ol className="events">
          {[...order.history].reverse().map((event, eventIndex) => (
            <li key={`${event.at}-${eventIndex}`}>
              <strong>{event.note || statusLabel(event.status)}</strong>
              <span>{formatWhen(event.at)}</span>
            </li>
          ))}
        </ol>
      </section>

      {manage && (
        <form className="track-form" onSubmit={save}>
          <h3>Update tracking</h3>
          <div className="form-grid">
            <label className="field">
              Status
              <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {STATUSES.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              Courier
              <input
                value={form.carrier}
                placeholder="Bluedart"
                onChange={(event) => setForm({ ...form, carrier: event.target.value })}
              />
            </label>
            <label className="field">
              Tracking number
              <input
                value={form.trackingNo}
                placeholder="BD1842921"
                onChange={(event) => setForm({ ...form, trackingNo: event.target.value })}
              />
            </label>
            <label className="field">
              Note for the customer
              <input
                value={form.eventNote}
                placeholder="Packed and handed to the courier"
                onChange={(event) => setForm({ ...form, eventNote: event.target.value })}
              />
            </label>
          </div>
          <button className="btn" type="submit">
            Save tracking
          </button>
        </form>
      )}

      <p className="quiet">
        <Link to={manage ? '/admin/orders' : '/orders'}>Back to orders</Link>
      </p>
    </article>
  );
}
