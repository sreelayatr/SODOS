import { useState } from 'react';
import { DressImage } from '../../components/ui';
import { useStore } from '../../context/Store';
import { readImageFile } from '../../lib/images';
import { useTitle } from '../../lib/useTitle';

export function AdminImages() {
  useTitle('Shop images');
  const { products, lookbook, updateProduct, updateLookbook, toast } = useStore();
  const [heroUrl, setHeroUrl] = useState(lookbook.hero);
  const [caption, setCaption] = useState(lookbook.caption);
  const [error, setError] = useState('');

  async function fileTo(file, apply) {
    try {
      const url = await readImageFile(file);
      apply(url);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Customer shop</p>
        <h1>Add images</h1>
        <p className="lede">Pictures saved here appear on the customer dashboard immediately.</p>
      </header>
      {error && <p className="error">{error}</p>}

      <section className="panel">
        <h2>Homepage portrait</h2>
        <div className="image-admin">
          <div className="image-preview tall">
            <DressImage src={heroUrl || lookbook.hero} alt="Homepage portrait" />
          </div>
          <div className="stack">
            <label className="field">
              Image URL
              <input
                value={String(heroUrl).startsWith('data:') ? '' : heroUrl}
                placeholder={String(heroUrl).startsWith('data:') ? 'Uploaded image is set' : 'https://'}
                onChange={(event) => setHeroUrl(event.target.value)}
              />
            </label>
            <label className="field">
              Caption
              <input value={caption} onChange={(event) => setCaption(event.target.value)} />
            </label>
            <label className="drop">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) fileTo(file, setHeroUrl);
                  event.target.value = '';
                }}
              />
              Upload portrait
            </label>
            <button
              className="btn"
              type="button"
              onClick={() => {
                if (!heroUrl) {
                  setError('Add a portrait first.');
                  return;
                }
                updateLookbook({ hero: heroUrl, caption: caption.trim() || lookbook.caption });
                toast('Homepage image is live for customers.');
              }}
            >
              Publish on the shop
            </button>
          </div>
        </div>
      </section>

      <section>
        <h2>Product pictures</h2>
        <div className="image-grid">
          {products.map((product) => (
            <article key={product.id} className="image-card">
              <div className="image-preview">
                <DressImage src={product.image} alt={product.name} />
              </div>
              <h3>{product.name}</h3>
              <label className="drop">
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    fileTo(file, (url) => {
                      const result = updateProduct(product.id, { ...product, image: url });
                      if (result.ok) toast(`${product.name} now shows the new picture.`);
                      else setError(result.error);
                    });
                    event.target.value = '';
                  }}
                />
                Replace picture
              </label>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
