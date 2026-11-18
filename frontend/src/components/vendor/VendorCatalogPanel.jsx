import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, ExternalLink, Package, Plus, Trash2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Loader from '../common/Loader';
import Alert from '../common/Alert';
import ThemedThumb from '../common/ThemedThumb';
import useCurrency from '../../hooks/useCurrency';
import { itemStyle } from '../product/themes/productTheme';
import { toast } from '../../lib/toast';
import { DASH_INPUT, DASH_LABEL, EmptyState, Modal, Panel, Pill, PrimaryButton, SearchField, TH } from '../dashboard/DashKit';

// Must match the Product schema enum on the API
export const CATEGORIES = [
  'Electronics',
  'Fashion & Apparel',
  'Home & Kitchen',
  'Beauty & Health',
  'Sports & Outdoors',
  'Books & Stationery',
  'Watches & Jewelry',
  'Toys & Games',
  'Automotive',
  'Other',
];

const EMPTY = { title: '', description: '', price: '', discountPrice: '', stock: '', category: 'Electronics', brand: '', imageUrl: '', tags: '', theme: 'standard' };
const DARK_ACCENTS = ['#c6ff00', '#ffe600'];

/** The vendor's product catalogue: list, search/filter, create, edit, delete. Uses GET /vendors/products and /products. */
const VendorCatalogPanel = ({ onChange, createSignal }) => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await axiosClient.get('/vendors/products');
      setProducts(data.products);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your catalogue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setForm(EMPTY);
    setModalOpen(true);
  }, []);

  // Lets a parent's "Add product" button open the form
  useEffect(() => {
    if (createSignal) openCreate();
  }, [createSignal, openCreate]);

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      discountPrice: p.discountPrice || '',
      stock: p.stock ?? '',
      category: p.category || 'Electronics',
      brand: p.brand || '',
      imageUrl: p.images?.[0]?.url || '',
      tags: p.tags?.join(', ') || '',
      theme: p.theme || 'standard',
    });
    setModalOpen(true);
  };

  const field = (name) => ({ name, value: form[name], onChange: (e) => setForm((f) => ({ ...f, [name]: e.target.value })) });

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : 0,
        stock: Number(form.stock),
        category: form.category,
        brand: form.brand || undefined,
        theme: form.theme,
        images: form.imageUrl ? [{ url: form.imageUrl }] : undefined,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };
      if (editing) await axiosClient.put(`/products/${editing._id}`, payload);
      else await axiosClient.post('/products', payload);
      toast(editing ? 'Product updated' : 'Product listed');
      setModalOpen(false);
      await load();
      onChange?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving product');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Remove “${p.title}” from your catalogue?`)) return;
    try {
      await axiosClient.delete(`/products/${p._id}`);
      toast('Product removed');
      setProducts((prev) => prev.filter((x) => x._id !== p._id));
      onChange?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => (!term || p.title?.toLowerCase().includes(term) || p.brand?.toLowerCase().includes(term)) && (!category || p.category === category));
  }, [products, search, category]);

  // Share of the catalogue by page theme
  const mix = useMemo(() => {
    const map = new Map();
    products.forEach((p) => {
      const s = itemStyle(p);
      map.set(s.theme, { ...s, count: (map.get(s.theme)?.count || 0) + 1 });
    });
    return [...map.values()];
  }, [products]);

  if (loading) return <Loader message="Loading your catalogue..." />;

  return (
    <div className="space-y-6">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {mix.length > 0 && (
        <Panel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Catalogue by page style</p>
          <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
            {mix.map((m) => (
              <span key={m.theme} style={{ width: `${(m.count / products.length) * 100}%`, backgroundColor: m.accent }} />
            ))}
          </div>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
            {mix.map((m) => (
              <li key={m.theme}>
                <span style={{ color: m.accent }}>●</span> {m.label} · {m.count}
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="dk-panel flex flex-col gap-3 sm:flex-row">
        <SearchField value={search} onChange={setSearch} placeholder="Search by title or brand" />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category" className={`${DASH_INPUT} sm:w-60`}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <Panel>
        {visible.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products yet."
            text={search || category ? 'No products match your filters.' : 'List your first product and it gets its own storefront page.'}
            action={!search && !category && <PrimaryButton onClick={openCreate}><Plus className="h-4 w-4" /> Add product</PrimaryButton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className={TH}>Product</th>
                  <th className={TH}>Price</th>
                  <th className={TH}>Inventory</th>
                  <th className={TH}>Rating</th>
                  <th className={`${TH} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.map((p) => {
                  const { theme, label, accent } = itemStyle(p);
                  const price = p.discountPrice > 0 ? p.discountPrice : p.price;
                  return (
                    <tr key={p._id} className="transition hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <ThemedThumb src={p.images?.[0]?.url} theme={theme} accent={accent} size="w-14 h-14" />
                          <div className="min-w-0 max-w-xs">
                            <p className="truncate font-semibold text-slate-900">{p.title}</p>
                            <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest" style={{ backgroundColor: `${accent}22`, color: DARK_ACCENTS.includes(accent) ? '#3f3f00' : accent }}>{label}</span>
                              {p.category}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {formatPrice(price)}
                        {p.discountPrice > 0 && <span className="ml-2 text-xs font-normal text-slate-400 line-through">{formatPrice(p.price)}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <Pill tone={p.stock <= 0 ? 'danger' : p.stock < 5 ? 'warn' : 'success'}>{p.stock <= 0 ? 'Sold out' : `${p.stock} units`}</Pill>
                      </td>
                      <td className="px-6 py-4 font-semibold text-amber-500">★ {Number(p.rating || 0).toFixed(1)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link to={`/product/${p._id}`} target="_blank" aria-label="View on storefront" className="rounded-full p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><ExternalLink className="h-4 w-4" /></Link>
                          <button type="button" onClick={() => openEdit(p)} aria-label={`Edit ${p.title}`} className="rounded-full p-2.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-900"><Edit2 className="h-4 w-4" /></button>
                          <button type="button" onClick={() => remove(p)} aria-label={`Delete ${p.title}`} className="rounded-full p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit product' : 'List a new product'} subtitle="Prices are in the store's base currency." wide>
        <form onSubmit={save} className="space-y-5">
          <label className="block"><span className={DASH_LABEL}>Title *</span><input required className={DASH_INPUT} placeholder="Wireless ANC Headphones" {...field('title')} /></label>
          <label className="block"><span className={DASH_LABEL}>Description *</span><textarea required rows={3} className={DASH_INPUT} placeholder="Tell shoppers what makes it special. Each sentence becomes a highlight on the product page." {...field('description')} /></label>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block"><span className={DASH_LABEL}>Price *</span><input required type="number" min="0" step="0.01" className={DASH_INPUT} {...field('price')} /></label>
            <label className="block"><span className={DASH_LABEL}>Discount price</span><input type="number" min="0" step="0.01" className={DASH_INPUT} {...field('discountPrice')} /></label>
            <label className="block"><span className={DASH_LABEL}>Stock *</span><input required type="number" min="0" className={DASH_INPUT} {...field('stock')} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={DASH_LABEL}>Category *</span>
              <select className={DASH_INPUT} {...field('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
            </label>
            <label className="block"><span className={DASH_LABEL}>Brand</span><input className={DASH_INPUT} placeholder="Brand name" {...field('brand')} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block"><span className={DASH_LABEL}>Image URL</span><input type="url" className={DASH_INPUT} placeholder="https://…" {...field('imageUrl')} /></label>
            <label className="block">
              <span className={DASH_LABEL}>Page style</span>
              <select className={DASH_INPUT} {...field('theme')}>
                <option value="standard">Automatic (by category)</option>
                <option value="luxury">Luxury editorial</option>
              </select>
            </label>
          </div>
          <label className="block"><span className={DASH_LABEL}>Tags (comma separated)</span><input className={DASH_INPUT} placeholder="wireless, audio" {...field('tags')} /></label>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-full px-6 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50">Cancel</button>
            <PrimaryButton type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create listing'}</PrimaryButton>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorCatalogPanel;
