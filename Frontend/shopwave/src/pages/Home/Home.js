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
  const [isMob, setIsMob] = useState(window.innerWidth <= 768);
  const [sliding, setSliding] = useState(false);
  const [dir, setDir] = useState(1); // 1=next, -1=prev
  const timerRef = useRef(null);
  const total = testimonials.length;

  useEffect(() => {
    const onResize = () => setIsMob(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => slideTo(1), 4000);
  };

  useEffect(() => {
    if (total <= 1) return;
    startTimer();
    return () => clearInterval(timerRef.current);
  // eslint-disable-next-line
  }, [total]);

  const slideTo = (direction) => {
    if (sliding) return;
    setDir(direction);
    setSliding(true);
    setTimeout(() => {
      setCurrent(c => (c + direction + total) % total);
      setSliding(false);
    }, 350);
  };

  const goTo = (i) => {
    if (i === current || sliding) return;
    setDir(i > current ? 1 : -1);
    setSliding(true);
    setTimeout(() => { setCurrent(i); setSliding(false); }, 350);
    startTimer();
  };

  if (total === 0) return null;

  // Desktop: show 3 at a time
  const getDesktopVisible = () => {
    if (total <= 3) return testimonials;
    return [0,1,2].map(i => testimonials[(current + i) % total]);
  };

  const slideStyle = {
    transform: sliding ? `translateX(${dir > 0 ? '-60px' : '60px'})` : 'translateX(0)',
    opacity: sliding ? 0 : 1,
    transition: 'transform 0.35s ease, opacity 0.35s ease',
  };

  return (
    <section className="section testimonials">
      <div className="sec-head" style={{ flexDirection:'column', alignItems:'center', textAlign:'center', marginBottom:'48px' }}>
        <div className="sec-eyebrow">Happy Customers</div>
        <h2 className="sec-title">What They <em>Say</em></h2>
      </div>

      {isMob ? (
        /* ── MOBILE: single card auto-slider ── */
        <div style={{ padding:'0 20px' }}>
          <div style={{ overflow:'hidden' }}>
            <div style={slideStyle}>
              {(() => { const t = testimonials[current]; return (
                <div className="tcard">
                  <div className="tcard-quote">"</div>
                  <div className="tcard-stars" style={{ marginBottom:'10px' }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s} style={{ color: s<=(t.rating||5)?'var(--gold)':'#ddd', fontSize:'14px' }}>★</span>
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
              );})()}
            </div>
          </div>

          {/* Dots */}
          <div style={{ display:'flex', justifyContent:'center', gap:6, marginTop:20 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: i === current ? 20 : 6, height:6, borderRadius:3,
                background: i === current ? 'var(--maroon,#6B1A2A)' : '#E8D5A3',
                border:'none', cursor:'pointer', transition:'all 0.3s', padding:0,
              }} />
            ))}
          </div>
        </div>
      ) : (
        /* ── DESKTOP: 3-card grid ── */
        <>
          <div className="test-grid" style={slideStyle}>
            {getDesktopVisible().map((t, i) => (
              <div key={`${t._id}-${i}`} className="tcard">
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
        </>
      )}
    </section>
  );
};

