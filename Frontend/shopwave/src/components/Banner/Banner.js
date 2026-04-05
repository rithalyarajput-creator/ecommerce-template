import React, { useState, useEffect, useRef } from 'react';

// =============================================
// BANNER IMAGES — replace with your 1920x700 images
// =============================================
const DESKTOP_IMG_1 = 'https://i.ibb.co/qYkSKP83/image.png'; // ✅ Fixed: direct image link
const DESKTOP_IMG_2 = 'https://i.ibb.co/qY666SXv/image.png';
const MOBILE_IMG_1  = 'https://i.ibb.co/S770zY85/image.png';
const MOBILE_IMG_2  = 'https://i.ibb.co/S770zY85/image.png';

const SLIDES = [
  {
    desktopImg: DESKTOP_IMG_1,
    mobileImg:  MOBILE_IMG_1,
  },
  {
    desktopImg: DESKTOP_IMG_2,
    mobileImg:  MOBILE_IMG_2,
  },
];

const Banner = () => {
  const [active, setActive] = useState(0);
  const timer = useRef(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setActive(a => (a + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer.current);
  }, []);

  return (
    <section className="bn">
      {/* Slide backgrounds */}
      {SLIDES.map((slide, i) => {
        const img = window.innerWidth <= 768 ? slide.mobileImg : slide.desktopImg;
        return (
          <div
            key={i}
            className={`bn-bg${i === active ? ' bn-bg-active' : ''}`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
            }}
          />
        );
      })}

      {/* Overlay */}
      <div className="bn-overlay" />

      {/* Dots only — buttons removed */}
      <div className="bn-content">
        <div className="bn-dots">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              className={`bn-dot${i === active ? ' on' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;