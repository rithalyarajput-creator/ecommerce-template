import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Categories.module.css';

const CAT_COLORS = [
  '#7C2D3E','#1E3A5F','#3D1A6E','#1A4A35','#5C3A1A',
  '#1A4A4A','#4A1A4A','#2A3A4A','#6B2A1A','#1A2A5A',
];

const API_BASE = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'https://amshine-backend.onrender.com';

// Jewelry SVG icons map
const JEWELRY_SVG = {
  'Necklaces': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="24" cy="32" r="10" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="32" r="5" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.3)"/>
      <path d="M14 32 Q12 18 24 14 Q36 18 34 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="24" cy="14" r="2.5" fill="white"/>
    </svg>
  ),
  'Earrings': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="16" cy="12" r="3" fill="white"/>
      <path d="M16 15 L16 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="16,22 11,32 21,32" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.35)"/>
      <circle cx="32" cy="12" r="3" fill="white"/>
      <path d="M32 15 L32 22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <polygon points="32,22 27,32 37,32" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.35)"/>
    </svg>
  ),
  'Rings': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="24" cy="26" r="13" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="26" r="8" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.15)"/>
      <polygon points="24,10 27,17 34,17 28,22 30,29 24,24 18,29 20,22 14,17 21,17" fill="white" opacity="0.9"/>
    </svg>
  ),
  'Bracelets': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <path d="M10 24 Q10 12 24 12 Q38 12 38 24 Q38 36 24 36 Q10 36 10 24Z" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="12" r="3" fill="white"/>
      <circle cx="38" cy="24" r="3" fill="white"/>
      <circle cx="24" cy="36" r="3" fill="white"/>
      <circle cx="10" cy="24" r="3" fill="white"/>
    </svg>
  ),
  'Bangles': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="3" fill="none"/>
      <circle cx="24" cy="24" r="10" stroke="white" strokeWidth="2" strokeDasharray="4 3" fill="none"/>
      <circle cx="24" cy="24" r="6" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.2)"/>
    </svg>
  ),
  'Jewelry Sets': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <polygon points="24,6 27,16 38,16 29,22 32,33 24,27 16,33 19,22 10,16 21,16" fill="white" opacity="0.95"/>
      <circle cx="14" cy="38" r="5" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.3)"/>
      <circle cx="34" cy="38" r="5" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.3)"/>
    </svg>
  ),
  'Anklets (Payal)': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <path d="M8 28 Q8 20 24 20 Q40 20 40 28 Q40 36 24 36 Q8 36 8 28Z" stroke="white" strokeWidth="2.5" fill="none"/>
      <line x1="18" y1="36" x2="16" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="24" y1="36" x2="24" y2="43" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <line x1="30" y1="36" x2="32" y2="42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="43" r="2" fill="white"/>
      <circle cx="24" cy="44" r="2" fill="white"/>
      <circle cx="32" cy="43" r="2" fill="white"/>
    </svg>
  ),
  'Mangalsutra': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <path d="M24 6 Q16 10 16 18 Q16 26 24 30 Q32 26 32 18 Q32 10 24 6Z" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.25)"/>
      <circle cx="19" cy="18" r="2.5" fill="white"/>
      <circle cx="29" cy="18" r="2.5" fill="white"/>
      <path d="M16 30 L14 42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <path d="M32 30 L34 42" stroke="white" strokeWidth="2" strokeLinecap="round"/>
      <ellipse cx="24" cy="40" rx="6" ry="3" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.2)"/>
    </svg>
  ),
  'Nose Pins / Nose Rings': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="24" cy="24" r="14" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="24" cy="24" r="9" stroke="white" strokeWidth="1.5" fill="none" strokeDasharray="2 2"/>
      <circle cx="24" cy="10" r="3.5" fill="white"/>
      <circle cx="24" cy="24" r="3" fill="rgba(255,255,255,0.5)"/>
    </svg>
  ),
  'Maang Tikka': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <line x1="24" y1="6" x2="24" y2="22" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="24" cy="6" r="3" fill="white"/>
      <circle cx="24" cy="28" r="8" stroke="white" strokeWidth="2.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="24" cy="28" r="4" fill="white" opacity="0.8"/>
      <circle cx="17" cy="22" r="2" fill="white" opacity="0.7"/>
      <circle cx="31" cy="22" r="2" fill="white" opacity="0.7"/>
    </svg>
  ),
  'Hair Accessories': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <path d="M8 20 Q8 10 24 10 Q40 10 40 20" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M12 20 L36 20" stroke="white" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="16" cy="20" r="3" fill="white"/>
      <circle cx="24" cy="20" r="3" fill="white"/>
      <circle cx="32" cy="20" r="3" fill="white"/>
      <path d="M16 20 L14 32 Q16 38 20 36 Q22 32 24 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M32 20 L34 32 Q32 38 28 36 Q26 32 24 30" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Brooches / Pins': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <polygon points="24,6 28,18 42,18 31,26 35,38 24,30 13,38 17,26 6,18 20,18" stroke="white" strokeWidth="2" fill="rgba(255,255,255,0.35)"/>
      <line x1="24" y1="38" x2="24" y2="46" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="22" y1="46" x2="24" y2="44" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  ),
  'Toe Rings (Bichiya)': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <circle cx="18" cy="22" r="9" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="18" cy="22" r="5" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="34" cy="28" r="7" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="34" cy="28" r="3.5" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.2)"/>
    </svg>
  ),
  'Body Jewelry': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <path d="M8 24 Q8 14 24 14 Q40 14 40 24 Q40 34 24 34 Q8 34 8 24Z" stroke="white" strokeWidth="2.5" fill="none"/>
      <path d="M16 24 Q16 20 24 20 Q32 20 32 24 Q32 28 24 28 Q16 28 16 24Z" stroke="white" strokeWidth="1.5" fill="rgba(255,255,255,0.2)"/>
      <circle cx="24" cy="14" r="2.5" fill="white"/>
      <circle cx="24" cy="34" r="2.5" fill="white"/>
      <circle cx="8" cy="24" r="2.5" fill="white"/>
      <circle cx="40" cy="24" r="2.5" fill="white"/>
    </svg>
  ),
  'Bridal Jewelry': (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" width="52" height="52">
      <polygon points="24,4 27,14 38,14 29,20 32,31 24,25 16,31 19,20 10,14 21,14" fill="white" opacity="0.95"/>
      <path d="M14 35 Q14 42 24 42 Q34 42 34 35" stroke="white" strokeWidth="2.5" fill="none"/>
      <circle cx="14" cy="35" r="2.5" fill="white"/>
      <circle cx="34" cy="35" r="2.5" fill="white"/>
      <circle cx="24" cy="42" r="2.5" fill="white"/>
    </svg>
  ),
};

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

  // Count products per category (category stored as array of strings/names)
  const getProductCount = (catName) => {
    return products.filter(p => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      return cats.some(c => (typeof c === 'object' ? c?.name : c) === catName);
    }).length;
  };

  // Get products for selected category
  const getCatProducts = (catName) => {
    return products.filter(p => {
      const cats = Array.isArray(p.category) ? p.category : [p.category];
      return cats.some(c => (typeof c === 'object' ? c?.name : c) === catName);
    });
  };

  const openAdd = () => { setForm({ name: '', emoji: '📦' }); setImage([]); setEditCat(null); setModalOpen(true); };
  const openEdit = (cat, e) => {
    e.stopPropagation();
    setEditCat(cat);
    setForm({ name: cat.name, emoji: cat.emoji || '📦' });
    setImage(cat.image ? [{ preview: cat.image.startsWith('http') ? cat.image : `${API_BASE}${cat.image}`, url: cat.image }] : []);
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

  const EMOJIS = ['💍','📿','💎','✨','👑','🌸','🌺','❤️','💫','🌟','🦋','🌙','⚡','👸','🔮'];

  // Category drill-down view
  if (selectedCat) {
    const catProds = getCatProducts(selectedCat.name);
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
                    ? <img src={p.images[0].startsWith('http') ? p.images[0] : `${API_BASE}${p.images[0]}`} alt={p.title} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e=>e.target.style.display='none'} />
                    : <span style={{ fontSize:32 }}>{JEWELRY_SVG[selectedCat?.name] || '💍'}</span>
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
            const count = getProductCount(cat.name);
            const bgColor = CAT_COLORS[idx % CAT_COLORS.length];
            const imgUrl = cat.image ? (cat.image.startsWith('http') ? cat.image : `${API_BASE}${cat.image}`) : null;
            const svgIcon = JEWELRY_SVG[cat.name];

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
                  ) : svgIcon ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.25))' }}>
                      {svgIcon}
                    </div>
                  ) : (
                    <span style={{ fontSize:52 }}>{cat.emoji || '💍'}</span>
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