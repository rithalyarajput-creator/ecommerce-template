import React, { useState, useEffect } from 'react';
import Footer from '../../components/Footer/Footer';
import styles from './Contact.module.css';

const API = 'https://amshine-backend.onrender.com/api';

// Professional SVG Icons
const IconPin = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#D4AF37"
    strokeWidth="1.8"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconPhone = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#D4AF37"
    strokeWidth="1.8"
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconMail = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#D4AF37"
    strokeWidth="1.8"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconClock = () => (
  <svg 
    width="18" 
    height="18" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#D4AF37"  // 👈 GOLD COLOR
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ICONS = [IconPin, IconPhone, IconMail, IconClock];

const DEFAULT_INFO = {
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

const Contact = () => {
  const [form, setForm] = useState({ name:'', email:'', phone:'', subject:'', message:'' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState(DEFAULT_INFO);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Load contact info from CMS
    fetch(`${API}/cms/contact`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const c = data?.data;
        if (c?.contactInfo) setInfo(prev => ({ ...prev, ...c.contactInfo }));
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) { setSent(true); }
      else { setError(data.message || 'Something went wrong.'); }
    } catch {
      setError('Could not connect to server. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div>
      <div className={styles.page}>
        <div className={styles.grid}>
          {/* Left info panel */}
          <div className={styles.infoPanel}>
            <div className={styles.eyebrow}>{info.eyebrow}</div>
            <h2 className={styles.infoTitle} dangerouslySetInnerHTML={{ __html: info.title.replace('Hear', '<em>Hear</em>') }} />
            <p className={styles.infoDesc}>{info.description}</p>

            <div className={styles.infoItems}>
              {info.items.map((item, i) => {
                const Icon = ICONS[i] || IconPin;
                return (
                  <div key={i} className={styles.infoItem}>
                    <div className={styles.infoIconWrap}>
                      <Icon />
                    </div>
                    <div>
                      <div className={styles.infoItemLabel}>{item.label}</div>
                      <div className={styles.infoItemValue} style={{ whiteSpace:'pre-line' }}>{item.value}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right form */}
          <div className={styles.formPanel}>
            {sent ? (
              <div className={styles.successBox}>
                <div className={styles.successIcon}>✓</div>
                <h3 className={styles.successTitle}>Message Sent!</h3>
                <p className={styles.successText}>Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button className={styles.resetBtn} onClick={() => { setSent(false); setForm({ name:'', email:'', phone:'', subject:'', message:'' }); }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h3 className={styles.formTitle}>Send Us a Message</h3>
                {error && (
                  <div style={{ background:'#fee2e2', color:'#991b1b', padding:'10px 14px', borderRadius:8, marginBottom:16, fontSize:14 }}>
                    {error}
                  </div>
                )}
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Full Name *</label>
                      <input required className={styles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name:e.target.value }))} placeholder="Your full name" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Email Address *</label>
                      <input required type="email" className={styles.input} value={form.email} onChange={e => setForm(p => ({ ...p, email:e.target.value }))} placeholder="you@example.com" />
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Phone Number</label>
                      <input className={styles.input} value={form.phone} onChange={e => setForm(p => ({ ...p, phone:e.target.value }))} placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Subject *</label>
                      <select required className={styles.input} value={form.subject} onChange={e => setForm(p => ({ ...p, subject:e.target.value }))}>
                        <option value="">Select a topic...</option>
                        <option>Order Enquiry</option>
                        <option>Custom Jewellery</option>
                        <option>Return / Exchange</option>
                        <option>Bulk Order</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Message *</label>
                    <textarea required className={`${styles.input} ${styles.textarea}`} value={form.message}
                      onChange={e => setForm(p => ({ ...p, message:e.target.value }))}
                      placeholder="Tell us about your enquiry..." rows={5} />
                  </div>
                  <button type="submit" className={styles.submitBtn} disabled={loading}>
                    {loading ? 'Sending...' : 'Send Message →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;