// Decides which page experience a product gets and gives every product its own accent colour.

const BY_CATEGORY = {
  Electronics: 'tech',
  'Fashion & Apparel': 'editorial',
  'Watches & Jewelry': 'editorial',
  'Beauty & Health': 'soft',
  'Sports & Outdoors': 'energy',
  'Toys & Games': 'energy',
  Automotive: 'energy',
  'Home & Kitchen': 'cozy',
  'Books & Stationery': 'cozy',
  Other: 'tech',
};

// An explicit product.theme (other than 'standard') wins; otherwise the category decides.
export const themeFor = (product) =>
  product.theme && product.theme !== 'standard' ? product.theme : BY_CATEGORY[product.category] || 'tech';

const hash = (str = '') => {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
};

export const POOLS = {
  editorial: ['#e11d48', '#7c3aed', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#f97316', '#6366f1'],
  energy: ['#c6ff00', '#00e5ff', '#ff3d00', '#ff2e93', '#ffe600', '#7cff6b'],
  soft: ['#e8a0b4', '#d9a066', '#b79ced', '#8ecfc9', '#f0b27a', '#e5989b'],
  cozy: ['#c1583a', '#7a8b5c', '#b8863b', '#8c5e4a', '#5f7f86', '#a4503f'],
};

export const accentFor = (product, pool) => pool[hash(product._id || product.title) % pool.length];

// Split a description into short sentences and top up with product facts
export const storyBeats = (product, minimum = 3) => {
  const sentences = (product.description || '').split(/(?<=[.!?])\s+/).filter(Boolean);
  const extras = [
    `Rated ${Number(product.rating || 0).toFixed(1)} out of 5 by ${product.numReviews || 0} verified buyers.`,
    `Shipped directly by ${product.vendor?.vendorDetails?.storeName || product.vendor?.name || 'a verified vendor'}.`,
    '30-day returns on every order.',
  ];
  const beats = [...sentences, ...extras];
  return beats.slice(0, Math.max(sentences.length, minimum, 3)).slice(0, 6);
};
