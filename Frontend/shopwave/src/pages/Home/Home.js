import React, { useState, useEffect, useRef } from 'react';
import Banner from '../../components/Banner/Banner';
import CategorySection from '../../components/CategorySection/CategorySection';
import FeaturedProducts from '../../components/FeaturedProducts/FeaturedProducts';
import HomeFAQs from '../../components/HomeFAQs/HomeFAQs';
import Footer from '../../components/Footer/Footer';

const API_BASE = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

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

      {/* Brand Promise Section */}
      <div style={{background:'var(--maroon-dark)',overflow:'hidden'}}>
        {/* Marquee Strip */}
        <div style={{background:'var(--gold)',padding:'10px 0',overflow:'hidden'}}>
          <div style={{display:'inline-flex',gap:0,animation:'ticker 25s linear infinite',whiteSpace:'nowrap'}}>
            {['✦ SINCE 2010','HANDCRAFTED IN INDIA','BIS HALLMARKED','10,000+ HAPPY CUSTOMERS','FREE SHIPPING ₹5,000+','22K & 18K GOLD CERTIFIED','30-DAY RETURNS','COD AVAILABLE',
              '✦ SINCE 2010','HANDCRAFTED IN INDIA','BIS HALLMARKED','10,000+ HAPPY CUSTOMERS','FREE SHIPPING ₹5,000+','22K & 18K GOLD CERTIFIED','30-DAY RETURNS','COD AVAILABLE'].map((t,i)=>(
              <span key={i} style={{fontSize:'10px',letterSpacing:'3px',fontWeight:'700',color:'var(--maroon-dark)',padding:'0 28px',fontFamily:"'Jost',sans-serif",textTransform:'uppercase'}}>{t}</span>
            ))}
          </div>
        </div>

        {/* Stats + Promise */}
        <div style={{padding:'clamp(40px,6vw,72px) clamp(20px,5vw,64px)',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'0',alignItems:'center'}}>
          {[
            {num:'10K+', label:'Happy Customers', sub:'Across India'},
            {num:'500+', label:'Unique Designs', sub:'New arrivals every season'},
            {num:'15+', label:'Years of Craft', sub:'Legacy since 2010'},
            {num:'100%', label:'Certified Gold', sub:'BIS Hallmarked'},
          ].map((item,i)=>(
            <div key={i} style={{textAlign:'center',padding:'20px 16px',borderLeft: i>0 ? '1px solid rgba(245,230,192,0.1)' : 'none'}}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'clamp(36px,4vw,52px)',fontWeight:'300',color:'var(--gold-bright)',lineHeight:1,marginBottom:'10px',letterSpacing:'-1px'}}>{item.num}</div>
              <div style={{fontSize:'clamp(9px,1.5vw,12px)',letterSpacing:'2px',textTransform:'uppercase',color:'var(--gold-pale)',fontWeight:'600',marginBottom:'6px'}}>{item.label}</div>
              <div style={{fontSize:'11px',color:'rgba(245,230,192,0.4)'}}>{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{height:'1px',background:'rgba(245,230,192,0.08)',margin:'0 clamp(20px,5vw,64px)'}}/>

        {/* 3 Promise Cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:0,padding:'0 clamp(20px,5vw,64px) clamp(40px,6vw,72px)'}}>
          {[
            {
              icon:'◈',
              title:'Pure by Promise',
              desc:'Every piece we craft carries a BIS hallmark — your guarantee of 22K or 18K gold purity. We believe luxury begins with honesty.',
            },
            {
              icon:'◇',
              title:'Artisan Craftsmanship',
              desc:'Shaped by the hands of master artisans with decades of experience. Each jewel is a story of patience, precision, and passion.',
            },
            {
              icon:'◉',
              title:'Timeless Heritage',
              desc:'Rooted in India\'s rich jewellery tradition, our designs celebrate the beauty of our culture — from bridal classics to everyday elegance.',
            },
          ].map((card,i)=>(
            <div key={i} style={{padding:'clamp(28px,4vw,48px) clamp(20px,3vw,40px)',borderLeft: i>0 ? '1px solid rgba(245,230,192,0.08)' : 'none',transition:'background .3s'}}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(245,230,192,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'32px',color:'var(--gold)',marginBottom:'20px',lineHeight:1}}>{card.icon}</div>
              <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:'24px',fontWeight:'400',color:'var(--gold-pale)',marginBottom:'14px',letterSpacing:'0.5px'}}>{card.title}</div>
              <div style={{width:'32px',height:'1px',background:'var(--gold)',marginBottom:'16px',opacity:0.6}}/>
              <div style={{fontSize:'13px',color:'rgba(245,230,192,0.5)',lineHeight:'1.9',fontWeight:'300'}}>{card.desc}</div>
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