import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const IconCalendar = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

const IconDownload = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/>
    <path d="M9 6V4h6v2"/>
  </svg>
);

const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  const fetchSubs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/newsletter/subscribers');
      const arr = res.data?.data || res.data?.subscribers || res.data || [];
      setSubs(Array.isArray(arr) ? arr : []);
    } catch {
      // Fallback dummy data if backend not connected
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSubs(); }, []);

  const handleUnsubscribe = async (id) => {
    try {
      await api.delete(`/newsletter/subscribers/${id}`);
      setSubs(prev => prev.filter(s => s._id !== id));
      addToast('Subscriber removed', 'success');
    } catch {
      addToast('Failed to remove', 'error');
    }
  };

  const handleExport = () => {
    const csv = ['Email,Name,Date,Status',
      ...subs.map(s => `${s.email},${s.name || ''},${s.createdAt ? new Date(s.createdAt).toLocaleDateString('en-IN') : s.date || ''},${s.status || 'active'}`)
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'subscribers.csv'; a.click();
    addToast('Exported successfully!', 'success');
  };

  const thisMonth = new Date().toISOString().slice(0, 7);
  const thisMonthCount = subs.filter(s => (s.createdAt || s.date || '').startsWith(thisMonth)).length;
  const filtered = subs.filter(s => !search || s.email?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:'var(--text-dark)' }}>Newsletter Subscriptions</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>{subs.length} total subscribers</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handleExport} style={{ display:'flex', alignItems:'center', gap:6 }}>
          <IconDownload /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:24 }}>
        {[
          { label:'Total Subscribers', value:subs.length, color:'#6C63FF', Icon:IconMail },
          { label:'Active', value:subs.filter(s=>s.status!=='unsubscribed').length, color:'#10B981', Icon:IconCheck },
          { label:'This Month', value:thisMonthCount, color:'#F59E0B', Icon:IconCalendar },
        ].map((stat,i) => (
          <div key={i} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:44, height:44, borderRadius:12, background:`${stat.color}15`, display:'flex', alignItems:'center', justifyContent:'center', color:stat.color }}>
                <stat.Icon />
              </div>
              <div>
                <div style={{ fontSize:28, fontWeight:800, color:'var(--text-dark)' }}>{stat.value}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{stat.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding:'14px 20px', marginBottom:16 }}>
        <input className="form-control" placeholder="Search by email or name..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ maxWidth:320 }} />
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div style={{ textAlign:'center', padding:60 }}><div className="spinner spinner-lg" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px 20px' }}>
            <div style={{ width:56, height:56, borderRadius:'50%', background:'#F3F4F6', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', color:'#9CA3AF' }}>
              <IconMail />
            </div>
            <h3 style={{ fontWeight:600, marginBottom:8 }}>No subscribers yet</h3>
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>Subscribers will appear here when customers sign up from the website newsletter.</p>
          </div>
        ) : (
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border)', background:'var(--content-bg)' }}>
                {['#','Email','Name','Subscribed On','Status','Action'].map(h => (
                  <th key={h} style={{ padding:'12px 16px', textAlign:'left', fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.7 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((sub, i) => (
                <tr key={sub._id || i} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--content-bg)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'14px 16px', fontSize:13, color:'var(--text-muted)', fontWeight:500 }}>{i+1}</td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'#EEF2FF', color:'#6C63FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
                        {sub.email?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span style={{ fontSize:13, fontWeight:600 }}>{sub.email}</span>
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'var(--text-muted)' }}>
                      {sub.name ? <><IconUser />{sub.name}</> : '—'}
                    </div>
                  </td>
                  <td style={{ padding:'14px 16px', fontSize:13, color:'var(--text-muted)' }}>
                    {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-IN', {day:'2-digit',month:'short',year:'numeric'}) : sub.date || '—'}
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <span style={{ background: sub.status==='unsubscribed' ? '#FEE2E2':'#D1FAE5', color: sub.status==='unsubscribed'?'#EF4444':'#10B981', padding:'3px 10px', borderRadius:99, fontSize:12, fontWeight:600 }}>
                      {sub.status==='unsubscribed' ? 'Unsubscribed' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding:'14px 16px' }}>
                    <button onClick={() => handleUnsubscribe(sub._id)}
                      style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'1px solid #FCA5A5', color:'#EF4444', cursor:'pointer', fontSize:12, fontWeight:600, padding:'5px 12px', borderRadius:6, transition:'all 0.2s' }}
                      onMouseEnter={e=>{e.currentTarget.style.background='#FEE2E2';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='none';}}>
                      <IconTrash /> Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}