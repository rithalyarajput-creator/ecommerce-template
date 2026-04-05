import React, { useEffect, useState } from 'react';

const statusConfig = {
  new:     { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B', label: 'New' },
  read:    { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6', label: 'Read' },
  replied: { bg: '#D1FAE5', color: '#065F46', dot: '#10B981', label: 'Replied' },
};

const subjectIcons = {
  'Order Enquiry':    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
  'Custom Jewellery': 'M12 6v6m0 0v6m0-6h6m-6 0H6',
  'Return / Exchange':'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  'Bulk Order':       'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
  'Other':            'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

const IconSVG = ({ path, size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const ICONS = {
  mail:    'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  phone:   'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
  user:    'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  tag:     'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  clock:   'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  msg:     'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
  refresh: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  trash:   'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  check:   'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  eye:     'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
  reply:   'M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6',
  close:   'M6 18L18 6M6 6l12 12',
  leads:   'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
};

export default function Leads() {
  const [leads, setLeads]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]     = useState('all');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res  = await fetch('https://amshine-backend.onrender.com/api/leads');
      const data = await res.json();
      if (data.success) setLeads(data.leads);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeads(); }, []);

  const updateStatus = async (id, status) => {
    await fetch(`https://amshine-backend.onrender.com/api/leads/${id}/status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setLeads(prev => prev.map(l => l._id === id ? { ...l, status } : l));
    if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    await fetch(`https://amshine-backend.onrender.com/api/leads/${id}`, { method: 'DELETE' });
    setLeads(prev => prev.filter(l => l._id !== id));
    setSelected(null);
  };

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);
  const counts = { all: leads.length, new: leads.filter(l=>l.status==='new').length, read: leads.filter(l=>l.status==='read').length, replied: leads.filter(l=>l.status==='replied').length };

  const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtTime = (d) => new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <style>{`
        .leads-wrap { padding: 28px 32px; font-family: 'Segoe UI', sans-serif; background: #F8F9FB; min-height: 100vh; }
        .leads-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .leads-title-row { display: flex; align-items: center; gap: 12px; }
        .leads-icon-box { width: 44px; height: 44px; background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .leads-title { font-size: 22px; font-weight: 700; color: #0F172A; margin: 0; }
        .leads-subtitle { font-size: 13px; color: #64748B; margin: 2px 0 0; }
        .new-badge { background: #EF4444; color: #fff; border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 700; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
        .refresh-btn { display: flex; align-items: center; gap: 6px; padding: 9px 18px; background: #fff; border: 1.5px solid #E2E8F0; border-radius: 10px; font-size: 13px; font-weight: 600; color: #475569; cursor: pointer; transition: all .2s; }
        .refresh-btn:hover { background: #F1F5F9; border-color: #CBD5E1; }

        .stats-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
        .stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1.5px solid #E2E8F0; display: flex; align-items: center; gap: 14px; }
        .stat-icon { width: 42px; height: 42px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .stat-num { font-size: 24px; font-weight: 800; color: #0F172A; line-height: 1; }
        .stat-lbl { font-size: 12px; color: #64748B; margin-top: 3px; font-weight: 500; }

        .filter-bar { display: flex; gap: 6px; margin-bottom: 18px; }
        .filter-btn { padding: 7px 16px; border-radius: 8px; border: 1.5px solid #E2E8F0; background: #fff; font-size: 13px; font-weight: 600; color: #64748B; cursor: pointer; transition: all .2s; display: flex; align-items: center; gap: 6px; }
        .filter-btn.active { background: #0F172A; color: #fff; border-color: #0F172A; }
        .filter-btn:not(.active):hover { background: #F8FAFC; }
        .filter-count { background: rgba(255,255,255,0.2); border-radius: 999px; padding: 1px 7px; font-size: 11px; }
        .filter-btn:not(.active) .filter-count { background: #F1F5F9; color: #475569; }

        .table-card { background: #fff; border-radius: 16px; border: 1.5px solid #E2E8F0; overflow: hidden; }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: #F8FAFC; border-bottom: 1.5px solid #E2E8F0; }
        th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.6px; white-space: nowrap; }
        tbody tr { border-bottom: 1px solid #F1F5F9; transition: background .15s; cursor: pointer; }
        tbody tr:last-child { border-bottom: none; }
        tbody tr:hover { background: #F8FAFC; }
        td { padding: 14px 16px; font-size: 13.5px; color: #334155; vertical-align: middle; }

        .lead-name { font-weight: 700; color: #0F172A; display: flex; align-items: center; gap: 8px; }
        .lead-avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0; }
        .lead-email { color: #64748B; font-size: 12.5px; margin-top: 2px; }
        .subject-chip { display: inline-flex; align-items: center; gap: 5px; background: #F1F5F9; color: #475569; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 500; }
        .status-dot { width: 7px; height: 7px; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .status-chip { display: inline-flex; align-items: center; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 600; }
        .date-cell { color: #64748B; font-size: 12.5px; }
        .date-time { color: #94A3B8; font-size: 11.5px; margin-top: 2px; }

        .actions-cell { display: flex; gap: 6px; align-items: center; }
        .act-btn { width: 30px; height: 30px; border-radius: 7px; border: 1.5px solid #E2E8F0; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; }
        .act-btn:hover { transform: translateY(-1px); }
        .act-btn.read:hover { background: #EFF6FF; border-color: #93C5FD; }
        .act-btn.reply:hover { background: #F0FDF4; border-color: #86EFAC; }
        .act-btn.del:hover { background: #FEF2F2; border-color: #FCA5A5; }

        .empty-state { padding: 80px 20px; text-align: center; color: #94A3B8; }
        .empty-icon { width: 60px; height: 60px; background: #F1F5F9; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .empty-title { font-size: 16px; font-weight: 600; color: #475569; margin-bottom: 6px; }

        /* Modal */
        .modal-overlay { position: fixed; inset: 0; background: rgba(15,23,42,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; backdrop-filter: blur(4px); }
        .modal-box { background: #fff; border-radius: 20px; width: 560px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 80px rgba(0,0,0,0.25); }
        .modal-header { padding: 24px 28px 0; display: flex; justify-content: space-between; align-items: flex-start; }
        .modal-avatar { width: 52px; height: 52px; border-radius: 14px; background: linear-gradient(135deg, #1a1a2e, #16213e); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 700; flex-shrink: 0; }
        .modal-name { font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 4px; }
        .modal-meta { font-size: 13px; color: #64748B; }
        .modal-close { width: 36px; height: 36px; border-radius: 9px; border: 1.5px solid #E2E8F0; background: #F8FAFC; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
        .modal-close:hover { background: #F1F5F9; }
        .modal-body { padding: 20px 28px; }
        .modal-divider { height: 1px; background: #F1F5F9; margin: 16px 0; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .info-item { background: #F8FAFC; border-radius: 10px; padding: 12px 14px; border: 1px solid #F1F5F9; }
        .info-label { font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; margin-bottom: 5px; }
        .info-value { font-size: 13.5px; color: #0F172A; font-weight: 600; }
        .msg-box { background: #F8FAFC; border-radius: 12px; padding: 16px; border: 1px solid #F1F5F9; }
        .msg-label { font-size: 11px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 5px; margin-bottom: 10px; }
        .msg-text { font-size: 14px; color: #334155; line-height: 1.75; }
        .modal-footer { padding: 0 28px 24px; display: flex; gap: 8px; flex-wrap: wrap; }
        .mf-btn { flex: 1; min-width: 100px; padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; border: 1.5px solid transparent; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all .2s; }
        .mf-read { background: #EFF6FF; color: #1D4ED8; border-color: #BFDBFE; }
        .mf-read:hover { background: #DBEAFE; }
        .mf-replied { background: #F0FDF4; color: #166534; border-color: #BBF7D0; }
        .mf-replied:hover { background: #DCFCE7; }
        .mf-email { background: #0F172A; color: #fff; border-color: #0F172A; }
        .mf-email:hover { background: #1E293B; }
        .mf-del { background: #FEF2F2; color: #DC2626; border-color: #FECACA; }
        .mf-del:hover { background: #FEE2E2; }

        .skeleton { background: linear-gradient(90deg, #F1F5F9 25%, #E2E8F0 50%, #F1F5F9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>

      <div className="leads-wrap">
        {/* Header */}
        <div className="leads-header">
          <div className="leads-title-row">
            <div className="leads-icon-box">
              <IconSVG path={ICONS.leads} size={22} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h1 className="leads-title">Contact Leads</h1>
                {counts.new > 0 && <span className="new-badge">{counts.new} New</span>}
              </div>
              <p className="leads-subtitle">All enquiries from the contact form</p>
            </div>
          </div>
          <button className="refresh-btn" onClick={fetchLeads}>
            <IconSVG path={ICONS.refresh} size={14} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="stats-row">
          {[
            { label: 'Total Leads', num: counts.all, bg: '#EFF6FF', color: '#3B82F6', icon: ICONS.leads },
            { label: 'New', num: counts.new, bg: '#FEF3C7', color: '#F59E0B', icon: ICONS.mail },
            { label: 'Read', num: counts.read, bg: '#DBEAFE', color: '#3B82F6', icon: ICONS.eye },
            { label: 'Replied', num: counts.replied, bg: '#D1FAE5', color: '#10B981', icon: ICONS.reply },
          ].map((s, i) => (
            <div className="stat-card" key={i}>
              <div className="stat-icon" style={{ background: s.bg }}>
                <IconSVG path={s.icon} size={20} color={s.color} />
              </div>
              <div>
                <div className="stat-num">{s.num}</div>
                <div className="stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="filter-bar">
          {['all', 'new', 'read', 'replied'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="table-card">
          {loading ? (
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 52 }} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <IconSVG path={ICONS.mail} size={26} color="#CBD5E1" />
              </div>
              <div className="empty-title">No leads yet</div>
              <div style={{ fontSize: 13 }}>Contact form submissions will appear here</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Contact</th>
                    <th>Phone</th>
                    <th>Subject</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(lead => {
                    const sc = statusConfig[lead.status] || statusConfig.new;
                    const subIcon = subjectIcons[lead.subject] || subjectIcons['Other'];
                    return (
                      <tr key={lead._id} onClick={() => setSelected(lead)}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="lead-avatar">{lead.name?.[0]?.toUpperCase()}</div>
                            <div>
                              <div className="lead-name" style={{ fontWeight: lead.status === 'new' ? 800 : 600 }}>{lead.name}</div>
                              <div className="lead-email">{lead.email}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: '#64748B', fontSize: 13 }}>{lead.phone || '—'}</td>
                        <td>
                          {lead.subject ? (
                            <span className="subject-chip">
                              <IconSVG path={subIcon} size={12} color="#64748B" />
                              {lead.subject}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          <div className="date-cell">{new Date(lead.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="date-time">{new Date(lead.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </td>
                        <td>
                          <span className="status-chip" style={{ background: sc.bg, color: sc.color }}>
                            <span className="status-dot" style={{ background: sc.dot }} />
                            {sc.label}
                          </span>
                        </td>
                        <td onClick={e => e.stopPropagation()}>
                          <div className="actions-cell">
                            <button className="act-btn read" title="Mark Read" onClick={() => updateStatus(lead._id, 'read')}>
                              <IconSVG path={ICONS.eye} size={14} color="#3B82F6" />
                            </button>
                            <button className="act-btn reply" title="Mark Replied" onClick={() => updateStatus(lead._id, 'replied')}>
                              <IconSVG path={ICONS.check} size={14} color="#10B981" />
                            </button>
                            <button className="act-btn del" title="Delete" onClick={() => deleteLead(lead._id)}>
                              <IconSVG path={ICONS.trash} size={14} color="#EF4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div className="modal-avatar">{selected.name?.[0]?.toUpperCase()}</div>
                <div>
                  <h3 className="modal-name">{selected.name}</h3>
                  <div className="modal-meta">
                    <span className="status-chip" style={{ background: statusConfig[selected.status]?.bg, color: statusConfig[selected.status]?.color, padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                      <span className="status-dot" style={{ background: statusConfig[selected.status]?.dot }} />
                      {statusConfig[selected.status]?.label}
                    </span>
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>
                <IconSVG path={ICONS.close} size={16} color="#64748B" />
              </button>
            </div>

            <div className="modal-body">
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-label"><IconSVG path={ICONS.mail} size={11} color="#94A3B8" /> Email</div>
                  <div className="info-value" style={{ fontSize: 12, wordBreak: 'break-all' }}>{selected.email}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><IconSVG path={ICONS.phone} size={11} color="#94A3B8" /> Phone</div>
                  <div className="info-value">{selected.phone || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><IconSVG path={ICONS.tag} size={11} color="#94A3B8" /> Subject</div>
                  <div className="info-value">{selected.subject || '—'}</div>
                </div>
                <div className="info-item">
                  <div className="info-label"><IconSVG path={ICONS.clock} size={11} color="#94A3B8" /> Received</div>
                  <div className="info-value" style={{ fontSize: 12 }}>
                    {new Date(selected.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(selected.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="msg-box">
                <div className="msg-label"><IconSVG path={ICONS.msg} size={11} color="#94A3B8" /> Message</div>
                <p className="msg-text">{selected.message}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="mf-btn mf-read" onClick={() => updateStatus(selected._id, 'read')}>
                <IconSVG path={ICONS.eye} size={14} /> Mark Read
              </button>
              <button className="mf-btn mf-replied" onClick={() => updateStatus(selected._id, 'replied')}>
                <IconSVG path={ICONS.check} size={14} /> Replied
              </button>
              <a href={`mailto:${selected.email}`} className="mf-btn mf-email" style={{ textDecoration: 'none' }}>
                <IconSVG path={ICONS.reply} size={14} color="#fff" /> Reply via Email
              </a>
              <button className="mf-btn mf-del" onClick={() => deleteLead(selected._id)}>
                <IconSVG path={ICONS.trash} size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}