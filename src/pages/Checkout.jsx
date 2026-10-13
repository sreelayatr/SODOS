import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DressImage, Empty } from '../components/ui';
import { useStore } from '../context/Store';
import { STATES, expiryOk, luhn, money, totals } from '../lib/format';
import { useTitle } from '../lib/useTitle';

const emptyPay = { method: 'card', name: '', number: '', expiry: '', cvv: '', vpa: '' };

function groupCard(value) {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

function groupExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function Checkout() {
  useTitle('Checkout');
  const { user, cart, placeOrder } = useStore();
  const navigate = useNavigate();
  const saved = user?.address;
  const [location, setLocation] = useState({
    fullName: saved?.fullName || user?.name || '',
    phone: saved?.phone || user?.phone || '',
    line1: saved?.line1 || '',
    city: saved?.city || '',
    state: saved?.state || 'Karnataka',
    pincode: saved?.pincode || '',
    save: true,
  });
  const [note, setNote] = useState('');
  const [payment, setPayment] = useState(emptyPay);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const bill = totals(cart);

  if (!cart.length) {
    return (
      <div className="wrap page">
        <Empty
          title="Nothing to check out."
          text="Add an item before you proceed."
          action={
            <Link className="btn" to="/">
              Shop collection
            </Link>
          }
        />
      </div>
    );
  }

  function setLoc(key, value) {
    setLocation((current) => ({ ...current, [key]: value }));
  }

  function validate() {
    const next = {};
    if (location.fullName.trim().length < 2) next.fullName = 'Enter the recipient’s name.';
    if (!/^[6-9]\d{9}$/.test(location.phone.trim())) next.phone = 'Enter a 10-digit mobile number.';
    if (location.line1.trim().length < 5) next.line1 = 'Enter the street address.';
    if (location.city.trim().length < 2) next.city = 'Enter the city.';
    if (!location.state) next.state = 'Choose a state.';
    if (!/^[1-9]\d{5}$/.test(location.pincode.trim())) next.pincode = 'Enter a 6-digit PIN code.';

    if (payment.method === 'card') {
      if (payment.name.trim().length < 2) next.cardName = 'Enter the name on the card.';
      if (!luhn(payment.number)) next.number = 'Enter a valid 16-digit card. Try 4242 4242 4242 4242.';
      if (!expiryOk(payment.expiry)) next.expiry = 'Enter a future expiry as MM/YY.';
      if (!/^\d{3}$/.test(payment.cvv)) next.cvv = 'Enter the 3-digit CVV.';
    }
    if (payment.method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(payment.vpa.trim())) {
      next.vpa = 'Enter a UPI ID such as name@okaxis.';
    }
    return next;
  }

  function submit(event) {
    event.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length) {
      setFormError('Check the highlighted fields before placing the order.');
      return;
    }
    const digits = payment.number.replace(/\s/g, '');
    const result = placeOrder({
      location,
      note,
      payment: {
        method: payment.method,
        label:
          payment.method === 'card'
            ? `Card ···· ${digits.slice(-4)}`
            : payment.method === 'upi'
              ? payment.vpa.trim()
              : 'Cash on delivery',
      },
    });
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    navigate(`/track/${result.order.id}`, { state: { placed: true } });
  }

  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="eyebrow">Checkout</p>
        <h1>Proceed to order</h1>
      </header>
      <form className="check" onSubmit={submit} noValidate>
        <div className="check-main">
          {formError && <p className="banner">{formError}</p>}
          <section className="panel">
            <h2>Delivery location</h2>
            <div className="form-grid">
              <label className="field">
                Full name
                <input value={location.fullName} onChange={(event) => setLoc('fullName', event.target.value)} />
                {errors.fullName && <span className="error">{errors.fullName}</span>}
              </label>
              <label className="field">
                Mobile
                <input
                  inputMode="numeric"
                  value={location.phone}
                  onChange={(event) => setLoc('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </label>
              <label className="field span-2">
                Address
                <input value={location.line1} onChange={(event) => setLoc('line1', event.target.value)} />
                {errors.line1 && <span className="error">{errors.line1}</span>}
              </label>
              <label className="field">
                City
                <input value={location.city} onChange={(event) => setLoc('city', event.target.value)} />
                {errors.city && <span className="error">{errors.city}</span>}
              </label>
              <label className="field">
                State
                <select value={location.state} onChange={(event) => setLoc('state', event.target.value)}>
                  {STATES.map((state) => (
                    <option key={state}>{state}</option>
                  ))}
                </select>
                {errors.state && <span className="error">{errors.state}</span>}
              </label>
              <label className="field">
                PIN code
                <input
                  inputMode="numeric"
                  value={location.pincode}
                  onChange={(event) => setLoc('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
                />
                {errors.pincode && <span className="error">{errors.pincode}</span>}
              </label>
              <label className="field">
                Delivery note
                <input value={note} placeholder="Optional" onChange={(event) => setNote(event.target.value)} />
              </label>
            </div>
            <label className="checkline">
              <input
                type="checkbox"
                checked={location.save}
                onChange={(event) => setLoc('save', event.target.checked)}
              />
              Save this location for next time
            </label>
          </section>

          <section className="panel">
            <h2>Payment</h2>
            <div className="pay-methods">
              {[
                ['card', 'Card'],
                ['upi', 'UPI'],
                ['cod', 'Cash on delivery'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={payment.method === id ? 'pay-method on' : 'pay-method'}
                  onClick={() => setPayment((current) => ({ ...current, method: id }))}
                >
                  {label}
                </button>
              ))}
            </div>
            {payment.method === 'card' && (
              <div className="form-grid">
                <p className="quiet span-2">Simulated payment. Do not enter a real card. Use 4242 4242 4242 4242.</p>
                <label className="field span-2">
                  Name on card
                  <input value={payment.name} onChange={(event) => setPayment({ ...payment, name: event.target.value })} />
                  {errors.cardName && <span className="error">{errors.cardName}</span>}
                </label>
                <label className="field span-2">
                  Card number
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    value={payment.number}
                    placeholder="4242 4242 4242 4242"
                    onChange={(event) => setPayment({ ...payment, number: groupCard(event.target.value) })}
                  />
                  {errors.number && <span className="error">{errors.number}</span>}
                </label>
                <label className="field">
                  Expiry
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="MM/YY"
                    value={payment.expiry}
                    onChange={(event) => setPayment({ ...payment, expiry: groupExpiry(event.target.value) })}
                  />
                  {errors.expiry && <span className="error">{errors.expiry}</span>}
                </label>
                <label className="field">
                  CVV
                  <input
                    inputMode="numeric"
                    autoComplete="off"
                    value={payment.cvv}
                    onChange={(event) =>
                      setPayment({ ...payment, cvv: event.target.value.replace(/\D/g, '').slice(0, 3) })
                    }
                  />
                  {errors.cvv && <span className="error">{errors.cvv}</span>}
                </label>
              </div>
            )}
            {payment.method === 'upi' && (
              <label className="field">
                UPI ID
                <input
                  value={payment.vpa}
                  placeholder="name@okaxis"
                  onChange={(event) => setPayment({ ...payment, vpa: event.target.value.trim() })}
                />
                {errors.vpa && <span className="error">{errors.vpa}</span>}
              </label>
            )}
            {payment.method === 'cod' && <p>Pay the courier when your order arrives. The studio will still confirm the order.</p>}
          </section>
        </div>
        <aside className="summary">
          <h2>Your order</h2>
          <ul className="mini-lines plain">
            {cart.map((line) => (
              <li key={line.id}>
                <DressImage src={line.product.image} alt="" />
                <div>
                  <strong>{line.product.name}</strong>
                  <p>
                    Size {line.size} · Qty {line.qty}
                  </p>
                </div>
                <span>{money(line.product.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{money(bill.subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Shipping</span>
            <span>{bill.shipping === 0 ? 'Complimentary' : money(bill.shipping)}</span>
          </div>
          <div className="sum-row total">
            <span>To pay</span>
            <span>{money(bill.total)}</span>
          </div>
          <button className="btn full" type="submit">
            {payment.method === 'cod' ? `Place order · ${money(bill.total)}` : `Pay ${money(bill.total)}`}
          </button>
          <p className="quiet">By placing this order you confirm the location and this simulated payment.</p>
        </aside>
      </form>
    </div>
  );
}
