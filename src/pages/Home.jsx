import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { DressImage } from '../components/ui';
import { useStore } from '../context/Store';
import { useTitle } from '../lib/useTitle';

const TABS = [
  { id: 'All', label: 'All' },
  { id: 'Shirts', label: 'Shirts', test: (product) => /shirt/i.test(product.name) && !/tee/i.test(product.name) },
  { id: 'Trousers', label: 'Trousers', test: (product) => /trouser|suit/i.test(product.name) },
  { id: 'Outerwear', label: 'Outerwear', test: (product) => product.category === 'Outerwear' },
  { id: 'T-Shirts', label: 'T-Shirts', test: (product) => /tee/i.test(product.name) },
  { id: 'Tailoring', label: 'Tailoring', test: (product) => product.category === 'Tailoring' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export function Home() {
  useTitle('Shop');
  const { products, lookbook, addToCart, toast } = useStore();
  const [params] = useSearchParams();
  const [tab, setTab] = useState('All');
  const [query, setQuery] = useState('');
  const [size, setSize] = useState('');
  const [slide, setSlide] = useState(0);
  const [sizesOpen, setSizesOpen] = useState(false);
  const [searching, setSearching] = useState(false);

  const byId = (id) => products.find((item) => item.id === id);
  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1400&q=85',
      kicker: 'Premium cut',
      left: 'Sodos',
      right: 'Tailoring',
    },
    {
      image: lookbook.hero,
      kicker: 'City layer',
      left: 'Sodos',
      right: 'Outerwear',
    },
    {
      image: byId('d4')?.image,
      kicker: 'Night edit',
      left: 'Sodos',
      right: 'Leather',
    },
  ].filter((item) => item.image);

  const tiles = [
    { label: 'Shirts', product: byId('d7'), tab: 'Shirts' },
    { label: 'Trousers', product: byId('d3'), tab: 'Trousers' },
    { label: 'T-Shirts', product: byId('d5'), tab: 'T-Shirts' },
    { label: 'Jackets', product: byId('d4'), tab: 'Outerwear' },
    { label: 'Outerwear', product: byId('d6'), tab: 'Outerwear' },
    { label: 'Polos', product: byId('d2'), tab: 'Shirts' },
    { label: 'Tailoring', product: byId('d1'), tab: 'Tailoring', badge: 'XS–XL' },
    { label: 'Coats', product: byId('d8'), tab: 'Outerwear' },
    { label: 'Essentials', product: byId('d5'), tab: 'All', badge: 'New' },
  ].filter((item) => item.product);

  useEffect(() => {
    const next = params.get('tab');
    if (next && TABS.some((item) => item.id === next)) setTab(next);
    if (params.get('view') === 'new') setTab('All');
    if (window.location.hash === '#shop') setSearching(true);
  }, [params]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5200);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const visible = useMemo(() => {
    const current = TABS.find((item) => item.id === tab);
    const q = query.trim().toLowerCase();
    return products
      .filter((product) => {
        const matchesTab = !current?.test || current.test(product);
        const matchesSize = !size || product.sizes.includes(size);
        const haystack = `${product.name} ${product.color} ${product.fabric} ${product.category}`.toLowerCase();
        return matchesTab && matchesSize && (!q || haystack.includes(q));
      })
      .sort((a, b) =>
        params.get('view') === 'new'
          ? b.createdAt.localeCompare(a.createdAt)
          : Number(b.featured) - Number(a.featured) || a.name.localeCompare(b.name),
      );
  }, [products, tab, query, size, params]);

  function onAdd(product) {
    const picked = size || ['M', 'S', 'L', 'XS', 'XL'].find((item) => product.sizes.includes(item)) || product.sizes[0];
    const result = addToCart(product.id, picked, 1);
    toast(result.ok ? `${product.name} added in size ${picked}.` : result.error);
  }

  function pickTab(next) {
    setTab(next);
    setQuery('');
    requestAnimationFrame(() => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }));
  }

  const current = slides[slide];

  return (
    <div className="page storefront">
      {current && (
        <section className="campaign" aria-roledescription="carousel" aria-label="Campaign">
          <DressImage key={current.image} src={current.image} alt="" />
          <p key={current.kicker} className="side-kicker">{current.kicker}</p>
          <div key={`${current.left}-${current.right}`} className="hero-bottom">
            <span>{current.left}</span>
            <span>{current.right}</span>
          </div>
          {slides.length > 1 && (
            <>
              <button className="campaign-arrow prev" type="button" aria-label="Previous slide" onClick={() => setSlide((value) => (value - 1 + slides.length) % slides.length)}>
                ‹
              </button>
              <button className="campaign-arrow next" type="button" aria-label="Next slide" onClick={() => setSlide((value) => (value + 1) % slides.length)}>
                ›
              </button>
            </>
          )}
        </section>
      )}

      <section className="shop-by">
        <p className="kicker">Shop by</p>
        <h2>Category</h2>
        <div className="cat-grid">
          {tiles.map((item, index) => (
            <button key={item.label} className="cat-tile" type="button" style={{ animationDelay: `${index * 70}ms` }} onClick={() => pickTab(item.tab)}>
              <span>
                {item.label}
                {item.badge && <em>{item.badge}</em>}
              </span>
              <DressImage src={item.product.image} alt="" />
            </button>
          ))}
        </div>
        <a className="shop-all" href="#shop">
          Shop all
        </a>
      </section>

      <button className="size-banner" type="button" onClick={() => setSizesOpen(true)}>
        <strong>Shop your size</strong>
        <DressImage src={byId('d5')?.image || lookbook.hero} alt="" />
        <strong>Free over ₹8,000</strong>
      </button>

      <section className="mid-banner">
        <DressImage
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1600&q=85"
          alt=""
        />
        <div className="hero-bottom light">
          <span>Checked shirts</span>
          <span>Sharp grids</span>
        </div>
      </section>

      <section className="trend" id="shop">
        <h2>Trending</h2>
        <div className="trend-layout">
          <aside className="desk-filters" aria-label="Filter clothing">
            <p className="filter-label">Category</p>
            <div className="trend-tabs" role="tablist" aria-label="Categories">
              {TABS.map((item) => (
                <button key={item.id} className={item.id === tab ? 'on' : ''} type="button" onClick={() => setTab(item.id)}>
                  {item.label}
                </button>
              ))}
            </div>
            <label className={searching ? 'trend-search open' : 'trend-search'}>
              <span className="sr">Search clothing</span>
              <input id="shop-search" value={query} placeholder="Search" onChange={(event) => setQuery(event.target.value)} />
            </label>
            {size && (
              <p className="size-note">
                Size {size}
                <button type="button" onClick={() => setSize('')}>
                  Clear
                </button>
              </p>
            )}
          </aside>
          <div className="trend-main">
            {visible.length === 0 ? (
              <div className="empty">
                <h2>No items match that search.</h2>
                <button className="btn ghost" type="button" onClick={() => { setQuery(''); setTab('All'); setSize(''); }}>
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={onAdd} swatches={products} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {sizesOpen && (
        <div className="size-sheet" role="dialog" aria-label="Shop your size">
          <button className="nav-backdrop" type="button" aria-label="Close sizes" onClick={() => setSizesOpen(false)} />
          <div className="size-panel">
            <div className="size-panel-head">
              <h2>Shop your size</h2>
              <button type="button" onClick={() => setSizesOpen(false)}>
                Close
              </button>
            </div>
            <div className="size-picks">
              {SIZES.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={size === item ? 'on' : ''}
                  onClick={() => {
                    setSize(item);
                    setSizesOpen(false);
                    requestAnimationFrame(() => document.querySelector('#shop')?.scrollIntoView({ behavior: 'smooth' }));
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
