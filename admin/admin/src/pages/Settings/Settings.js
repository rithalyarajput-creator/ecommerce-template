import React, { useState, useEffect } from 'react';
import ImageUpload from '../../components/ImageUpload/ImageUpload';
import { useToast } from '../../components/Toast/Toast';
import api from '../../api/axios';
import styles from './Settings.module.css';

const FONTS = ['Plus Jakarta Sans', 'Inter', 'Poppins', 'Roboto'];
const CURRENCIES = ['₹ INR', '$ USD', '€ EUR', '£ GBP'];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('store');
  const [storeName, setStoreName] = useState('My eCommerce Store');
  const [currency, setCurrency] = useState('₹ INR');
  const [contactEmail, setContactEmail] = useState('');
  const [logo, setLogo] = useState([]);
  const [primaryColor, setPrimaryColor] = useState('#6C63FF');
  const [font, setFont] = useState('Plus Jakarta Sans');
  const [cardStyle, setCardStyle] = useState('rounded');
  const [bannerText, setBannerText] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    // Load from localStorage
    const saved = JSON.parse(localStorage.getItem('storeSettings') || '{}');
    if (saved.storeName) setStoreName(saved.storeName);
    if (saved.currency) setCurrency(saved.currency);
    if (saved.contactEmail) setContactEmail(saved.contactEmail);
    if (saved.primaryColor) setPrimaryColor(saved.primaryColor);
    if (saved.font) setFont(saved.font);
    if (saved.cardStyle) setCardStyle(saved.cardStyle);
    if (saved.bannerText) setBannerText(saved.bannerText);
    // Also try API
    api.get('/settings').then(r => {
      const d = r.data;
      if (d.storeName) setStoreName(d.storeName);
      if (d.currency) setCurrency(d.currency);
      if (d.contactEmail) setContactEmail(d.contactEmail);
      if (d.primaryColor) setPrimaryColor(d.primaryColor);
      if (d.font) setFont(d.font);
      if (d.cardStyle) setCardStyle(d.cardStyle);
      if (d.bannerText) setBannerText(d.bannerText);
    }).catch(() => {});
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const settings = { storeName, currency, contactEmail, primaryColor, font, cardStyle, bannerText };
    try {
      localStorage.setItem('storeSettings', JSON.stringify(settings));

      const fd = new FormData();
      Object.entries(settings).forEach(([k, v]) => fd.append(k, v));
      if (logo[0]?.file) fd.append('logo', logo[0].file);

      await api.put('/settings', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        .catch(() => {}); // API optional

      // Apply theme live
      document.documentElement.style.setProperty('--primary', primaryColor);
      addToast('Settings saved successfully!', 'success');
    } catch {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className={styles.tabs}>
        {['store', 'theme'].map(tab => (
          <button
            key={tab}
            className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'store' ? '🏪 Store Settings' : '🎨 Theme Settings'}
          </button>
        ))}
      </div>

      <div className={`card ${styles.settingsCard}`}>
        {activeTab === 'store' ? (
          <>
            <h3 className={styles.sectionTitle}>Store Information</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input className="form-control" value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="My Store" />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-control" type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="admin@store.com" />
              </div>
              <div className="form-group">
                <label className="form-label">Currency</label>
                <select className="form-control" value={currency} onChange={e => setCurrency(e.target.value)}>
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="divider" />
            <h3 className={styles.sectionTitle}>Store Logo</h3>
            <ImageUpload images={logo} onChange={setLogo} multiple={false} />
          </>
        ) : (
          <>
            <h3 className={styles.sectionTitle}>Theme Configuration</h3>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Primary Color</label>
                <div className={styles.colorRow}>
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className={styles.colorPicker} />
                  <input className="form-control" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} placeholder="#6C63FF" style={{ flex: 1 }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Font Family</label>
                <select className="form-control" value={font} onChange={e => setFont(e.target.value)}>
                  {FONTS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Product Card Style</label>
              <div className={styles.toggleRow}>
                {['rounded', 'square'].map(s => (
                  <button
                    key={s}
                    className={`${styles.styleBtn} ${cardStyle === s ? styles.styleBtnActive : ''}`}
                    onClick={() => setCardStyle(s)}
                  >
                    <span className={styles.styleIcon}>{s === 'rounded' ? '◉' : '⬛'}</span>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
              <p className={styles.hint}>This setting affects product card corners on the main frontend website</p>
            </div>

            <div className="form-group">
              <label className="form-label">Homepage Banner Text</label>
              <textarea
                className="form-control"
                value={bannerText}
                onChange={e => setBannerText(e.target.value)}
                placeholder="Enter your homepage banner headline..."
                rows={3}
              />
            </div>

            <div className={styles.previewBox}>
              <div
                className={styles.previewCard}
                style={{
                  borderRadius: cardStyle === 'rounded' ? 16 : 0,
                  fontFamily: font,
                  borderTop: `4px solid ${primaryColor}`,
                }}
              >
                <div className={styles.previewImg} style={{ background: primaryColor + '22' }}>🛍️</div>
                <div className={styles.previewBody}>
                  <div className={styles.previewTitle} style={{ fontFamily: font }}>Sample Product</div>
                  <div className={styles.previewPrice} style={{ color: primaryColor }}>₹1,299</div>
                  <div className={styles.previewBtn} style={{ background: primaryColor }}>Add to Cart</div>
                </div>
              </div>
              <p className={styles.previewLabel}>Live Card Preview</p>
            </div>
          </>
        )}

        <div className={styles.saveRow}>
          <button className="btn btn-primary" onClick={saveSettings} disabled={saving}>
            {saving ? <><span className="spinner" /> Saving...</> : '💾 Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}
