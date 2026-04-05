import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../components/Modal/Modal';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const generateCode = () => 'AMB' + Math.random().toString(36).substring(2, 8).toUpperCase();

const EMPTY = {
  code: '', description: '', type: 'percentage', value: '', maxDiscount: '',
  minOrder: '', totalLimit: '', perUserLimit: '1', startDate: '', endDate: '', isActive: true,
};

export default function Offers() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons');
      const arr = res.data?.data || [];
      setCoupons(Array.isArray(arr) ? arr : []);
    } catch { addToast('Failed to load coupons', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  // Analytics
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.isActive).length;
  const totalUsed = coupons.reduce((s, c) => s + (c.usedCount || 0), 0);
  const expiredCoupons = coupons.filter(c => c.endDate && new Date(c.endDate) < new Date()).length;

  const openAdd = () => { setForm({ ...EMPTY, code: generateCode() }); setEditCoupon(null); setModalOpen(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({
      ...c,
      startDate: c.startDate ? c.startDate.split('T')[0] : '',
      endDate: c.endDate ? c.endDate.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.code || !form.value) { addToast('Code and value required', 'error'); return; }
    setSaving(true);
    try {
      if (editCoupon) {
        const res = await api.put(`/coupons/${editCoupon._id}`, form);
        setCoupons(cs => cs.map(c => c._id === editCoupon._id ? res.data.data : c));
        addToast('Coupon updated!', 'success');
      } else {
        const res = await api.post('/coupons', form);
        setCoupons(cs => [res.data.data, ...cs]);
        addToast('Coupon created!', 'success');
      }
      setModalOpen(false);
    } catch (e) { addToast(e?.response?.data?.message || 'Failed to save', 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/coupons/${deleteId}`);
      setCoupons(cs => cs.filter(c => c._id !== deleteId));
      addToast('Coupon deleted', 'success');
    } catch { addToast('Failed to delete', 'error'); }
    finally { setDeleteId(null); }
  };

  const toggleActive = async (coupon) => {
    try {
      const res = await api.put(`/coupons/${coupon._id}`, { ...coupon, isActive: !coupon.isActive });
      setCoupons(cs => cs.map(c => c._id === coupon._id ? res.data.data : c));
      addToast(`Coupon ${!coupon.isActive ? 'activated' : 'deactivated'}!`, 'success');
    } catch { addToast('Failed', 'error'); }
  };

  const isExpired = (c) => c.endDate && new Date(c.endDate) < new Date();

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Offers & Coupons</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Manage discount coupons</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>＋ Create Coupon</button>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Coupons', value: totalCoupons, color: '#6366F1', bg: '#EEF2FF' },
          { label: 'Active', value: activeCoupons, color: '#10B981', bg: '#F0FDF4' },
          { label: 'Total Used', value: totalUsed, color: '#F59E0B', bg: '#FFFBEB' },
          { label: 'Expired', value: expiredCoupons, color: '#EF4444', bg: '#FEF2F2' },
        ].map((c, i) => (
          <div key={i} style={{ background: c.bg, border: `1px solid ${c.color}30`, borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: c.color, fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>{c.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* Coupon Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" /></div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎫</div>
          <p>No coupons yet. Create your first coupon!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {coupons.map(coupon => (
            <div key={coupon._id} className="card" style={{
              padding: 20,
              borderLeft: `4px solid ${isExpired(coupon) ? '#EF4444' : coupon.isActive ? '#10B981' : '#9CA3AF'}`,
              opacity: isExpired(coupon) ? 0.7 : 1,
            }}>
              {/* Top */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, letterSpacing: 2, color: 'var(--primary)' }}>{coupon.code}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{coupon.description || '—'}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ background: isExpired(coupon) ? '#FEE2E2' : coupon.isActive ? '#D1FAE5' : '#F3F4F6', color: isExpired(coupon) ? '#EF4444' : coupon.isActive ? '#10B981' : '#9CA3AF', padding: '3px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600 }}>
                    {isExpired(coupon) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  { label: 'Discount', value: coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`, color: '#EF4444' },
                  { label: 'Min Order', value: `₹${coupon.minOrder || 0}`, color: '#3B82F6' },
                  { label: 'Used', value: `${coupon.usedCount || 0}${coupon.totalLimit ? `/${coupon.totalLimit}` : ''} times`, color: '#F59E0B' },
                  { label: 'Expires', value: coupon.endDate ? new Date(coupon.endDate).toLocaleDateString('en-IN') : 'No limit', color: '#6366F1' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--content-bg)', borderRadius: 8, padding: '8px 12px' }}>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: s.color, marginTop: 2 }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => openEdit(coupon)}>✏️ Edit</button>
                <button className="btn btn-outline btn-sm" style={{ flex: 1, color: coupon.isActive ? '#F59E0B' : '#10B981', borderColor: coupon.isActive ? '#F59E0B' : '#10B981' }} onClick={() => toggleActive(coupon)}>
                  {coupon.isActive ? '⏸ Disable' : '▶ Enable'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setDeleteId(coupon._id)}>🗑️</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editCoupon ? 'Edit Coupon' : 'Create Coupon'} size="md"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : editCoupon ? '✅ Update' : '＋ Create'}</button>
          </>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Coupon Code *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. SAVE20" style={{ flex: 1 }} />
              <button className="btn btn-ghost" onClick={() => setForm(f => ({ ...f, code: generateCode() }))}>🔄</button>
            </div>
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label className="form-label">Description</label>
            <input className="form-control" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="e.g. Welcome discount" />
          </div>
          <div className="form-group">
            <label className="form-label">Type *</label>
            <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (₹)</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Value *</label>
            <input className="form-control" type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '20' : '100'} />
          </div>
          {form.type === 'percentage' && (
            <div className="form-group">
              <label className="form-label">Max Discount (₹)</label>
              <input className="form-control" type="number" value={form.maxDiscount} onChange={e => setForm(f => ({ ...f, maxDiscount: e.target.value }))} placeholder="No limit" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Min Order (₹)</label>
            <input className="form-control" type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: e.target.value }))} placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Total Usage Limit</label>
            <input className="form-control" type="number" value={form.totalLimit} onChange={e => setForm(f => ({ ...f, totalLimit: e.target.value }))} placeholder="Unlimited" />
          </div>
          <div className="form-group">
            <label className="form-label">Per User Limit</label>
            <input className="form-control" type="number" value={form.perUserLimit} onChange={e => setForm(f => ({ ...f, perUserLimit: e.target.value }))} placeholder="1" />
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input className="form-control" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input className="form-control" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <div className="form-group" style={{ gridColumn: '1/-1' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} style={{ width: 16, height: 16 }} />
              <span className="form-label" style={{ marginBottom: 0 }}>Active (Enable this coupon)</span>
            </label>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Coupon" message="Are you sure you want to delete this coupon?" />
    </div>
  );
}
