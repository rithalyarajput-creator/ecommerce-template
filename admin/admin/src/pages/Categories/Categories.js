import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Categories.module.css';

const CAT_COLORS = [
  '#6B1A2A','#1A3A6A','#3A1A6A','#1A4A1A','#4A3A1A',
  '#1A4A4A','#4A1A4A','#2A3A4A','#4A2A1A','#1A2A4A',
];

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState({ name: '', emoji: '📦' });
  const [image, setImage] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedCat, setSelectedCat] = useState(null); // for drill-down
  const { addToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products?limit=200'),
      ]);
      const cats = catRes.data?.categories || catRes.data?.data || catRes.data || [];
      const prods = prodRes.data?.data?.products || prodRes.data?.products || prodRes.data?.data || [];
      setCategories(Array.isArray(cats) ? cats : []);
      setProducts(Array.isArray(prods) ? prods : []);
    } catch {
      addToast('Failed to load', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Count products per category
  const getProductCount = (catId) => {
    return products.filter(p => {
      const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
      return pCatId === catId;
    }).length;
  };

  // Get products for selected category
  const getCatProducts = (catId) => {
    return products.filter(p => {
      const pCatId = typeof p.category === 'object' ? p.category?._id : p.category;
      return pCatId === catId;
    });
  };

  const openAdd = () => { setForm({ name: '', emoji: '📦' }); setImage([]); setEditCat(null); setModalOpen(true); };
  const openEdit = (cat, e) => {
    e.stopPropagation();
    setEditCat(cat);
    setForm({ name: cat.name, emoji: cat.emoji || '📦' });
    setImage(cat.image ? [{ preview: cat.image.startsWith('http') ? cat.image : `https://amshine-backend.onrender.com${cat.image}`, url: cat.image }] : []);
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { addToast('Category name is required', 'error'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, emoji: form.emoji };
      let savedCat;
      if (editCat) {
        const res = await api.put(`/categories/${editCat._id}`, payload);
        savedCat = res.data?.data || res.data;
        addToast('Category updated!', 'success');
      } else {
        const res = await api.post('/categories', payload);
        savedCat = res.data?.data || res.data;
        addToast('Category added!', 'success');
      }
      // Upload image if selected
      if (image[0]?.file && savedCat?._id) {
        const fd = new FormData();
        fd.append('image', image[0].file);
        await api.post(`/categories/${savedCat._id}/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }).catch(() => {});
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/categories/${deleteId}`);
      addToast('Category deleted', 'success');
      setDeleteId(null);
      fetchData();
    } catch {
      addToast('Failed to delete', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const EMOJIS = ['📦','👗','💍','📿','⭕','💎','✨','🏠','⚡','📚','💪','👜','👠','🌸','🎁'];

  // Category drill-down view
  if (selectedCat) {
    const catProds = getCatProducts(selectedCat._id);
    return (
      <div className="page-container">
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <button onClick={() => setSelectedCat(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
              ← Back
            </button>
            <div>
              <h1 style={{ fontSize:22, fontWeight:700 }}>{selectedCat.emoji || '📦'} {selectedCat.name}</h1>
              <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{catProds.length} products in this category</p>
            </div>
          </div>
        </div>

        {catProds.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 40px' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📦</div>
            <h3 style={{ fontWeight:600, marginBottom:8 }}>No products in this category</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Add products from Products page and assign this category</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:16 }}>
            {catProds.map(p => (
              <div key={p._id} className="card" style={{ padding:16, cursor:'pointer' }}>
                <div style={{ width:'100%', aspectRatio:'1/1', borderRadius:8, overflow:'hidden', background:'#F3F4F6', marginBottom:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {p.images?.[0]
                    ? <img src={p.images[0].startsWith('http') ? p.images[0] : `https://amshine-backend.onrender.com${p.images[0]}`} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    : <span style={{ fontSize:32 }}>📦</span>
                  }
                </div>
                <div style={{ fontWeight:600, fontSize:13, marginBottom:4, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:700, color:'var(--primary)', fontSize:14 }}>₹{p.price?.toLocaleString()}</span>
                  <span style={{ fontSize:11, background: p.isActive!==false ? '#D1FAE5':'#F3F4F6', color: p.isActive!==false ? '#10B981':'#9CA3AF', padding:'2px 8px', borderRadius:99, fontWeight:600 }}>
                    {p.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>Categories</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{categories.length} categories • {products.length} total products</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Add Category</button>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg" /></div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📂</div>
          <h3>No categories yet</h3>
          <p style={{ color:'var(--text-muted)', marginTop:8 }}>Add your first product category</p>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px, 1fr))', gap:16 }}>
          {categories.map((cat, idx) => {
            const count = getProductCount(cat._id);
            const bgColor = CAT_COLORS[idx % CAT_COLORS.length];
            const imgUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `https://amshine-backend.onrender.com${cat.image}`) : null;

            return (
              <div key={cat._id} onClick={() => setSelectedCat(cat)}
                style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', boxShadow:'0 2px 12px rgba(0,0,0,0.08)', transition:'transform 0.2s, box-shadow 0.2s', background:'#fff' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.14)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'; }}
              >
                {/* Image area */}
                <div style={{ height:140, background: imgUrl ? 'transparent' : bgColor, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', overflow:'hidden' }}>
                  {imgUrl ? (
                    <img src={imgUrl} alt={cat.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>{ e.target.style.display='none'; }} />
                  ) : (
                    <span style={{ fontSize:56 }}>{cat.emoji || '📦'}</span>
                  )}
                  {/* Product count badge */}
                  <div style={{ position:'absolute', top:10, right:10, background:'rgba(0,0,0,0.55)', color:'#fff', borderRadius:99, padding:'3px 10px', fontSize:12, fontWeight:700 }}>
                    {count} products
                  </div>
                </div>

                {/* Info */}
                <div style={{ padding:'14px 16px' }}>
                  <div style={{ fontWeight:700, fontSize:15, marginBottom:4 }}>{cat.name}</div>
                  <div style={{ fontSize:12, color:'var(--text-muted)' }}>
                    {count === 0 ? 'No products yet' : `${count} product${count !== 1 ? 's' : ''}`}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ padding:'0 16px 14px', display:'flex', gap:8 }} onClick={e => e.stopPropagation()}>
                  <button className="btn btn-outline btn-sm" style={{ flex:1 }} onClick={e => openEdit(cat, e)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={e => { e.stopPropagation(); setDeleteId(cat._id); }}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCat ? 'Edit Category' : 'Add Category'} size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : (editCat ? '💾 Update' : '＋ Add')}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Category Name *</label>
          <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Bridal Sets" />
        </div>

        <div className="form-group">
          <label className="form-label">Emoji (fallback icon)</label>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:8 }}>
            {EMOJIS.map(em => (
              <button key={em} type="button" onClick={() => setForm(f => ({ ...f, emoji: em }))}
                style={{ width:36, height:36, borderRadius:8, border: form.emoji===em ? '2px solid var(--primary)' : '1px solid var(--border)', background: form.emoji===em ? '#EEF2FF' : '#fff', fontSize:18, cursor:'pointer' }}>
                {em}
              </button>
            ))}
          </div>
          <div style={{ fontSize:12, color:'var(--text-muted)' }}>Shows when no image is uploaded</div>
        </div>

        <div className="form-group">
          <label className="form-label">Category Image</label>
          <ImageUpload images={image} onChange={setImage} multiple={false} />
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} title="Delete Category" message="Are you sure you want to delete this category?" />
    </div>
  );
}