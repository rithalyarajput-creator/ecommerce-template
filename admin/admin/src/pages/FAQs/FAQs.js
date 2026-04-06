import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const CATEGORIES = ['General', 'Product', 'Shipping', 'Returns', 'Payment', 'Care'];

export default function FAQs() {
  const [faqs, setFaqs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editFaq, setEditFaq] = useState(null);
  const [form, setForm]       = useState({ question: '', answer: '', category: 'General', order: 0, isActive: true, showOnHome: false });
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving]   = useState(false);
  const { addToast } = useToast();

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/faqs');
      if (res.data.success) setFaqs(res.data.faqs);
    } catch { addToast('Failed to load FAQs', 'error'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchFaqs(); }, []);

  const openAdd = () => {
    setEditFaq(null);
    setForm({ question: '', answer: '', category: 'General', order: faqs.length + 1, isActive: true, showOnHome: false });
    setModalOpen(true);
  };

  const openEdit = (f) => {
    setEditFaq(f);
    setForm({ question: f.question, answer: f.answer, category: f.category, order: f.order, isActive: f.isActive, showOnHome: f.showOnHome || false });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim()) { addToast('Question and answer required', 'error'); return; }
    setSaving(true);
    try {
      const res = editFaq
        ? await api.put(`/faqs/${editFaq._id}`, form)
        : await api.post('/faqs', form);
      if (res.data.success) {
        addToast(editFaq ? 'FAQ updated!' : 'FAQ added!', 'success');
        setModalOpen(false);
        fetchFaqs();
      } else { addToast(res.data.message || 'Failed', 'error'); }
    } catch { addToast('Server error', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/faqs/${deleteId}`);
      addToast('FAQ deleted', 'success');
      setDeleteId(null);
      fetchFaqs();
    } catch { addToast('Delete failed', 'error'); }
  };

  const toggleField = async (faq, field) => {
    try {
      const res = await api.put(`/faqs/${faq._id}`, { ...faq, [field]: !faq[field] });
      if (res.data.success) setFaqs(prev => prev.map(f => f._id === faq._id ? res.data.faq : f));
    } catch { addToast('Update failed', 'error'); }
  };

  const homeCount = faqs.filter(f => f.showOnHome && f.isActive).length;

  return (
    <div className="page-container">
      <style>{`
        .faq-toggle { position:relative; display:inline-flex; align-items:center; cursor:pointer; }
        .faq-toggle input { opacity:0; width:0; height:0; position:absolute; }
        .faq-toggle-track { width:36px; height:20px; background:#E2E8F0; border-radius:999px; transition:.2s; position:relative; }
        .faq-toggle input:checked + .faq-toggle-track { background:#10B981; }
        .faq-toggle-track::after { content:''; position:absolute; top:3px; left:3px; width:14px; height:14px; background:#fff; border-radius:50%; transition:.2s; box-shadow:0 1px 3px rgba(0,0,0,.2); }
        .faq-toggle input:checked + .faq-toggle-track::after { left:19px; }
        .faq-toggle input:checked + .home-toggle-track { background:#B8860B; }
      `}</style>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>FAQs</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>
            Manage FAQs &mdash; <strong style={{ color:'#B8860B' }}>{homeCount}</strong> showing on homepage
          </p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add FAQ</button>
      </div>

      <div style={{ display:'flex', gap:20, marginBottom:16, fontSize:12, color:'var(--text-muted)' }}>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'#10B981', display:'inline-block' }} /> Active on website
        </span>
        <span style={{ display:'flex', alignItems:'center', gap:6 }}>
          <span style={{ width:10, height:10, borderRadius:'50%', background:'#B8860B', display:'inline-block' }} /> Show on Homepage
        </span>
      </div>

      {loading ? (
        <div style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {faqs.map((faq, i) => (
            <div key={faq._id} className="card" style={{ padding:'16px 20px' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, flexWrap:'wrap' }}>
                    <span style={{ width:24, height:24, borderRadius:'50%', background:'var(--primary)', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, flexShrink:0 }}>{i+1}</span>
                    <span style={{ background:'#EEF2FF', color:'#6366F1', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:600 }}>{faq.category}</span>
                    <span style={{ background: faq.isActive ? '#D1FAE5' : '#F3F4F6', color: faq.isActive ? '#10B981' : '#9CA3AF', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:600 }}>
                      {faq.isActive ? 'Active' : 'Hidden'}
                    </span>
                    {faq.showOnHome && faq.isActive && (
                      <span style={{ background:'#FEF3C7', color:'#92400E', padding:'2px 10px', borderRadius:99, fontSize:11, fontWeight:600 }}>Homepage</span>
                    )}
                  </div>
                  <div style={{ fontWeight:600, fontSize:14, marginBottom:6 }}>Q: {faq.question}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', lineHeight:1.6 }}>A: {faq.answer}</div>
                </div>

                <div style={{ display:'flex', flexDirection:'column', gap:10, alignItems:'flex-end', flexShrink:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>Active</span>
                    <label className="faq-toggle">
                      <input type="checkbox" checked={faq.isActive} onChange={() => toggleField(faq, 'isActive')} />
                      <span className="faq-toggle-track" />
                    </label>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:500 }}>Homepage</span>
                    <label className="faq-toggle">
                      <input type="checkbox" checked={faq.showOnHome || false} onChange={() => toggleField(faq, 'showOnHome')} />
                      <span className="faq-toggle-track home-toggle-track" />
                    </label>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-outline btn-sm" onClick={() => openEdit(faq)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(faq._id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editFaq ? 'Edit FAQ' : 'Add FAQ'} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editFaq ? 'Update FAQ' : 'Add FAQ'}
            </button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Question *</label>
          <input className="form-control" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} placeholder="Enter the question..." />
        </div>
        <div className="form-group">
          <label className="form-label">Answer *</label>
          <textarea className="form-control" value={form.answer} onChange={e => setForm(f => ({ ...f, answer: e.target.value }))} placeholder="Enter the answer..." rows={4} />
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Display Order</label>
            <input className="form-control" type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} />
          </div>
        </div>
        <div style={{ display:'flex', gap:24, marginTop:8 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
            <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
            Show on website
          </label>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13 }}>
            <input type="checkbox" checked={form.showOnHome} onChange={e => setForm(f => ({ ...f, showOnHome: e.target.checked }))} />
            <span style={{ color:'#B8860B', fontWeight:600 }}>Show on Homepage</span>
          </label>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        loading={false} title="Delete FAQ" message="Are you sure you want to delete this FAQ?" />
    </div>
  );
}