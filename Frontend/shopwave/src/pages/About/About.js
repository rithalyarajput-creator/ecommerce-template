import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';
import styles from './About.module.css';

const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const About = () => {
  const [cmsData, setCmsData] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetch(API + '/cms/about')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        const c = data?.data?.content || data?.content;
        if (c && c.length > 20) setCmsData(c);
      })
      .catch(() => {});
  }, []);

  // CMS se sirf description paragraphs aate hain — design same rehta hai
  const heroDesc = cmsData
    ? null
    : 'At Amshine, we believe every piece of jewellery tells a story of love, celebration, heritage, and craftsmanship passed down through generations.';

  const missionText1 = cmsData
    ? null
    : 'Amshine Jewellery was born from a passion for preserving the rich tradition of Indian jewellery-making. Every piece in our collection is handcrafted by skilled artisans who have dedicated their lives to this beautiful craft.';

  const missionText2 = cmsData
    ? null
    : 'We use only BIS hallmarked 22K gold and certified gemstones, ensuring that every piece you receive meets the highest standards of quality and purity.';

  return (
    <div>
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.eyebrow}>Our Story</div>
            <h1 className={styles.heroTitle}>Crafting <em>Timeless</em><br />Jewellery Since 2000</h1>
            {heroDesc && <p className={styles.heroDesc}>{heroDesc}</p>}
          </div>
        </div>

        {/* Mission */}
        <section className={styles.section}>
          <div className={styles.missionGrid}>
            <div className={styles.missionLeft}>
              <div className={styles.eyebrow}>Who We Are</div>
              <h2 className={styles.sectionTitle}>Handcrafted with <em>Love</em></h2>

              {/* CMS content ya default text */}
              {cmsData ? (
                <div
                  className={styles.para}
                  dangerouslySetInnerHTML={{ __html: cmsData }}
                  style={{ fontSize: 15, lineHeight: 2, color: '#555' }}
                />
              ) : (
                <>
                  <p className={styles.para}>{missionText1}</p>
                  <p className={styles.para}>{missionText2}</p>
                </>
              )}

              <Link to="/products" className="btn-fill"><span>Explore Collection</span></Link>
            </div>
            <div className={styles.missionRight}>
              <div className={styles.statsGrid}>
                {[
                  { num: '25+', label: 'Years of Craftsmanship' },
                  { num: '12K+', label: 'Happy Brides' },
                  { num: '600+', label: 'Unique Designs' },
                  { num: '22K', label: 'Pure Gold Standard' },
                ].map((s, i) => (
                  <div key={i} className={styles.statCard}>
                    <div className={styles.statNum}>{s.num}</div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className={styles.valuesSection}>
          <div className={styles.valuesInner}>
            <div className={styles.eyebrow} style={{ textAlign: 'center' }}>Our Promise</div>
            <h2 className={styles.sectionTitle} style={{ textAlign: 'center', marginBottom: '48px' }}>Why Choose <em>Amshine</em></h2>
            <div className={styles.valuesGrid}>
              {[
                { icon: '🏆', title: 'BIS Hallmarked', desc: 'All gold pieces carry the BIS hallmark, guaranteeing 22K purity certified by the Bureau of Indian Standards.' },
                { icon: '🤲', title: 'Handcrafted', desc: 'Every piece is handmade by master artisans using centuries-old techniques passed down through generations.' },
                { icon: '🚚', title: 'Free Shipping', desc: 'Free insured shipping across India on orders above Rs.5,000. Your jewellery arrives safely, every time.' },
                { icon: '🔄', title: '30-Day Returns', desc: 'Not happy? Return within 30 days for a full refund or exchange, no questions asked.' },
                { icon: '💎', title: 'Lifetime Polish', desc: 'Free cleaning and minor repairs for the lifetime of your jewellery. We stand behind every piece we make.' },
                { icon: '📦', title: 'Luxury Packaging', desc: 'Each piece arrives in our signature gift box, ready to be gifted or treasured for generations.' },
              ].map((v, i) => (
                <div key={i} className={styles.valueCard}>
                  <div className={styles.valueIcon}>{v.icon}</div>
                  <h3 className={styles.valueTitle}>{v.title}</h3>
                  <p className={styles.valueDesc}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className={styles.ctaSection}>
          <div className={styles.eyebrow}>Ready to Shop?</div>
          <h2 className={styles.ctaTitle}>Find Your Perfect <em>Piece</em></h2>
          <p className={styles.ctaDesc}>Browse our curated collection of handcrafted jewellery for every occasion.</p>
          <div className={styles.ctaBtns}>
            <Link to="/products" className="btn-fill"><span>Shop Now</span></Link>
            <Link to="/contact" className="btn-outline">Contact Us</Link>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default About;