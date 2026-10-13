import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { DressImage, Empty } from '../components/ui';
import { useStore } from '../context/Store';
import { money } from '../lib/format';
import { useTitle } from '../lib/useTitle';

export function Product() {
  const { id } = useParams();
  const { products, addToCart, toast } = useStore();
  const product = products.find((item) => item.id === id);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');
  useTitle(product ? product.name : 'Product');

  useEffect(() => {
    setSize('');
    setQty(1);
    setError('');
  }, [id]);

  if (!product) {
    return (
      <div className="wrap page">
        <Empty
          title="This item is no longer in the collection."
          action={
            <Link className="btn" to="/">
              Shop collection
            </Link>
          }
        />
      </div>
    );
  }

  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 3);

  function add() {
    const result = addToCart(product.id, size, qty);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError('');
    toast(`${product.name} added to your bag.`);
  }

  function quickAdd(item) {
    const picked = ['M', 'S', 'L', 'XS', 'XL'].find((sizeName) => item.sizes.includes(sizeName)) || item.sizes[0];
    const result = addToCart(item.id, picked, 1);
    toast(result.ok ? `${item.name} added in size ${picked}.` : result.error);
  }

  return (
    <div className="page wrap">
      <p className="crumbs">
        <Link to="/">Shop</Link> / {product.category} / {product.name}
      </p>
      <div className="product">
        <div className="gallery">
          <DressImage src={product.image} alt={product.name} />
        </div>
        <div className="details">
          <p className="eyebrow">{product.category}</p>
          <h1>{product.name}</h1>
          <p className="price large">{money(product.price)}</p>
          <p className="lede">{product.description}</p>
          <ul className="meta-list">
            <li>
              <span>Colour</span>
              {product.color}
            </li>
            <li>
              <span>Fabric</span>
              {product.fabric}
            </li>
            <li>
              <span>Ships</span>
              {product.stock > 0 ? 'In 2–4 days across India' : 'Currently sold out'}
            </li>
          </ul>
          <p className="label">Size</p>
          <div className="size-row">
            {product.sizes.map((item) => (
              <button
                key={item}
                type="button"
                className={size === item ? 'size on' : 'size'}
                aria-pressed={size === item}
                onClick={() => {
                  setSize(item);
                  setError('');
                }}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="qty-row">
            <span>Quantity</span>
            <div className="stepper">
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
                −
              </button>
              <span>{qty}</span>
              <button
                type="button"
                onClick={() => setQty((value) => Math.min(product.stock || 1, value + 1))}
                aria-label="Increase quantity"
                disabled={qty >= product.stock}
              >
                +
              </button>
            </div>
            <span className="quiet">{product.stock > 0 ? `${product.stock} available` : 'Sold out'}</span>
          </div>
          {error && <p className="error">{error}</p>}
          <button className="btn full" type="button" disabled={product.stock < 1} onClick={add}>
            {product.stock < 1 ? 'Sold out' : 'Add to bag'}
          </button>
          <p className="quiet">Prices include tax. Complimentary shipping over ₹8,000.</p>
        </div>
      </div>
      {related.length > 0 && (
        <section className="related">
          <h2>More in {product.category}</h2>
          <div className="grid">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} onAdd={quickAdd} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