const JewelryShowcase = () => (
  <section style={{
    background: 'linear-gradient(135deg, #fdf8f2 0%, #f5ede3 50%, #fdf8f2 100%)',
    overflow: 'hidden',
    padding: 'clamp(48px,8vw,96px) clamp(20px,6vw,80px)',
  }}>
    <style>{`
      @keyframes orbitRing {
        from { transform: rotateX(70deg) rotateZ(0deg); }
        to   { transform: rotateX(70deg) rotateZ(360deg); }
      }
      @keyframes orbitRing2 {
        from { transform: rotateX(55deg) rotateZ(120deg); }
        to   { transform: rotateX(55deg) rotateZ(480deg); }
      }
      @keyframes orbitRing3 {
        from { transform: rotateX(40deg) rotateZ(240deg); }
        to   { transform: rotateX(40deg) rotateZ(-120deg); }
      }
      @keyframes gemPulse {
        0%,100% { transform: scale(1) rotate(45deg); box-shadow: 0 0 12px 4px rgba(212,175,55,0.6); }
        50%      { transform: scale(1.18) rotate(45deg); box-shadow: 0 0 28px 10px rgba(212,175,55,0.9); }
      }
      @keyframes sparkFloat {
        0%   { opacity:0; transform: translate(0,0) scale(0.5); }
        40%  { opacity:1; }
        100% { opacity:0; transform: translate(var(--sx),var(--sy)) scale(1.2); }
      }
      @keyframes glowPulse {
        0%,100% { opacity:0.35; transform: scale(1); }
        50%      { opacity:0.65; transform: scale(1.08); }
      }
      @keyframes textSlideIn {
        from { opacity:0; transform: translateX(40px); }
        to   { opacity:1; transform: translateX(0); }
      }
      @keyframes lineGrow {
        from { width:0; }
        to   { width:64px; }
      }
      @keyframes dotOrbit {
        from { transform: rotate(var(--start)) translateX(var(--r)) rotate(calc(-1 * var(--start))); }
        to   { transform: rotate(calc(var(--start) + 360deg)) translateX(var(--r)) rotate(calc(-1 * (var(--start) + 360deg))); }
      }
    `}</style>

    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 'clamp(32px,5vw,80px)',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
    }}>

      {/* ── LEFT: Animated Jewelry Visual ── */}
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'420px', position:'relative' }}>

        {/* Ambient glow */}
        <div style={{
          position:'absolute', width:'320px', height:'320px', borderRadius:'50%',
          background:'radial-gradient(circle, rgba(212,175,55,0.18) 0%, transparent 70%)',
          animation:'glowPulse 3s ease-in-out infinite',
        }}/>

        {/* Orbit ring 1 */}
        <div style={{
          position:'absolute', width:'260px', height:'260px', borderRadius:'50%',
          border:'1.5px solid rgba(212,175,55,0.35)',
          animation:'orbitRing 8s linear infinite',
          transformStyle:'preserve-3d',
        }}>
          {[0,90,180,270].map((deg,i)=>(
            <div key={i} style={{
              position:'absolute', width:'8px', height:'8px', borderRadius:'50%',
              background:'var(--gold,#d4af37)',
              top:'50%', left:'50%',
              transform:`rotate(${deg}deg) translateX(130px) translateY(-4px)`,
              boxShadow:'0 0 8px 3px rgba(212,175,55,0.8)',
            }}/>
          ))}
        </div>

        {/* Orbit ring 2 */}
        <div style={{
          position:'absolute', width:'190px', height:'190px', borderRadius:'50%',
          border:'1px solid rgba(212,175,55,0.2)',
          animation:'orbitRing2 12s linear infinite',
          transformStyle:'preserve-3d',
        }}>
          {[0,120,240].map((deg,i)=>(
            <div key={i} style={{
              position:'absolute', width:'6px', height:'6px', borderRadius:'50%',
              background:'#fff',
              top:'50%', left:'50%',
              transform:`rotate(${deg}deg) translateX(95px) translateY(-3px)`,
              boxShadow:'0 0 6px 2px rgba(255,255,255,0.9)',
            }}/>
          ))}
        </div>

        {/* Orbit ring 3 */}
        <div style={{
          position:'absolute', width:'330px', height:'330px', borderRadius:'50%',
          border:'1px dashed rgba(212,175,55,0.12)',
          animation:'orbitRing3 18s linear infinite',
          transformStyle:'preserve-3d',
        }}/>

        {/* Center gem */}
        <div style={{
          width:'64px', height:'64px',
          background:'linear-gradient(135deg, #f5e6c0 0%, #d4af37 40%, #8b6914 100%)',
          transform:'rotate(45deg)',
          borderRadius:'8px',
          animation:'gemPulse 2.5s ease-in-out infinite',
          zIndex:2,
          position:'relative',
        }}>
          {/* inner shine */}
          <div style={{
            position:'absolute', top:'12px', left:'12px',
            width:'14px', height:'14px',
            background:'rgba(255,255,255,0.6)',
            borderRadius:'50%',
            filter:'blur(3px)',
          }}/>
        </div>

        {/* Floating sparkles */}
        {[
          {top:'18%',left:'22%', sx:'-12px', sy:'-18px', delay:'0s',   size:'6px'},
          {top:'72%',left:'18%', sx:'10px',  sy:'-14px', delay:'0.7s', size:'5px'},
          {top:'15%',left:'68%', sx:'14px',  sy:'-10px', delay:'1.2s', size:'7px'},
          {top:'78%',left:'70%', sx:'-10px', sy:'-16px', delay:'0.4s', size:'5px'},
          {top:'50%',left:'8%',  sx:'-14px', sy:'-8px',  delay:'1.8s', size:'4px'},
          {top:'30%',left:'82%', sx:'10px',  sy:'-20px', delay:'0.9s', size:'6px'},
          {top:'62%',left:'50%', sx:'16px',  sy:'-12px', delay:'1.5s', size:'4px'},
        ].map((s,i)=>(
          <div key={i} style={{
            position:'absolute', top:s.top, left:s.left,
            width:s.size, height:s.size,
            background:'var(--gold,#d4af37)',
            borderRadius:'50%',
            '--sx':s.sx, '--sy':s.sy,
            animation:`sparkFloat 2.4s ease-out ${s.delay} infinite`,
            boxShadow:'0 0 6px 2px rgba(212,175,55,0.5)',
          }}/>
        ))}
      </div>

      {/* ── RIGHT: Text Content ── */}
      <div style={{ animation:'textSlideIn 0.8s ease both' }}>
        <div style={{
          fontSize:'11px', letterSpacing:'4px', textTransform:'uppercase',
          color:'var(--gold,#d4af37)', fontWeight:'600',
          fontFamily:"'Jost',sans-serif", marginBottom:'16px',
        }}>
          ✦ &nbsp;Our Craftsmanship
        </div>

        <h2 style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontSize:'clamp(32px,4vw,52px)',
          fontWeight:'400',
          color:'var(--maroon,#6B1A2A)',
          lineHeight:'1.15',
          marginBottom:'24px',
        }}>
          Crafted with Pure<br/>
          <em style={{color:'var(--gold,#d4af37)'}}>Elegance &amp; Grace</em>
        </h2>

        {/* Animated underline */}
        <div style={{
          height:'2px',
          background:'linear-gradient(90deg, var(--gold,#d4af37), transparent)',
          marginBottom:'28px',
          animation:'lineGrow 1.2s ease 0.3s both',
          animationFillMode:'forwards',
          width:'0',
        }}/>

        <p style={{
          fontSize:'15px', lineHeight:'1.9',
          color:'rgba(60,20,30,0.65)',
          fontFamily:"'Jost',sans-serif",
          fontWeight:'300',
          marginBottom:'36px',
          maxWidth:'440px',
        }}>
          Each piece in our collection is born from generations of craft — forged with BIS‑hallmarked 22K &amp; 18K gold, shaped by the steady hands of master artisans, and finished to last a lifetime.
        </p>

        {/* Feature pills */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'12px', marginBottom:'40px' }}>
          {['BIS Hallmarked','22K & 18K Gold','Master Artisans','30-Day Returns'].map((tag,i)=>(
            <span key={i} style={{
              padding:'7px 18px',
              border:'1px solid rgba(107,26,42,0.3)',
              borderRadius:'999px',
              fontSize:'11px', letterSpacing:'1.5px',
              color:'var(--maroon,#6B1A2A)',
              fontFamily:"'Jost',sans-serif",
              textTransform:'uppercase',
              background:'rgba(107,26,42,0.05)',
            }}>{tag}</span>
          ))}
        </div>

        <a href="/products" style={{
          display:'inline-flex', alignItems:'center', gap:'10px',
          background:'linear-gradient(135deg, #d4af37, #b8860b)',
          color:'#1a0a0e',
          padding:'14px 36px',
          borderRadius:'4px',
          fontSize:'12px', letterSpacing:'2.5px',
          textTransform:'uppercase',
          fontWeight:'700',
          fontFamily:"'Jost',sans-serif",
          textDecoration:'none',
          boxShadow:'0 8px 32px rgba(212,175,55,0.3)',
          transition:'all 0.3s',
        }}
          onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 14px 40px rgba(212,175,55,0.45)'; }}
          onMouseLeave={e=>{ e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(212,175,55,0.3)'; }}
        >
          Explore Collection &nbsp;→
        </a>
      </div>
    </div>
  </section>
);

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

      {/* Jewelry Animated Showcase Section */}
      <JewelryShowcase />

      {/* Testimonials - Auto Sliding */}
      <TestimonialsCarousel testimonials={testimonials} />

      {/* FAQs */}
      <HomeFAQs />
      <Footer/>
    </div>
  );
};

export default Home;