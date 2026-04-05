import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Products from './pages/Products/Products';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import Footer from './components/Footer/Footer';

const API = 'https://amshine-backend.onrender.com/api';

// ── Inline FAQs Page (no separate file needed) ────────────────
const FAQChevron = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.35s ease', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const FAQItem = ({ faq, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #EDE4D4' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:'100%', display:'flex', alignItems:'center', gap:16, padding:'20px 24px', background:'none', border:'none', cursor:'pointer', textAlign:'left' }}>
        <span style={{ fontFamily:'Georgia,serif', fontSize:12, color:'#B8860B', fontWeight:600, minWidth:32, textAlign:'center' }}>{String(index+1).padStart(2,'0')}</span>
        <span style={{ flex:1, fontSize:15, fontWeight:600, color: open ? '#B8860B' : '#1C0A00', transition:'color .2s' }}>{faq.question}</span>
        <span style={{ color:'#B8860B', marginLeft:8 }}><FAQChevron open={open} /></span>
      </button>
      <div style={{ maxHeight: open ? '300px' : '0', overflow:'hidden', transition:'max-height 0.4s cubic-bezier(.4,0,.2,1)' }}>
        <div style={{ padding:'0 24px 20px 72px', fontSize:14, color:'#5C4A35', lineHeight:1.85 }}>{faq.answer}</div>
      </div>
    </div>
  );
};
const FAQs = () => {
  const [faqs, setFaqs] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  useEffect(() => {
    window.scrollTo(0,0);
    fetch('https://amshine-backend.onrender.com/api/faqs/active').then(r=>r.json()).then(d=>{ if(d.success){setFaqs(d.faqs);setFiltered(d.faqs);} }).catch(()=>{}).finally(()=>setLoading(false));
  }, []);
  const cats = ['All', ...Array.from(new Set(faqs.map(f=>f.category)))];
  useEffect(() => {
    let list = faqs;
    if(activeTab !== 'All') list = list.filter(f=>f.category===activeTab);
    if(search.trim()) list = list.filter(f=>f.question.toLowerCase().includes(search.toLowerCase())||f.answer.toLowerCase().includes(search.toLowerCase()));
    setFiltered(list);
  }, [activeTab, search, faqs]);
  return (
    <div style={{ background:'#FDFAF5', minHeight:'100vh' }}>
      <div style={{ background:'linear-gradient(160deg,#1C0A00,#3D1A00)', padding:'80px 24px 60px', textAlign:'center' }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'#B8860B', marginBottom:12 }}>Help Center</div>
        <h1 style={{ fontFamily:'Georgia,serif', fontSize:'clamp(32px,5vw,56px)', fontWeight:600, color:'#FFF8EE', margin:'0 0 14px' }}>Frequently Asked <em style={{ color:'#B8860B' }}>Questions</em></h1>
        <p style={{ fontSize:15, color:'rgba(255,248,238,0.6)', maxWidth:460, margin:'0 auto 32px', lineHeight:1.7 }}>Everything you need to know about our jewellery and services.</p>
        <div style={{ maxWidth:460, margin:'0 auto', position:'relative' }}>
          <svg style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(184,134,11,0.7)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search questions..." style={{ width:'100%', padding:'13px 18px 13px 42px', borderRadius:10, border:'1.5px solid rgba(184,134,11,0.3)', background:'rgba(255,255,255,0.07)', color:'#FFF8EE', fontSize:14, outline:'none', boxSizing:'border-box' }} />
        </div>
      </div>
      <div style={{ maxWidth:800, margin:'0 auto', padding:'48px 24px 80px' }}>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:36, justifyContent:'center' }}>
          {cats.map(c=>(
            <button key={c} onClick={()=>setActiveTab(c)} style={{ padding:'7px 18px', borderRadius:999, border:'1.5px solid', borderColor: activeTab===c ? '#1C0A00' : '#E8DCC8', background: activeTab===c ? '#1C0A00' : '#fff', color: activeTab===c ? '#F5DEB3' : '#7A6650', fontSize:13, fontWeight:500, cursor:'pointer', transition:'all .2s' }}>{c}</button>
          ))}
        </div>
        {loading ? <div style={{ textAlign:'center', padding:60, color:'#B8860B' }}>Loading...</div> :
          filtered.length === 0 ? <div style={{ textAlign:'center', padding:60, color:'#A08060' }}>No questions found.</div> :
          <div style={{ border:'1px solid #EDE4D4', borderRadius:14, overflow:'hidden', background:'#fff' }}>
            {filtered.map((f,i)=><FAQItem key={f._id} faq={f} index={i} />)}
          </div>
        }
        <div style={{ marginTop:60, background:'linear-gradient(135deg,#1C0A00,#3D1A00)', borderRadius:16, padding:'44px 36px', textAlign:'center' }}>
          <div style={{ fontSize:11, fontWeight:600, letterSpacing:'3px', textTransform:'uppercase', color:'#B8860B', marginBottom:10 }}>Still have questions?</div>
          <h2 style={{ fontFamily:'Georgia,serif', fontSize:28, fontWeight:600, color:'#FFF8EE', marginBottom:8 }}>We're here to help</h2>
          <p style={{ fontSize:14, color:'rgba(255,248,238,0.6)', marginBottom:24 }}>Can't find what you're looking for? Our team is happy to assist.</p>
          <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
            <Link to="/contact" style={{ padding:'11px 26px', background:'#B8860B', color:'#fff', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none' }}>Contact Us</Link>
            <a href="https://wa.me/919999999999" target="_blank" rel="noreferrer" style={{ padding:'11px 26px', border:'1.5px solid rgba(184,134,11,0.5)', color:'#F5DEB3', borderRadius:8, fontSize:13, fontWeight:600, textDecoration:'none' }}>WhatsApp Us</a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};
// ─────────────────────────────────────────────────────────────

const POLICY_META = {
  'privacy-policy':  { title: 'Privacy Policy',        bg: '#6B1A2A' },
  'shipping-policy': { title: 'Shipping Policy',        bg: '#1A3A6A' },
  'return-policy':   { title: 'Return & Refund Policy', bg: '#1A4A1A' },
  'terms-of-service':{ title: 'Terms of Service',       bg: '#3A1A6A' },
};
const HARDCODED = {
  'privacy-policy': [
    ['h', 'Privacy Policy - Amshine'],['p', 'At Amshine, we respect your privacy and are committed to protecting your personal information.'],['h', 'Collecting Your Personal Data'],['ul', ['Your name, email address, phone number, and shipping address when you place an order.', 'Billing information and payment details required to process your purchase.', 'Order preferences and browsing behavior to improve our services.']],['h', 'How We Use Your Information'],['ul', ['To process and deliver your jewellery orders.', 'To send order confirmations and shipping updates.', 'To improve our website and customer experience.', 'To send promotional offers (you can opt out anytime).']],['h', 'Data Protection'],['p', 'Amshine uses appropriate security measures to protect your personal information. We do not sell, rent, or trade your personal information with third parties.'],['h', 'Third-Party Links'],['p', 'Our website may contain links to third-party websites. We are not responsible for the privacy practices of external websites.'],
  ],
  'shipping-policy': [
    ['h', 'Shipping Policy - Amshine'],['p', 'At Amshine, we aim to deliver your jewellery orders safely and on time.'],['h', 'Order Processing'],['ul', ['Orders are usually processed within 1-3 business days after payment confirmation.', 'Orders placed on weekends or holidays will be processed on the next working day.', 'Once your order is processed, it will be prepared for shipment.']],['h', 'Delivery Time'],['ul', ['Estimated delivery time is usually 3-7 business days depending on the delivery location.', 'Delivery time may vary due to courier delays, weather conditions, or high demand periods.']],['h', 'Shipping Updates'],['p', 'Once your order is shipped, you may receive a tracking update through email or SMS.'],
  ],
  'return-policy': [
    ['h', 'Return & Refund Policy - Amshine'],['p', 'We want our customers to be satisfied with their purchase.'],['h', 'Return Eligibility'],['ul', ['Return requests must be made within 7 days of delivery.', 'The product must be unused and in its original packaging.', 'Items damaged due to misuse may not be eligible for return.']],['h', 'Refund Process'],['p', 'Once the returned product is received and inspected, the refund will be processed within a few business days.'],
  ],
  'terms-of-service': [
    ['h', 'Terms of Service - Amshine'],['p', 'By accessing or using the Amshine website, you agree to comply with the following terms and conditions.'],['h', 'Use of Website'],['ul', ['You agree to use the website only for lawful purposes.', 'You must provide accurate information while placing an order.', 'Misuse of the website may result in restricted access.']],['h', 'Order Cancellation'],['p', 'Amshine reserves the right to cancel orders due to pricing errors, stock availability, or suspicious activity.'],
  ],
};
function renderBlocks(blocks) {
  return blocks.map(function(b, i) {
    if (b[0] === 'h') return React.createElement('h3', { key: i, style: { color: '#6B1A2A', borderBottom: '1px solid #E8D5A3', paddingBottom: 8, marginTop: 32, fontFamily: 'Cormorant Garamond,serif', fontSize: 22 } }, b[1]);
    if (b[0] === 'p') return React.createElement('p', { key: i, style: { fontSize: 15, lineHeight: 2, color: '#444', marginBottom: 14 } }, b[1]);
    if (b[0] === 'ul') return React.createElement('ul', { key: i, style: { paddingLeft: 24, marginBottom: 16 } }, b[1].map(function(item, j) { return React.createElement('li', { key: j, style: { fontSize: 15, lineHeight: 2, color: '#444', marginBottom: 8 } }, item); }));
    return null;
  });
}
function PolicyPage({ slug }) {
  const meta = POLICY_META[slug];
  const [htmlContent, setHtmlContent] = useState(null);
  useEffect(function() {
    window.scrollTo(0, 0); setHtmlContent(null);
    fetch(API + '/cms/' + slug).then(function(r) { return r.ok ? r.json() : null; }).then(function(data) { var c = data && (data.data ? data.data.content : data.content); if (c && c.length > 20) setHtmlContent(c); }).catch(function() {});
  }, [slug]);
  const otherLinks = Object.entries(POLICY_META).filter(function(e) { return e[0] !== slug; });
  return React.createElement('div', null,
    React.createElement('div', { style: { background: meta.bg, padding: '60px 40px', textAlign: 'center', color: '#fff' } }, React.createElement('h1', { style: { fontFamily: 'Cormorant Garamond,serif', fontSize: 40, fontWeight: 300, margin: 0 } }, meta.title)),
    React.createElement('div', { style: { maxWidth: 800, margin: '0 auto', padding: '60px 24px' } },
      htmlContent ? React.createElement('div', { dangerouslySetInnerHTML: { __html: htmlContent }, style: { fontSize: 15, lineHeight: 2, color: '#444' } }) : React.createElement('div', null, renderBlocks(HARDCODED[slug] || [])),
      React.createElement('div', { style: { marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' } }, otherLinks.map(function(e) { return React.createElement(Link, { key: e[0], to: '/' + e[0], style: { padding: '10px 18px', background: '#FDF6E9', borderRadius: 8, border: '1px solid #E8D5A3', color: '#6B1A2A', textDecoration: 'none', fontWeight: 600, fontSize: 13 } }, e[1].title); }))
    ),
    React.createElement(Footer, null)
  );
}
const ScrollTop = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const h = () => setShow(window.scrollY > 400); window.addEventListener('scroll', h); return () => window.removeEventListener('scroll', h); }, []);
  return (<button className={`scroll-top${show ? ' show' : ''}`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15" /></svg></button>);
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/products/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faqs" element={<FAQs />} />
              <Route path="/privacy-policy" element={<PolicyPage slug="privacy-policy" />} />
              <Route path="/shipping-policy" element={<PolicyPage slug="shipping-policy" />} />
              <Route path="/return-policy" element={<PolicyPage slug="return-policy" />} />
              <Route path="/terms-of-service" element={<PolicyPage slug="terms-of-service" />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </main>
          <ScrollTop />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;