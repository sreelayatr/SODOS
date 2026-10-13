import { useState } from 'react';
import { DressImage } from '../../components/ui';
import { useStore } from '../../context/Store';
import { CATEGORIES, SIZES, money, productError } from '../../lib/format';
import { readImageFile } from '../../lib/images';
import { useTitle } from '../../lib/useTitle';

const blank = {
  name: '',
  price: '',
  category: 'Essentials',
  color: '',
  fabric: '',
  description: '',
  image: '',
  sizes: ['S', 'M', 'L'],
  stock: 5,
  featured: false,
};

export function AdminProducts() {
  useTitle('Catalog');
  const { products, addProduct, updateProduct, deleteProduct, toast } = useStore();
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  function setField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSize(size) {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size) ? current.sizes.filter((item) => item !== size) : [...current.sizes, size],
    }));
  }

  function edit(product) {
    setEditing(product.id);
    setForm({
      name: product.name,
      price: product.price,
      category: product.category,
      color: product.color,
      fabric: product.fabric,
      description: product.description,
      image: product.image,
      sizes: product.sizes,
      stock: product.stock,
      featured: product.featured,
    });
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function onFile(file) {
    try {
      const url = await readImageFile(file);
      setField('image', url);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  function save(event) {
    event.preventDefault();
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
    const message = productError({
      ...payload,
      name: String(payload.name || '').trim(),
      color: String(payload.color || '').trim(),
      fabric: String(payload.fabric || '').trim(),
      description: String(payload.description || '').trim(),
      image: String(payload.image || '').trim(),
      sizes: payload.sizes,
    });
    if (message) {
      setError(message);
      return;
    }
    const result = editing ? updateProduct(editing, payload) : addProduct(payload);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    toast(editing ? 'Item updated on the shop.' : 'Item added to the customer shop.');
    setForm(blank);
    setEditing(null);
    setError('');
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="eyebrow">Catalog</p>
        <h1>{editing ? 'Edit an item' : 'Add an item'}</h1>
      </header>
      <form className="panel stack" onSubmit={save}>
        <div className="form-grid">
          <label className="field">
            Name
            <input value={form.name} onChange={(event) => setField('name', event.target.value)} />
          </label>
          <label className="field">
            Price (₹)
            <input
              type="number"
              min="1"
              value={form.price}
              onChange={(event) => setField('price', event.target.value)}
            />
          </label>
          <label className="field">
            Category
            <select value={form.category} onChange={(event) => setField('category', event.target.value)}>
              {CATEGORIES.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="field">
            Colour
            <input value={form.color} onChange={(event) => setField('color', event.target.value)} />
          </label>
          <label className="field">
            Fabric
            <input value={form.fabric} onChange={(event) => setField('fabric', event.target.value)} />
          </label>
          <label className="field">
            Stock
            <input
              type="number"
              min="0"
              value={form.stock}
              onChange={(event) => setField('stock', event.target.value)}
            />
          </label>
          <label className="field span-2">
            Description
            <textarea value={form.description} onChange={(event) => setField('description', event.target.value)} />
          </label>
          <label className="field span-2">
            Image URL
            <input
              value={String(form.image).startsWith('data:') ? '' : form.image}
              placeholder={String(form.image).startsWith('data:') ? 'Uploaded image is set' : 'https://'}
              onChange={(event) => setField('image', event.target.value)}
            />
          </label>
        </div>
        <div className="split">
          <div>
            <p className="label">Sizes</p>
            <div className="size-row">
              {SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  className={form.sizes.includes(size) ? 'size on' : 'size'}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
            <label className="checkline">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) => setField('featured', event.target.checked)}
              />
              Feature on the shop
            </label>
          </div>
          <div className="image-field">
            <div className="image-preview">
              {form.image ? <DressImage src={form.image} alt="Product preview" /> : <span>Preview</span>}
            </div>
            <label className="drop">
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onFile(file);
                  event.target.value = '';
                }}
              />
              Upload a picture
            </label>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
        <div className="hero-actions">
          <button className="btn" type="submit">
            {editing ? 'Save changes' : 'Add item'}
          </button>
          {editing && (
            <button
              className="btn ghost"
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(blank);
                setError('');
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <div className="name-cell">
                    <DressImage src={product.image} alt="" />
                    <div>
                      <strong>{product.name}</strong>
                      <div className="quiet">{product.color}</div>
                    </div>
                  </div>
                </td>
                <td>{product.category}</td>
                <td>{money(product.price)}</td>
                <td>{product.stock}</td>
                <td className="actions">
                  <button className="text-btn" type="button" onClick={() => edit(product)}>
                    Edit
                  </button>
                  <button
                    className="text-btn danger"
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete ${product.name}? It will leave the customer shop.`)) {
                        deleteProduct(product.id);
                        if (editing === product.id) {
                          setEditing(null);
                          setForm(blank);
                        }
                        toast('Item removed from the shop.');
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
