import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import styles from './Navbar.module.css';

const LOGO = 'https://i.ibb.co/k6vTPq7F/Untitled-design-2.png';
const HINTS = ['necklaces...','earrings...','rings...','bracelets...','jewellery sets...'];

const Navbar = () => {
  const { cart } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [q, setQ] = useState('');
  const [hint, setHint] = useState('');
  const [hi, setHi] = useState(0);
  const [ci, setCi] = useState(0);
  const [del, setDel] = useState(false);
  const count = (cart||[]).reduce((s,i)=>s+i.quantity,0);

  useEffect(()=>{
    const h=()=>setScrolled(window.scrollY>50);
    window.addEventListener('scroll',h);
    return()=>window.removeEventListener('scroll',h);
  },[]);

  useEffect(()=>{
    const cur=HINTS[hi]; let t;
    if(!del&&ci<cur.length) t=setTimeout(()=>{setHint(cur.slice(0,ci+1));setCi(c=>c+1);},75);
    else if(!del&&ci===cur.length) t=setTimeout(()=>setDel(true),1800);
    else if(del&&ci>0) t=setTimeout(()=>{setHint(cur.slice(0,ci-1));setCi(c=>c-1);},40);
    else if(del&&ci===0){setDel(false);setHi(i=>(i+1)%HINTS.length);}
    return()=>clearTimeout(t);
  },[ci,del,hi]);

  const doSearch=(e)=>{
    e.preventDefault();
    if(q.trim()){navigate('/products?search='+encodeURIComponent(q.trim()));setQ('');setMobileSearch(false);}
  };

  return(<>
    <div className={styles.ann}>
      <div className={styles['ann-inner']}>
        {['Free Shipping Rs.5,000+','Handcrafted with Love','BIS Certified','30-Day Returns','Secure Payments','COD Available',
          'Free Shipping Rs.5,000+','Handcrafted with Love','BIS Certified','30-Day Returns','Secure Payments','COD Available'].map((t,i)=>(
          <span key={i} className={styles['ann-item']}>{t}<span className={styles['ann-dot']}/></span>
        ))}
      </div>
    </div>

    <nav className={styles.snav+(scrolled?' '+styles.scrolled:'')}>
      <button className={styles['n-ham']} onClick={()=>setMenuOpen(true)} aria-label="Menu">
        <span/><span/><span/>
      </button>
      <Link to="/" className={styles['n-logo']}>
        <img src={LOGO} alt="Amshine" onError={e=>{e.target.style.display='none';}}/>
      </Link>
      <ul className={styles['n-links']}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/products">Shop</Link></li>
        <li><Link to="/about">About Us</Link></li>
        <li><Link to="/contact">Contact</Link></li>
      </ul>
      <form className={styles['n-search']} onSubmit={doSearch}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" value={q} onChange={e=>setQ(e.target.value)} placeholder={'Search for '+hint+'|'} className={styles['n-si']}/>
      </form>
      <div className={styles['n-right']}>
        <button className={styles['n-icon']+' '+styles['n-mob']} onClick={()=>setMobileSearch(true)} aria-label="Search">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button className={styles['n-icon']} aria-label="Wishlist">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <Link to="/cart" className={styles['n-cart']}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          <span className={styles['n-cl']}>Cart</span>
          {count>0&&<span className={styles['n-bubble']}>{count}</span>}
        </Link>
      </div>
    </nav>

    {mobileSearch&&(
      <div className={styles['mob-srch-overlay']} onClick={()=>setMobileSearch(false)}>
        <form className={styles['mob-srch-form']} onSubmit={doSearch} onClick={e=>e.stopPropagation()}>
          <input autoFocus value={q} onChange={e=>setQ(e.target.value)} placeholder="Search jewellery..." className={styles['mob-srch-in']}/>
          <button type="submit" className={styles['mob-srch-btn']}>Search</button>
        </form>
      </div>
    )}

    <div className={styles['n-drawer']+(menuOpen?' '+styles.open:'')}>
      <button className={styles['n-drawer-x']} onClick={()=>setMenuOpen(false)}>x</button>
      <Link to="/" className={styles['n-drawer-logo']} onClick={()=>setMenuOpen(false)}>
        <img src={LOGO} alt="Amshine" onError={e=>e.target.style.display='none'}/>
      </Link>
      <ul className={styles['n-drawer-links']}>
        {[['/', 'Home'],['/products','Shop'],['/about','About Us'],['/contact','Contact'],['/cart','Cart ('+count+')']].map(([to,label])=>(
          <li key={to}><Link to={to} onClick={()=>setMenuOpen(false)}>{label}</Link></li>
        ))}
      </ul>
    </div>
    <div className={styles['n-overlay']+(menuOpen?' '+styles.open:'')} onClick={()=>setMenuOpen(false)}/>
  </>);
};
export default Navbar;
