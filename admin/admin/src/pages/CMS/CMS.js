import React, { useState, useEffect, useRef } from 'react';
import Modal from '../../components/Modal/Modal';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const PAGES = [
  { _id: 'privacy-policy',  title: 'Privacy Policy',        slug: 'privacy-policy',  icon: '🔒', type: 'html' },
  { _id: 'shipping-policy', title: 'Shipping Policy',        slug: 'shipping-policy', icon: '🚚', type: 'html' },
  { _id: 'return-policy',   title: 'Return & Refund Policy', slug: 'return-policy',   icon: '🔄', type: 'html' },
  { _id: 'terms-of-service',title: 'Terms of Service',       slug: 'terms-of-service',icon: '📋', type: 'html' },
  { _id: 'about',           title: 'About Us',               slug: 'about',           icon: '🏪', type: 'html' },
  { _id: 'contact',         title: 'Contact Page Info',      slug: 'contact',         icon: '📞', type: 'contact' },
];

const RichEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const exec = (cmd, val = null) => {
    editorRef.current.focus();
    document.execCommand(cmd, false, val);
    onChange(editorRef.current.innerHTML);
  };
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);
  const btn = (label, cmd, val) => (
    <button type="button" onClick={() => exec(cmd, val)}
      style={{ padding:'4px 10px', fontSize:12, borderRadius:6, border:'1px solid var(--border)', background:'#fff', cursor:'pointer', fontWeight:600 }}>
      {label}
    </button>
  );
  return (
    <div style={{ border:'1.5px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
      <div style={{ display:'flex', gap:4, padding:'8px 10px', background:'#F9FAFB', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
        {btn('B', 'bold')}{btn('I', 'italic')}{btn('U', 'underline')}
        <div style={{ width:1, background:'var(--border)', margin:'0 4px' }}/>
        {btn('H3', 'formatBlock', 'h3')}{btn('P', 'formatBlock', 'p')}
        <div style={{ width:1, background:'var(--border)', margin:'0 4px' }}/>
        {btn('• List', 'insertUnorderedList')}{btn('1. List', 'insertOrderedList')}
        <div style={{ width:1, background:'var(--border)', margin:'0 4px' }}/>
        {btn('Clear', 'removeFormat')}
      </div>
      <div ref={editorRef} contentEditable onInput={() => onChange(editorRef.current.innerHTML)}
        suppressContentEditableWarning
        style={{ minHeight:280, padding:'16px', fontSize:14, lineHeight:1.9, outline:'none', background:'#fff' }}
      />
    </div>
  );
};

// Contact info editor
const ContactEditor = ({ value, onChange }) => {
  const data = value || {
    eyebrow: 'Get in Touch',
    title: "We'd Love to Hear From You",
    description: "Have a question about an order, custom jewellery, or just want to say hello? Reach out — we're here to help.",
    items: [
      { label: 'Visit Us', value: 'Amshine Jewels, New Delhi, India' },
      { label: 'Call / WhatsApp', value: '+91 99999 99999' },
      { label: 'Email Us', value: 'info@amshinejewels.com' },
      { label: 'Business Hours', value: 'Mon – Sat: 10:00 AM – 7:00 PM\nSunday: Closed' },
    ]
  };

  const update = (key, val) => onChange({ ...data, [key]: val });
  const updateItem = (i, key, val) => {
    const items = [...data.items];
    items[i] = { ...items[i], [key]: val };
    onChange({ ...data, items });
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <div className="form-group">
        <label className="form-label">Eyebrow Text (small top text)</label>
        <input className="form-control" value={data.eyebrow} onChange={e => update('eyebrow', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Main Title</label>
        <input className="form-control" value={data.title} onChange={e => update('title', e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Description</label>
        <textarea className="form-control" value={data.description} onChange={e => update('description', e.target.value)} rows={3} />
      </div>
      <div>
        <label className="form-label">Contact Info Items</label>
        {data.items.map((item, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12, marginBottom:12, padding:14, background:'#F9FAFB', borderRadius:8, border:'1px solid var(--border)' }}>
            <div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Label</div>
              <input className="form-control" value={item.label} onChange={e => updateItem(i, 'label', e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:4, textTransform:'uppercase', letterSpacing:0.5 }}>Value</div>
              <textarea className="form-control" value={item.value} onChange={e => updateItem(i, 'value', e.target.value)} rows={2} style={{ resize:'none' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function CMS() {
  const [pageContents, setPageContents] = useState({});
  const [contactInfo, setContactInfo] = useState(null);
  const [editPage, setEditPage] = useState(null);
  const [content, setContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState({});
  const { addToast } = useToast();

  useEffect(() => {
    PAGES.forEach(async (page) => {
      try {
        const res = await api.get(`/cms/${page.slug}`);
        const data = res.data?.data || res.data;
        if (data?.content) {
          setPageContents(prev => ({ ...prev, [page.slug]: data.content }));
          setLastUpdated(prev => ({ ...prev, [page.slug]: data.updatedAt || '' }));
        }
        if (page.type === 'contact' && data?.contactInfo) {
          setContactInfo(data.contactInfo);
        }
      } catch {}
    });
  }, []);

  const openEdit = (page) => {
    setEditPage(page);
    if (page.type === 'contact') {
      // Contact info load
    } else {
      setContent(pageContents[page.slug] || '');
    }
    setPreviewMode(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editPage.type === 'contact') {
        await api.post(`/cms/contact`, { contactInfo, title: 'Contact Page' });
      } else {
        await api.post(`/cms/${editPage.slug}`, { content, title: editPage.title });
        setPageContents(prev => ({ ...prev, [editPage.slug]: content }));
      }
      setLastUpdated(prev => ({ ...prev, [editPage.slug]: new Date().toLocaleDateString('en-IN') }));
      addToast('Page saved! Live on website now', 'success');
      setEditPage(null);
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:700 }}>CMS Pages</h1>
        <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Edit website pages — changes reflect live on frontend</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {PAGES.map(page => (
          <div key={page._id} className="card" style={{ padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:12 }}>
              <div style={{ width:44, height:44, borderRadius:10, background:'var(--maroon,#6B1A2A)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {page.icon}
              </div>
              <div>
                <div style={{ fontWeight:700, fontSize:14 }}>{page.title}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>/{page.slug}</div>
              </div>
              <span style={{ marginLeft:'auto', background:'#D1FAE5', color:'#10B981', padding:'3px 10px', borderRadius:99, fontSize:11, fontWeight:600 }}>Live</span>
            </div>
            {lastUpdated[page.slug] && (
              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:12 }}>Last updated: {lastUpdated[page.slug]}</div>
            )}
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => openEdit(page)}>✏️ Edit Page</button>
              <a href={`https://ecommerce-template-six-tan.vercel.app/${page.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">👁️</a>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={!!editPage} onClose={() => setEditPage(null)}
        title={`Edit: ${editPage?.title}`} size="xl"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setEditPage(null)}>Cancel</button>
            {editPage?.type !== 'contact' && (
              <button className="btn btn-ghost" onClick={() => setPreviewMode(!previewMode)}>
                {previewMode ? '✏️ Edit' : '👁️ Preview'}
              </button>
            )}
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : '💾 Save Page'}
            </button>
          </>
        }
      >
        {editPage?.type === 'contact' ? (
          <ContactEditor value={contactInfo} onChange={setContactInfo} />
        ) : previewMode ? (
          <div style={{ minHeight:280, padding:'24px', background:'#FAFAFA', borderRadius:8, fontSize:14, lineHeight:1.9 }}
            dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <RichEditor value={content} onChange={setContent} />
        )}
      </Modal>
    </div>
  );
}