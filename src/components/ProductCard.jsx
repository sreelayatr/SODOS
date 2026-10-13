import { useState } from 'react';
import { Link } from 'react-router-dom';
import { money } from '../lib/format';
import { DressImage } from './ui';

const SWATCH = {
  Navy: '#1c2740',
  Stone: '#c8b8a2',
  Midnight: '#1a1c24',
  Noir: '#111111',
  Cloud: '#e6e6e6',
  Slate: '#6d7782',
  'Oxford blue': '#35557a',
  Camel: '#c4a36a',
};

export function ProductCard({ product, onAdd, swatches = [] }) {
  const soldOut = product.stock < 1;
  const [saved, setSaved] = useState(false);
  const colors = [product.color, ...swatches.filter((item) => item.id !== product.id).map((item) => item.color)];
  const unique = [...new Set(colors)].slice(0, 3);
  const extra = Math.max(0, new Set(colors).size - unique.length);

  return (
    <article className="card">
      <div className="card-media-wrap">
        <Link to={`/dress/${product.id}`} className="card-media">
          <DressImage src={product.image} alt={product.name} />
          {soldOut && <span className="flag">Sold out</span>}
        </Link>
        <button
          className={saved ? 'heart on' : 'heart'}
          type="button"
          aria-pressed={saved}
          aria-label={saved ? `Remove ${product.name} from wishlist` : `Save ${product.name}`}
          onClick={() => setSaved((value) => !value)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} aria-hidden="true">
            <path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9Z" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
      </div>
      <div className="card-body">
        <h3>
          <Link to={`/dress/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="card-buy">
          <p className="price">{money(product.price)}</p>
          <button className="quick-plus" type="button" aria-label={`Quick add ${product.name}`} onClick={() => onAdd(product)} disabled={soldOut}>
            +
          </button>
        </div>
        <div className="swatches">
          {unique.map((color) => (
            <i key={color} style={{ background: SWATCH[color] || '#bbb' }} title={color} />
          ))}
          {extra > 0 && <span>+{extra}</span>}
        </div>
      </div>
    </article>
  );
}
