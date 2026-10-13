import { Link, useNavigate } from 'react-router-dom';
import { DressImage, Empty } from '../components/ui';
import { useStore } from '../context/Store';
import { money, totals } from '../lib/format';
import { useTitle } from '../lib/useTitle';

export function Cart() {
  useTitle('Bag');
  const { cart, user, updateQty, removeFromCart, toast } = useStore();
  const navigate = useNavigate();
  const bill = totals(cart);
  const blocked = cart.some((line) => line.qty > line.product.stock);

  function proceed() {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    if (user.role !== 'customer') {
      toast('Use a customer account to place an order.');
      return;
    }
    navigate('/checkout');
  }

  if (!cart.length) {
    return (
      <div className="wrap page">
        <Empty
          title="Your bag is empty."
          text="Explore modern tailoring, refined essentials, and outerwear built for the city."
          action={
            <Link className="btn" to={{ pathname: '/', hash: '#shop' }}>
              Shop collection
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="page wrap">
      <header className="page-head">
        <p className="eyebrow">Your bag</p>
        <h1>Ready when you are.</h1>
      </header>
      <div className="cart-layout">
        <ul className="lines">
          {cart.map((line) => (
            <li key={line.id} className="line">
              <Link to={`/dress/${line.product.id}`} className="line-media">
                <DressImage src={line.product.image} alt="" />
              </Link>
              <div>
                <h2>
                  <Link to={`/dress/${line.product.id}`}>{line.product.name}</Link>
                </h2>
                <p className="quiet">
                  Size {line.size} · {line.product.color}
                </p>
                {line.qty > line.product.stock && (
                  <p className="error">Only {line.product.stock} left. Lower the quantity to continue.</p>
                )}
                <button className="text-btn" type="button" onClick={() => removeFromCart(line.id)}>
                  Remove
                </button>
              </div>
              <div className="line-end">
                <div className="stepper">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateQty(line.id, line.qty - 1)}
                    disabled={line.qty <= 1}
                  >
                    −
                  </button>
                  <span>{line.qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateQty(line.id, line.qty + 1)}
                    disabled={line.qty >= line.product.stock}
                  >
                    +
                  </button>
                </div>
                <p className="price">{money(line.product.price * line.qty)}</p>
              </div>
            </li>
          ))}
        </ul>
        <aside className="summary">
          <h2>Summary</h2>
          <div className="sum-row">
            <span>Subtotal</span>
            <span>{money(bill.subtotal)}</span>
          </div>
          <div className="sum-row">
            <span>Shipping</span>
            <span>{bill.shipping === 0 ? 'Complimentary' : money(bill.shipping)}</span>
          </div>
          <div className="sum-row total">
            <span>Total</span>
            <span>{money(bill.total)}</span>
          </div>
          <p className="quiet">
            {bill.shipping === 0
              ? 'This order has complimentary shipping.'
              : `Add ${money(8000 - bill.subtotal)} more for complimentary shipping.`}
          </p>
          <button className="btn full" type="button" disabled={blocked} onClick={proceed}>
            Proceed to order
          </button>
        </aside>
      </div>
    </div>
  );
}
