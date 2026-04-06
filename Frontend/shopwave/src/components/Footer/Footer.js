import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LOGO = 'https://i.ibb.co/k6vTPq7F/Untitled-design-2.png';
const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const DEFAULT_FOOTER = {
  description: 'Handcrafted jewellery celebrating Indian heritage. Each piece crafted with love and 22K hallmarked gold.',
  copyright: '© 2025 Amshine Jewellery. All rights reserved.',
  facebook: '', instagram: '', youtube: '', twitter: '',
  meesho: '', flipkart: '', amazon: '',
};

const AccordionCol = ({ title, children }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`foot-acc-col${open ? ' foot-col-open' : ''}`}>
      <h4 className="foot-col-heading foot-col-accordion" onClick={() => setOpen(o => !o)}>{title}</h4>
      <div className="foot-links-wrap">{children}</div>
    </div>
  );
};

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/newsletter/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      setMsg(data.message || 'Subscribed!');
      setEmail('');
    } catch {
      setMsg('Something went wrong. Try again!');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(''), 4000);
    }
  };

  return (
    <div>
      <h4 className="foot-col-heading">Newsletter</h4>
      <p className="foot-nl-desc">Subscribe for exclusive offers and new arrivals.</p>
      <div className="foot-nl-row">
        <input type="email" className="foot-nl-input" placeholder="Your email address"
          value={email} onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubscribe()} />
        <button className="foot-nl-btn" onClick={handleSubscribe} disabled={loading} aria-label="Subscribe">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
      {msg && <p style={{ fontSize:12, marginTop:8, color:msg.includes('wrong')?'#EF4444':'#B8860B' }}>{msg}</p>}
    </div>
  );
};

const Footer = () => {
  const [data, setData] = useState(DEFAULT_FOOTER);

  useEffect(() => {
    fetch(`${API}/settings/footer`)
      .then(r => r.ok ? r.json() : null)
      .then(res => { if (res?.data) setData(prev => ({ ...prev, ...res.data })); })
      .catch(() => {});
  }, []);

  const markets = [
    data.meesho && { name:'Meesho', color:'#F43397', bg:'#F9E4F0', url:data.meesho },
    data.flipkart && { name:'Flipkart', color:'#2874F0', bg:'#F7E0B0', url:data.flipkart },
    data.amazon && { name:'Amazon', color:'#FF9900', bg:'#FFE4B0', url:data.amazon },
  ].filter(Boolean);

  const socials = [
    data.facebook && { icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>, url:data.facebook, label:'Facebook' },
    data.instagram && { icon: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>, url:data.instagram, label:'Instagram' },
    data.youtube && { icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg>, url:data.youtube, label:'YouTube' },
    data.twitter && { icon: <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>, url:data.twitter, label:'Twitter' },
  ].filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="foot-main">
        {/* Brand */}
        <div className="foot-brand">
          <Link to="/">
            <img src={LOGO} alt="Amshine Jewellery" className="foot-logo"
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <span className="foot-logo-text" style={{ display:'none' }}>Am<em>shine</em></span>
          </Link>
          <p className="foot-desc">{data.description}</p>

          {socials.length > 0 ? (
            <div className="foot-socials">
              {socials.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="fsoc" aria-label={s.label}>{s.icon}</a>
              ))}
            </div>
          ) : (
            <div className="foot-socials">
              <a href="#" className="fsoc" aria-label="Facebook"><svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
              <a href="#" className="fsoc" aria-label="Instagram"><svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" className="fsoc" aria-label="YouTube"><svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"/></svg></a>
            </div>
          )}

          {markets.length > 0 ? (
            <div className="foot-markets">
              <span className="foot-market-label">Also available on</span>
              <div className="foot-market-row">
                {markets.map(m => (
                  <a key={m.name} href={m.url} target="_blank" rel="noreferrer" className="foot-market-btn">
                    <span className="fmb-dot" style={{ background:m.bg, color:m.color }}>{m.name[0]}</span>
                    <span>{m.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <div className="foot-markets">
              <span className="foot-market-label">Also available on</span>
              <div className="foot-market-row">
                {[{name:'Flipkart',color:'#2874F0',bg:'#F7E0B0'},{name:'Meesho',color:'#F43397',bg:'#F9E4F0'},{name:'Amazon',color:'#FF9900',bg:'#FFE4B0'}].map(m=>(
                  <a key={m.name} href="#" className="foot-market-btn">
                    <span className="fmb-dot" style={{background:m.bg,color:m.color}}>{m.name[0]}</span>
                    <span>{m.name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Links — Gold Sets replaced with FAQs */}
        <AccordionCol title="Quick Links">
          <ul className="foot-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/products">Collections</Link></li>
            <li><Link to="/products?category=Bridal">Bridal Jewellery</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </AccordionCol>

        <AccordionCol title="Policies">
          <ul className="foot-links">
            <li><Link to="/privacy-policy">Privacy Policy</Link></li>
            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
            <li><Link to="/return-policy">Return & Refund Policy</Link></li>
            <li><Link to="/terms-of-service">Terms of Service</Link></li>
          </ul>
        </AccordionCol>

        <Newsletter />
      </div>

      <div className="foot-bottom">
        <p className="foot-copy">{data.copyright}</p>
        <div className="foot-pay">
          {['Visa', 'MC', 'UPI', 'GPay', 'COD'].map(p => (
            <span key={p} className="pay-badge">{p}</span>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
