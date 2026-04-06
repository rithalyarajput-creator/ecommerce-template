import React, { useState, useEffect, useRef } from 'react';

// =============================================
// BANNER IMAGES
// Desktop size: 1920 x 600px (wide landscape)
// Mobile size:  768 x 500px
// =============================================
const BACKEND = process.env.REACT_APP_API_URL
  ? process.env.REACT_APP_API_URL.replace('/api', '')
  : 'https://amshine-backend.onrender.com';

const SLIDES = [
  {
    desktop: `${BACKEND}/uploads/banner1.png`,
    mobile:  `${BACKEND}/uploads/banner1-mobile.png`,
  },
  {
    desktop: `${BACKEND}/uploads/banner2.png`,
    mobile:  `${BACKEND}/uploads/banner2-mobile.png`,
  },
];

const Banner = () => {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 4000);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <section style={{ position:'relative', width:'100%', overflow:'hidden', lineHeight:0, background:'#f5ede3' }}>

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} style={{
          position: i === 0 ? 'relative' : 'absolute',
          inset: 0,
          opacity: i === active ? 1 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: i === active ? 1 : 0,
        }}>
          <picture>
            <source media="(max-width: 768px)" srcSet={slide.mobile} />
            <img
              src={slide.desktop}
              alt={`Banner ${i + 1}`}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </picture>
        </div>
      ))}


      {/* Dark overlay */}
      <div style={{
        position:'absolute', inset:0, background:'rgba(0,0,0,0.15)', zIndex:2, pointerEvents:'none'
      }}/>

      {/* Dots */}
      <div style={{
        position:'absolute', bottom:20, right:28,
        display:'flex', gap:8, zIndex:3,
      }}>
        {SLIDES.map((_, i) => (
          <button key={i} onClick={() => setActive(i)} aria-label={`Slide ${i+1}`}
            style={{
              width:  i === active ? 24 : 8,
              height: 8,
              borderRadius: 99,
              border: 'none',
              background: i === active ? '#fff' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              padding: 0,
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Banner;
