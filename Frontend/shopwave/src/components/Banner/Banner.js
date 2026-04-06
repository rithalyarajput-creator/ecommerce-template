import React, { useState, useEffect, useRef } from 'react';

// =============================================
// BANNER IMAGES
// Desktop size: 1920 x 600px (wide landscape)
// Mobile size:  768 x 500px
// =============================================
const SLIDES = [
  {
    desktop: 'https://i.ibb.co/qYkSKP83/image.png',
    mobile:  'https://i.ibb.co/S770zY85/image.png',
  },
  {
    desktop: 'https://i.ibb.co/qY666SXv/image.png',
    mobile:  'https://i.ibb.co/S770zY85/image.png',
  },
];

const Banner = () => {
  const [active, setActive]   = useState(0);
  const [isMob, setIsMob]     = useState(window.innerWidth <= 768);
  const timer = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMob(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    timer.current = setInterval(() => setActive(a => (a + 1) % SLIDES.length), 4500);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <section style={{ position:'relative', width:'100%', overflow:'hidden', lineHeight:0 }}>

      {/* Slides */}
      {SLIDES.map((slide, i) => (
        <div key={i} style={{
          position: i === 0 ? 'relative' : 'absolute',
          inset: 0,
          opacity: i === active ? 1 : 0,
          transition: 'opacity 0.8s ease',
          zIndex: i === active ? 1 : 0,
        }}>
          <img
            src={isMob ? slide.mobile : slide.desktop}
            alt={`Banner ${i + 1}`}
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
            }}
            onError={e => { e.target.src = slide.desktop; }}
          />
        </div>
      ))}

      {/* Invisible spacer — keeps height from first slide */}
      {SLIDES.length > 1 && (
        <div style={{ visibility:'hidden', pointerEvents:'none', zIndex:0 }}>
          <img
            src={isMob ? SLIDES[0].mobile : SLIDES[0].desktop}
            alt=""
            style={{ width:'100%', height:'auto', display:'block' }}
          />
        </div>
      )}

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
