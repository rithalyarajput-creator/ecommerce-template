import React, { useState, useEffect, useRef } from 'react';
import Banner from '../../components/Banner/Banner';
import CategorySection from '../../components/CategorySection/CategorySection';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import HomeFAQs from '../../components/HomeFAQs/HomeFAQs';
import Footer from '../../components/Footer/Footer';

const API_BASE = 'https://amshine-backend.onrender.com/api';

const DEFAULT_TESTIMONIALS = [
  {_id:'1', text:'The bridal set was absolutely stunning. Every guest complimented it. The craftsmanship is extraordinary and the gold quality is exceptional.', name:'Priya Sharma', location:'Mumbai', rating:5},
  {_id:'2', text:"Ordered a necklace set for my daughter's wedding. The quality exceeded our expectations. Will definitely order again for all our family occasions.", name:'Meena Patel', location:'Ahmedabad', rating:5},
  {_id:'3', text:'Beautiful earrings, very delicate and elegant. The packaging was also lovely. Fast delivery and excellent customer service throughout.', name:'Kavitha Reddy', location:'Hyderabad', rating:5},
];

// Auto-sliding testimonials carousel
const TestimonialsCarousel = ({ testimonials }) => {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);
  const total = testimonials.length;

  useEffect(() => {
    if (total <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, 4000);
    return () => clearInterval(timerRef.current);
  }, [total]);

  const goTo = (i) => {
    setCurrent(i);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
    }, 4000);
  };

  if (total === 0) return null;

  // Show 3 at a time on desktop, 1 on mobile
  const getVisible = () => {
    if (total <= 3) return testimonials;
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(current + i) % total]);
    }
    return visible;
  };

  return (
    <section className="section testimonials">
      <div className="sec-head" style={{ flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'48px' }}>
        <div className="sec-eyebrow">Happy Customers</div>
        <h2 className="sec-title">What They <em>Say</em></h2>
      </div>

      {/* Cards */}
      <div className="test-grid">
        {getVisible().map((t, i) => (
          <div key={`${t._id}-${i}`} className="tcard" style={{ animation:'fadeIn 0.5s ease' }}>
            <div className="tcard-quote">"</div>
            <div className="tcard-stars">
              {[1,2,3,4,5].map(s => (
                <span key={s} className="star" style={{ color: s<=(t.rating||5)?'var(--gold)':'#ddd' }}>★</span>
              ))}
            </div>
            <p className="tcard-text">{t.text}</p>
            <div className="tcard-author">
              <div className="tcard-avatar">{t.name[0]}</div>
              <div>
                <div className="tcard-name">{t.name}</div>
                <div className="tcard-loc">{t.location || t.loc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots navigation — only if more than 3 */}
      {total > 3 && (
        <div style={{ display:'flex', justifyContent:'center', gap:8, marginTop:32 }}>
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => goTo(i)} style={{
              width: i === current ? 24 : 8, height:8, borderRadius:4,
              background: i === current ? 'var(--maroon,#6B1A2A)' : '#E8D5A3',
              border:'none', cursor:'pointer', transition:'all 0.3s', padding:0,
            }} />
          ))}
        </div>
      )}
    </section>
  );
};

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testimonials, setTestimonials] = useState(DEFAULT_TESTIMONIALS);

  useEffect(() => {
    window.scrollTo(0, 0);
    Promise.all([
      fetch(`${API_BASE}/products?limit=50`).then(r=>r.json()).catch(()=>({})),
      fetch(`${API_BASE}/categories`).then(r=>r.json()).catch(()=>({})),
      fetch(`${API_BASE}/testimonials`).then(r=>r.json()).catch(()=>({})),
    ]).then(([pd, cd, td]) => {
      const prods = pd?.data?.products||pd?.products||pd?.data||[];
      const cats = cd?.categories||cd?.data||[];
      const tests = td?.data || [];
      setProducts(Array.isArray(prods)?prods:[]);
      setCategories(Array.isArray(cats)?cats:[]);
      if (Array.isArray(tests) && tests.length > 0) setTestimonials(tests);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Banner/>
      <CategorySection categories={categories}/>
      <FeaturedProducts products={products} loading={loading}/>

      {/* Trust Bar */}
      <div className="trust">
        <div className="trust-grid">
          {[
            {icon:'🏆', title:'BIS Hallmarked', desc:'All gold pieces certified with BIS hallmark, guaranteeing 22K or 18K purity.'},
            {icon:'🚚', title:'Free Delivery', desc:'Free insured shipping above ₹5,000 across India.'},
            {icon:'✨', title:'Lifetime Polish', desc:'Free cleaning and minor repairs for the lifetime of your jewellery.'},
            {icon:'🔄', title:'30-Day Returns', desc:'Hassle-free returns and exchanges within 30 days.'},
          ].map((item,i)=>(
            <div key={i} className="trust-item">
              <div className="trust-icon">{item.icon}</div>
              <div className="trust-title">{item.title}</div>
              <div className="trust-desc">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials - Auto Sliding */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* FAQs */}
      <HomeFAQs />
      <Footer/>
    </div>
  );
};

export default Home;