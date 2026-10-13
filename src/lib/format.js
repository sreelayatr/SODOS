export const STATUSES = [
  { id: 'placed', label: 'Placed' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'packed', label: 'Packed' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'out_for_delivery', label: 'Out for delivery' },
  { id: 'delivered', label: 'Delivered' },
];

export const CATEGORIES = ['Tailoring', 'Essentials', 'Outerwear'];

export const SIZES = ['XS', 'S', 'M', 'L', 'XL'];

export const STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

export const FREE_SHIPPING = 8000;
export const SHIPPING_FEE = 250;

export function money(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n || 0);
}

export function formatDate(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(iso));
}

export function formatWhen(iso) {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function shippingFor(subtotal) {
  if (!subtotal || subtotal >= FREE_SHIPPING) return 0;
  return SHIPPING_FEE;
}

export function totals(lines) {
  const subtotal = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);
  const shipping = shippingFor(subtotal);
  const count = lines.reduce((sum, line) => sum + line.qty, 0);
  return { subtotal, shipping, total: subtotal + shipping, count };
}

export function statusLabel(id) {
  return STATUSES.find((item) => item.id === id)?.label || id;
}

export function paymentLabel(id) {
  return (
    {
      pending_review: 'Pending review',
      reviewed: 'Reviewed',
      on_hold: 'On hold',
      cod_due: 'Pay on delivery',
    }[id] || id
  );
}

export function toneFor(status) {
  if (status === 'delivered' || status === 'reviewed') return 'good';
  if (status === 'on_hold') return 'bad';
  if (status === 'pending_review' || status === 'placed' || status === 'cod_due') return 'warn';
  return 'neutral';
}

export function luhn(num) {
  const digits = String(num).replace(/\s/g, '');
  if (!/^\d{16}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

export function expiryOk(value) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value || '');
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  return new Date(year, month, 1) > new Date();
}

export function productError(product) {
  if (!product.name) return 'Give the item a name.';
  if (!Number.isFinite(product.price) || product.price < 1) return 'Enter a valid price.';
  if (!product.color) return 'Add a colour.';
  if (!product.fabric) return 'Add the fabric.';
  if (!product.description) return 'Add a short description.';
  if (!product.image) return 'Add an image so it can appear on the shop.';
  if (!product.sizes?.length) return 'Choose at least one size.';
  return '';
}

export function daysAgo(days, hours = 11) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, 20, 0, 0);
  return date.toISOString();
}
