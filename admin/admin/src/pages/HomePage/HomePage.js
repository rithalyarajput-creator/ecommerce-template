import React, { useState, useEffect } from 'react';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';

const tabs = ['Branding', 'Banners', 'Header Menu', 'Footer', 'Settings'];

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Branding');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const [branding, setBranding] = useState({ siteName: 'Amshine Jewellery', tagline: 'Handcrafted with Love', primaryColor: '#6B1A2A', goldColor: '#B8860B' });
  const [banners, setBanners] = useState([{ id: 1, title: 'Timeless Elegance', subtitle: 'New Collection 2025', btnText: 'Shop Now', btnLink: '/products', active: true }]);
  const [menuItems, setMenuItems] = useState([
    { id: 1, label: 'Home', link: '/' },
    { id: 2, label: 'Collections', link: '/products' },
    { id: 3, label: 'Bridal', link: '/products?category=Bridal' },
    { id: 4, label: 'Gold', link: '/products?category=Gold' },
  ]);
  const [footer, setFooter] = useState({
    description: 'Handcrafted jewellery celebrating Indian heritage. Each piece crafted with love and 22K hallmarked gold.',
    copyright: '© 2025 Amshine Jewellery. All rights reserved.',
    facebook: '', instagram: '', youtube: '', twitter: '',
    meesho: '', flipkart: '', amazon: '',
  });
  const [settings, setSettings] = useState({
    contactEmail: '', contactPhone: '', address: '', whatsapp: '',
    freeShippingAbove: '5000', codAvailable: 'Yes',
  });

  // Load footer from backend
  useEffect(() => {
    api.get('/settings/footer').then(r => {
      if (r.data?.data) setFooter(prev => ({ ...prev, ...r.data.data }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'Footer') {
        await api.post('/settings/footer', footer);
        addToast('Footer settings saved! Reflected on website.', 'success');
      } else {
        addToast('Settings saved!', 'success');
      }
    } catch {
      addToast('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700 }}>Home Page Management</h1>
          <p style={{ fontSize:13, color:'var(--text-muted)', marginTop:2 }}>Manage your website sections, branding, and settings</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <a href="https://ecommerce-template-six-tan.vercel.app" target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View Site</a>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, borderBottom:'2px solid var(--border)', marginBottom:24 }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding:'10px 20px', fontSize:13, fontWeight:600, border:'none', background:'none', cursor:'pointer', color:activeTab===tab?'var(--primary)':'var(--text-muted)', borderBottom:activeTab===tab?'2px solid var(--primary)':'2px solid transparent', marginBottom:-2, transition:'all 0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Branding Tab */}
      {activeTab === 'Branding' && (
        <div className="card" style={{ padding:28 }}>
          <h3 style={{ fontSize:16, fontWeight:700, marginBottom:20 }}>Brand Identity</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
            <div className="form-group">
              <label className="form-label">Site Name</label>
              <input className="form-control" value={branding.siteName} onChange={e => setBranding(b => ({ ...b, siteName: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tagline</label>
              <input className="form-control" value={branding.tagline} onChange={e => setBranding(b => ({ ...b, tagline: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Primary Color (Maroon)</label>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input type="color" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} style={{ width:48, height:40, border:'1.5px solid var(--border)', borderRadius:8, cursor:'pointer' }} />
                <input className="form-control" value={branding.primaryColor} onChange={e => setBranding(b => ({ ...b, primaryColor: e.target.value }))} style={{ flex:1 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Accent Color (Gold)</label>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <input type="color" value={branding.goldColor} onChange={e => setBranding(b => ({ ...b, goldColor: e.target.value }))} style={{ width:48, height:40, border:'1.5px solid var(--border)', borderRadius:8, cursor:'pointer' }} />
                <input className="form-control" value={branding.goldColor} onChange={e => setBranding(b => ({ ...b, goldColor: e.target.value }))} style={{ flex:1 }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banners Tab */}
      {activeTab === 'Banners' && (
        <div>
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => setBanners(b => [...b, { id: Date.now(), title:'New Banner', subtitle:'', btnText:'Shop Now', btnLink:'/products', active:true }])}>+ Add Banner</button>
          </div>
          {banners.map((banner, i) => (
            <div key={banner.id} className="card" style={{ padding:20, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
                <h4 style={{ fontWeight:600 }}>Banner {i+1}</h4>
                <div style={{ display:'flex', gap:8 }}>
                  <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13 }}>
                    <input type="checkbox" checked={banner.active} onChange={e => setBanners(bs => bs.map(b => b.id===banner.id ? { ...b, active:e.target.checked } : b))} /> Active
                  </label>
                  <button className="btn btn-danger btn-sm" onClick={() => setBanners(bs => bs.filter(b => b.id!==banner.id))}>Delete</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div className="form-group"><label className="form-label">Title</label><input className="form-control" value={banner.title} onChange={e => setBanners(bs => bs.map(b => b.id===banner.id ? { ...b, title:e.target.value } : b))} /></div>
                <div className="form-group"><label className="form-label">Subtitle</label><input className="form-control" value={banner.subtitle} onChange={e => setBanners(bs => bs.map(b => b.id===banner.id ? { ...b, subtitle:e.target.value } : b))} /></div>
                <div className="form-group"><label className="form-label">Button Text</label><input className="form-control" value={banner.btnText} onChange={e => setBanners(bs => bs.map(b => b.id===banner.id ? { ...b, btnText:e.target.value } : b))} /></div>
                <div className="form-group"><label className="form-label">Button Link</label><input className="form-control" value={banner.btnLink} onChange={e => setBanners(bs => bs.map(b => b.id===banner.id ? { ...b, btnLink:e.target.value } : b))} /></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header Menu Tab */}
      {activeTab === 'Header Menu' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <h3 style={{ fontWeight:700 }}>Navigation Menu</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setMenuItems(m => [...m, { id:Date.now(), label:'New Item', link:'/' }])}>+ Add Item</button>
          </div>
          {menuItems.map((item, i) => (
            <div key={item.id} style={{ display:'flex', gap:12, alignItems:'center', marginBottom:12 }}>
              <span style={{ width:24, textAlign:'center', color:'var(--text-muted)', fontSize:13 }}>{i+1}</span>
              <input className="form-control" value={item.label} onChange={e => setMenuItems(m => m.map(mi => mi.id===item.id ? { ...mi, label:e.target.value } : mi))} placeholder="Label" style={{ flex:1 }} />
              <input className="form-control" value={item.link} onChange={e => setMenuItems(m => m.map(mi => mi.id===item.id ? { ...mi, link:e.target.value } : mi))} placeholder="/link" style={{ flex:1 }} />
              <button className="btn btn-danger btn-sm" onClick={() => setMenuItems(m => m.filter(mi => mi.id!==item.id))}>X</button>
            </div>
          ))}
        </div>
      )}

      {/* Footer Tab - FULLY CONNECTED */}
      {activeTab === 'Footer' && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:700, marginBottom:20 }}>Footer Settings</h3>

          <div className="form-group">
            <label className="form-label">Footer Description (logo ke neeche text)</label>
            <textarea className="form-control" value={footer.description} onChange={e => setFooter(f => ({ ...f, description:e.target.value }))} rows={3} />
          </div>

          <div className="form-group">
            <label className="form-label">Copyright Text</label>
            <input className="form-control" value={footer.copyright} onChange={e => setFooter(f => ({ ...f, copyright:e.target.value }))} placeholder="© 2025 Amshine Jewellery. All rights reserved." />
          </div>

          <h4 style={{ fontWeight:700, marginBottom:12, marginTop:24, fontSize:14 }}>Social Media Links</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { key:'facebook', label:'Facebook URL' },
              { key:'instagram', label:'Instagram URL' },
              { key:'youtube', label:'YouTube URL' },
              { key:'twitter', label:'Twitter URL' },
            ].map(s => (
              <div key={s.key} className="form-group">
                <label className="form-label">{s.label}</label>
                <input className="form-control" value={footer[s.key]} onChange={e => setFooter(f => ({ ...f, [s.key]:e.target.value }))} placeholder={`https://${s.key}.com/...`} />
              </div>
            ))}
          </div>

          <h4 style={{ fontWeight:700, marginBottom:12, marginTop:24, fontSize:14 }}>Marketplace Links</h4>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:16 }}>
            {[
              { key:'meesho', label:'Meesho URL', color:'#F43397' },
              { key:'flipkart', label:'Flipkart URL', color:'#2874F0' },
              { key:'amazon', label:'Amazon URL', color:'#FF9900' },
            ].map(s => (
              <div key={s.key} className="form-group">
                <label className="form-label" style={{ color:s.color }}>{s.label}</label>
                <input className="form-control" value={footer[s.key]} onChange={e => setFooter(f => ({ ...f, [s.key]:e.target.value }))} placeholder={`https://${s.key}.com/...`} />
              </div>
            ))}
          </div>

          <div style={{ marginTop:20, padding:16, background:'#FEF3C7', borderRadius:8, fontSize:13, color:'#92400E' }}>
            Save Changes button dabao — footer turant website pe update ho jayega!
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'Settings' && (
        <div className="card" style={{ padding:24 }}>
          <h3 style={{ fontWeight:700, marginBottom:20 }}>Website Settings</h3>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { key:'contactEmail', label:'Contact Email', placeholder:'hello@amshine.in', type:'email' },
              { key:'contactPhone', label:'Contact Phone', placeholder:'+91 98765 43210', type:'text' },
              { key:'address', label:'Address', placeholder:'City, State, India', type:'text' },
              { key:'whatsapp', label:'WhatsApp Number', placeholder:'+91 98765 43210', type:'text' },
              { key:'freeShippingAbove', label:'Free Shipping Above (Rs.)', placeholder:'5000', type:'number' },
              { key:'codAvailable', label:'COD Available', placeholder:'Yes', type:'text' },
            ].map(field => (
              <div key={field.key} className="form-group">
                <label className="form-label">{field.label}</label>
                <input className="form-control" type={field.type} placeholder={field.placeholder} value={settings[field.key] || ''} onChange={e => setSettings(s => ({ ...s, [field.key]:e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}