import React, { useState, useEffect, useCallback, useRef } from 'react';
import Table from '../../components/Table/Table';
import Modal from '../../components/Modal/Modal';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import Pagination from '../../components/Pagination/Pagination';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Products.module.css';

const EMPTY_FORM = {
  title: '', description: '', price: '', comparePrice: '',
  category: [], stock: '', isActive: true,
  isFeatured: false, isLatest: true, isMostDemanding: false, isHighProfit: false,
  status: 'active',
  meeshoLink: '', flipkartLink: '', amazonLink: '',
  rating: '', reviewCount: '',
};

// ===== RICH TEXT EDITOR =====
const RichEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current.innerHTML);
  };

  const handleInput = () => {
    onChange(editorRef.current.innerHTML);
  };

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const btnStyle = () => ({
    padding: '4px 10px', fontSize: 12, borderRadius: 6,
    border: '1px solid var(--border)', background: '#fff',
    color: 'var(--text-dark)', cursor: 'pointer', fontWeight: 600,
  });

  return (
    <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: 4, padding: '8px 10px', background: '#F9FAFB', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
        <button type="button" style={btnStyle()} onClick={() => exec('bold')}><b>B</b></button>
        <button type="button" style={btnStyle()} onClick={() => exec('italic')}><i>I</i></button>
        <button type="button" style={btnStyle()} onClick={() => exec('underline')}><u>U</u></button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" style={btnStyle()} onClick={() => exec('formatBlock', 'h3')}>H3</button>
        <button type="button" style={btnStyle()} onClick={() => exec('formatBlock', 'h4')}>H4</button>
        <button type="button" style={btnStyle()} onClick={() => exec('formatBlock', 'p')}>P</button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" style={btnStyle()} onClick={() => exec('insertUnorderedList')}>• List</button>
        <button type="button" style={btnStyle()} onClick={() => exec('insertOrderedList')}>1. List</button>
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        <button type="button" style={btnStyle()} onClick={() => exec('removeFormat')}>Clear</button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        suppressContentEditableWarning
        style={{ minHeight: 140, padding: '12px 16px', fontSize: 14, lineHeight: 1.8, outline: 'none', background: '#fff', fontFamily: 'Jost, sans-serif' }}
      />
      <div style={{ padding: '6px 12px', background: '#F9FAFB', borderTop: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>
        💡 <strong>B</strong> = Bold, <strong>H3</strong> = Heading, <strong>• List</strong> = Bullet points
      </div>
    </div>
  );
};

// ===== STAR RATING INPUT =====
const StarInput = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const rating = parseFloat(value) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ display: 'flex', gap: 4 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              fontSize: 28, cursor: 'pointer',
              color: star <= (hover || rating) ? '#B8860B' : '#E5E7EB',
              transition: 'color 0.15s',
            }}
          >★</span>
        ))}
      </div>
      <input
        type="number" min="0" max="5" step="0.1"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 70, padding: '8px 10px', border: '1.5px solid var(--border)', borderRadius: 8, fontSize: 14, textAlign: 'center' }}
        placeholder="4.5"
      />
      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>/ 5</span>
    </div>
  );
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const importFileRef = useRef();
  const { addToast } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (catFilter) params.category = catFilter;
      const res = await api.get('/products', { params });
      const data = res.data;
      const arr = data?.data?.products || data?.products || data?.data || [];
      setProducts(Array.isArray(arr) ? arr : []);
      setTotalPages(data?.data?.totalPages || data?.totalPages || 1);
      setTotalProducts(data?.data?.totalProducts || data?.totalProducts || 0);
    } catch {
      addToast('Failed to load products', 'error');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, catFilter]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories').then(r => {
      const arr = r.data?.categories || r.data?.data || [];
      setCategories(Array.isArray(arr) ? arr : []);
    }).catch(() => {});
  }, []);

  const openAdd = () => { setForm(EMPTY_FORM); setImages([]); setEditProduct(null); setModalOpen(true); };

  const openEdit = (product) => {
    setEditProduct(product);
    const cats = Array.isArray(product.category)
      ? product.category.map(c => c._id || c)
      : product.category?._id ? [product.category._id] : [];
    setForm({
      title: product.title || '',
      description: product.description || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      category: cats,
      stock: product.stock || '',
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      isLatest: product.isLatest !== false,
      isMostDemanding: product.isMostDemanding || false,
      isHighProfit: product.isHighProfit || false,
      status: product.status || 'active',
      meeshoLink: product.meeshoLink || '',
      flipkartLink: product.flipkartLink || '',
      amazonLink: product.amazonLink || '',
      rating: product.rating || '',
      reviewCount: product.reviewCount || '',
    });
    setImages((product.images || []).map(url => ({ preview: url.startsWith('http') ? url : `https://amshine-backend.onrender.com${url}`, url })));
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.price) { addToast('Title and price are required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      let savedProduct;
      if (editProduct) {
        const res = await api.put(`/products/${editProduct._id}`, payload);
        savedProduct = res.data.data || res.data;
      } else {
        const res = await api.post('/products', payload);
        savedProduct = res.data.data || res.data;
      }
      const newImages = images.filter(img => img.file);
      if (newImages.length > 0 && savedProduct?._id) {
        const fd = new FormData();
        newImages.forEach(img => fd.append('images', img.file));
        await api.post(`/products/${savedProduct._id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      addToast(editProduct ? 'Product updated!' : 'Product added!', 'success');
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      addToast('Product deleted', 'success');
      setDeleteId(null);
      fetchProducts();
    } catch { addToast('Failed to delete', 'error'); }
    finally { setDeleting(false); }
  };

  const handleToggleStatus = async (product) => {
    try {
      await api.put(`/products/${product._id}`, { isActive: !product.isActive });
      setProducts(prev => prev.map(p => p._id === product._id ? { ...p, isActive: !p.isActive } : p));
    } catch { addToast('Failed to update', 'error'); }
  };

  const handleExport = () => {
    const headers = ['Title', 'Price', 'Compare Price', 'Stock', 'Category', 'Rating', 'Reviews', 'Status', 'Meesho Link', 'Flipkart Link'];
    const rows = products.map(p => [p.title, p.price, p.comparePrice || '', p.stock, p.category?.name || '', p.rating || '', p.reviewCount || '', p.isActive ? 'Active' : 'Inactive', p.meeshoLink || '', p.flipkartLink || '']);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products.csv'; a.click();
    addToast('Products exported!', 'success');
  };

  const handleDownloadTemplate = () => {
    const headers = ['title', 'price', 'comparePrice', 'stock', 'description', 'rating', 'reviewCount', 'meeshoLink', 'flipkartLink'];
    const example = ['Sample Product', '999', '1499', '50', 'Product description here', '4.5', '120', 'https://meesho.com/...', 'https://flipkart.com/...'];
    const csv = [headers, example].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products_template.csv'; a.click();
  };

  const toggleCategory = (catId) => {
    setForm(f => ({
      ...f,
      category: f.category.includes(catId) ? f.category.filter(c => c !== catId) : [...f.category, catId]
    }));
  };

  const columns = [
    {
      key: 'images', label: 'Image', width: 60,
      render: (val) => (
        <div style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {val?.[0] ? <img src={val[0].startsWith('http') ? val[0] : `https://amshine-backend.onrender.com${val[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} /> : <span>📦</span>}
        </div>
      )
    },
    { key: 'title', label: 'Product', render: (v) => <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span> },
    { key: 'category', label: 'Category', render: (v) => <span style={{ background: '#EEF2FF', color: '#6366F1', padding: '2px 8px', borderRadius: 6, fontSize: 12 }}>{v?.name || '—'}</span> },
    { key: 'price', label: 'Price', render: (v, row) => <div><div style={{ fontWeight: 700 }}>₹{v?.toLocaleString()}</div>{row.comparePrice > v && <div style={{ fontSize: 11, color: '#9CA3AF', textDecoration: 'line-through' }}>₹{row.comparePrice?.toLocaleString()}</div>}</div> },
    { key: 'stock', label: 'Stock', render: (v) => <span style={{ color: v < 5 ? '#EF4444' : v < 20 ? '#F59E0B' : '#10B981', fontWeight: 600 }}>{v}</span> },
    {
      key: 'rating', label: 'Rating',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: '#B8860B', fontSize: 14 }}>★</span>
          <span style={{ fontWeight: 600, fontSize: 13 }}>{v || 0}</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({row.reviewCount || 0})</span>
        </div>
      )
    },
    {
      key: 'isActive', label: 'Status',
      render: (v, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 36, height: 20, borderRadius: 10, background: v !== false ? '#10B981' : '#E5E7EB', cursor: 'pointer', position: 'relative' }} onClick={() => handleToggleStatus(row)}>
            <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: v !== false ? 18 : 2, transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
          </div>
          <span style={{ fontSize: 12, color: v !== false ? '#10B981' : '#9CA3AF' }}>{v !== false ? 'Active' : 'Inactive'}</span>
        </div>
      )
    },
    {
      key: 'meeshoLink', label: 'Marketplace',
      render: (v, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          {row.meeshoLink && <a href={row.meeshoLink} target="_blank" rel="noreferrer" style={{ background: '#FF6B6B', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }} onClick={e => e.stopPropagation()}>M</a>}
          {row.flipkartLink && <a href={row.flipkartLink} target="_blank" rel="noreferrer" style={{ background: '#2874F0', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }} onClick={e => e.stopPropagation()}>F</a>}
          {row.amazonLink && <a href={row.amazonLink} target="_blank" rel="noreferrer" style={{ background: '#FF9900', color: '#fff', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }} onClick={e => e.stopPropagation()}>a</a>}
        </div>
      )
    },
    {
      key: '_id', label: 'Actions',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button className="btn btn-outline btn-sm" onClick={e => { e.stopPropagation(); openEdit(row); }}>✏️ Edit</button>
          <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setDeleteId(row._id); }}>🗑️</button>
        </div>
      )
    },
  ];

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-dark)' }}>Products</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{totalProducts} total products</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadTemplate}>📥 Template</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setImportModalOpen(true)}>📤 Import</button>
          <button className="btn btn-ghost btn-sm" onClick={handleExport}>📊 Export CSV</button>
          <button className="btn btn-primary" onClick={openAdd}>＋ Add Product</button>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <input className="form-control" placeholder="🔍 Search products..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} style={{ width: 260 }} />
        <select className="form-control" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }} style={{ width: 200 }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      <div className="card">
        <Table columns={columns} data={products} loading={loading} />
        <div style={{ padding: '0 16px 12px' }}>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProduct ? 'Edit Product' : 'Add New Product'} size="xl"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-ghost" onClick={() => { addToast('Saved as draft', 'success'); setModalOpen(false); }}>💾 Save Draft</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <><span className="spinner" /> Saving...</> : (editProduct ? '✅ Update' : '＋ Add Product')}
            </button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>

          {/* Title */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Product Title *</label>
            <input className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Enter product title" />
          </div>

          {/* Rich Text Editor */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Description</label>
            <RichEditor value={form.description} onChange={val => setForm(f => ({ ...f, description: val }))} />
          </div>

          {/* Price */}
          <div className="form-group">
            <label className="form-label">Price (₹) *</label>
            <input className="form-control" type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
          </div>

          {/* Compare Price */}
          <div className="form-group">
            <label className="form-label">Compare Price (₹)</label>
            <input className="form-control" type="number" value={form.comparePrice} onChange={e => setForm(f => ({ ...f, comparePrice: e.target.value }))} placeholder="0.00" />
          </div>

          {/* Stock */}
          <div className="form-group">
            <label className="form-label">Stock / Quantity</label>
            <input className="form-control" type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
          </div>

          {/* Categories */}
          <div className="form-group">
            <label className="form-label">Categories (select multiple)</label>
            <div style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '8px 12px', maxHeight: 120, overflowY: 'auto', background: '#fff' }}>
              {categories.map(c => (
                <label key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', cursor: 'pointer', fontSize: 13 }}>
                  <input type="checkbox" checked={form.category.includes(c._id)} onChange={() => toggleCategory(c._id)} />
                  {c.name}
                </label>
              ))}
              {categories.length === 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>No categories found</span>}
            </div>
          </div>

          {/* Rating */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">⭐ Rating (0-5)</label>
            <StarInput value={form.rating} onChange={val => setForm(f => ({ ...f, rating: val }))} />
          </div>

          {/* Review Count */}
          <div className="form-group">
            <label className="form-label">💬 Review Count</label>
            <input className="form-control" type="number" min="0" value={form.reviewCount} onChange={e => setForm(f => ({ ...f, reviewCount: e.target.value }))} placeholder="e.g. 120" />
          </div>

          {/* Spacer */}
          <div />

          {/* Marketplace Links */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">🛒 Marketplace Links (optional)</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#FF6B6B', marginBottom: 4 }}>🟥 Meesho</div>
                <input className="form-control" value={form.meeshoLink} onChange={e => setForm(f => ({ ...f, meeshoLink: e.target.value }))} placeholder="https://meesho.com/..." />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2874F0', marginBottom: 4 }}>🟦 Flipkart</div>
                <input className="form-control" value={form.flipkartLink} onChange={e => setForm(f => ({ ...f, flipkartLink: e.target.value }))} placeholder="https://flipkart.com/..." />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#FF9900', marginBottom: 4 }}>🟧 Amazon</div>
                <input className="form-control" value={form.amazonLink} onChange={e => setForm(f => ({ ...f, amazonLink: e.target.value }))} placeholder="https://amazon.in/..." />
              </div>
            </div>
          </div>

          {/* Listing Status */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">📊 Listing Status & Visibility</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { key: 'isActive', label: 'Active', desc: 'Visible to customers', color: '#10B981' },
                { key: 'isFeatured', label: 'Featured', desc: 'Show on homepage', color: '#6C63FF' },
                { key: 'isLatest', label: 'Latest', desc: 'Latest Products section', color: '#3B82F6' },
                { key: 'isMostDemanding', label: 'Most Demanding', desc: 'Most Demanding section', color: '#F59E0B' },
                { key: 'isHighProfit', label: 'High Profit', desc: 'High Profit Margin section', color: '#EF4444' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', border: `1.5px solid ${form[opt.key] ? opt.color : 'var(--border)'}`, borderRadius: 8, cursor: 'pointer', background: form[opt.key] ? `${opt.color}10` : '#fff', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={form[opt.key] || false} onChange={e => setForm(f => ({ ...f, [opt.key]: e.target.checked }))} style={{ accentColor: opt.color }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: form[opt.key] ? opt.color : 'var(--text-dark)' }}>{opt.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Images */}
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Product Images (multiple allowed)</label>
            <ImageUpload images={images} onChange={setImages} multiple />
          </div>
        </div>
      </Modal>

      <Modal isOpen={importModalOpen} onClose={() => setImportModalOpen(false)} title="Import Products from CSV" size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setImportModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={() => { addToast('Import feature coming soon!', 'info'); setImportModalOpen(false); }}>Import</button>
          </>
        }
      >
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📤</div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>Upload a CSV file to import products.</p>
          <button className="btn btn-ghost btn-sm" onClick={handleDownloadTemplate} style={{ marginBottom: 16 }}>📥 Download Template</button>
          <input ref={importFileRef} type="file" accept=".csv,.xlsx" style={{ display: 'none' }} />
          <div style={{ border: '2px dashed var(--border)', borderRadius: 12, padding: '24px', cursor: 'pointer' }} onClick={() => importFileRef.current?.click()}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>Click to select CSV file</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Supports .csv and .xlsx</div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Product" message="Are you sure? This cannot be undone." />
    </div>
  );
}