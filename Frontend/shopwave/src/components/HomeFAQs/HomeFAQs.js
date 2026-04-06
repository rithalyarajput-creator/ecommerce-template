import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'https://amshine-backend.onrender.com/api';

const ChevronIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)', flexShrink: 0 }}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FAQItem = ({ faq, index, isOpen, onToggle }) => (
  <div style={{
    borderBottom: '1px solid #E8D5A3',
    overflow: 'hidden',
  }}>
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '20px 28px',
        background: isOpen ? '#FDF6E9' : '#fff',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.3s ease',
      }}
    >
      <span style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontSize: 13,
        color: '#B8860B',
        fontWeight: 600,
        minWidth: 28,
        opacity: 0.7,
      }}>
        {String(index + 1).padStart(2, '0')}
      </span>
      <span style={{
        flex: 1,
        fontSize: 15,
        fontWeight: 600,
        color: isOpen ? '#6B1A2A' : '#2C1810',
        lineHeight: 1.45,
        transition: 'color 0.3s ease',
      }}>
        {faq.question}
      </span>
      <span style={{ color: '#B8860B', transition: 'color 0.3s' }}>
        <ChevronIcon open={isOpen} />
      </span>
    </button>

    {/* Smooth sliding answer */}
    <div style={{
      maxHeight: isOpen ? '300px' : '0',
      overflow: 'hidden',
      transition: 'max-height 0.45s cubic-bezier(.4,0,.2,1)',
    }}>
      <div style={{
        padding: '0 28px 22px 72px',
        fontSize: 14.5,
        color: '#5C4030',
        lineHeight: 1.85,
        fontWeight: 400,
        opacity: isOpen ? 1 : 0,
        transition: 'opacity 0.3s ease 0.1s',
      }}>
        {faq.answer}
      </div>
    </div>
  </div>
);

const HomeFAQs = () => {
  const [faqs, setFaqs]   = useState([]);
  const [openId, setOpenId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/faqs/home`)
      .then(r => r.json())
      .then(data => { if (data.success) setFaqs(data.faqs); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && faqs.length === 0) return null;

  return (
    <section style={{
      background: '#FDFAF4',
      padding: '80px 24px',
      borderTop: '1px solid #EDE4D4',
    }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '3px',
            textTransform: 'uppercase', color: '#B8860B', marginBottom: 12,
          }}>
            Common Questions
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 600,
            color: '#2C1810',
            margin: '0 0 12px',
            lineHeight: 1.2,
          }}>
            Frequently Asked <em style={{ color: '#B8860B', fontStyle: 'italic' }}>Questions</em>
          </h2>
          <p style={{
            fontSize: 14, color: '#8A7060', fontWeight: 400,
            maxWidth: 400, margin: '0 auto', lineHeight: 1.7,
          }}>
            Quick answers to what our customers ask most.
          </p>
        </div>

        {/* Gold divider */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, transparent, #B8860B)' }} />
          <div style={{ width: 5, height: 5, background: '#B8860B', transform: 'rotate(45deg)' }} />
          <div style={{ width: 50, height: 1, background: 'linear-gradient(90deg, #B8860B, transparent)' }} />
        </div>

        {/* FAQ Box */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[1,2,3,4].map(i => (
              <div key={i} style={{
                height: 62, borderRadius: 4,
                background: 'linear-gradient(90deg, #F5EDD8 25%, #EDE4D4 50%, #F5EDD8 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                marginBottom: 2,
              }} />
            ))}
          </div>
        ) : (
          <div style={{
            border: '1px solid #E8D5A3',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 2px 20px rgba(184,134,11,0.06)',
          }}>
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq._id}
                faq={faq}
                index={i}
                isOpen={openId === faq._id}
                onToggle={() => setOpenId(openId === faq._id ? null : faq._id)}
              />
            ))}
          </div>
        )}

        {/* View all link */}
        <div style={{ textAlign: 'center', marginTop: 32 }}>
          <Link to="/faqs" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            color: '#B8860B', fontSize: 13, fontWeight: 600,
            textDecoration: 'none', letterSpacing: '0.5px',
            padding: '10px 24px', border: '1.5px solid #B8860B',
            borderRadius: 8, transition: 'all 0.2s',
          }}
            onMouseOver={e => { e.currentTarget.style.background = '#B8860B'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#B8860B'; }}
          >
            View all FAQs
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
};

export default HomeFAQs;