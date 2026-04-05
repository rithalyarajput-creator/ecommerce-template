import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Footer from '../../components/Footer/Footer';

export default function PolicyPage() {
  const { slug } = useParams();
  
  if (slug === 'privacy-policy') return <div><div style={{background:'#6B1A2A',padding:'60px',textAlign:'center',color:'#fff'}}><h1 style={{fontFamily:'serif',fontWeight:300}}>Privacy Policy</h1></div><div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}><h3>Privacy Policy - Amshine</h3><p>At Amshine, we respect your privacy and are committed to protecting your personal information.</p><h3>Collecting Your Personal Data</h3><ul><li>Your name, email, phone number, and shipping address when you place an order.</li><li>Billing information required to process your purchase.</li></ul><h3>Data Protection</h3><p>We do not sell, rent, or trade your personal information with third parties.</p></div><Footer /></div>;
  
  if (slug === 'shipping-policy') return <div><div style={{background:'#1A3A6A',padding:'60px',textAlign:'center',color:'#fff'}}><h1 style={{fontFamily:'serif',fontWeight:300}}>Shipping Policy</h1></div><div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}><h3>Shipping Policy - Amshine</h3><p>At Amshine, we aim to deliver your jewellery orders safely and on time.</p><h3>Order Processing</h3><ul><li>Orders are processed within 1-3 business days after payment confirmation.</li><li>Orders placed on weekends will be processed on the next working day.</li></ul><h3>Delivery Time</h3><ul><li>Estimated delivery time is 3-7 business days.</li></ul></div><Footer /></div>;
  
  if (slug === 'return-policy') return <div><div style={{background:'#1A4A1A',padding:'60px',textAlign:'center',color:'#fff'}}><h1 style={{fontFamily:'serif',fontWeight:300}}>Return and Refund Policy</h1></div><div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}><h3>Return and Refund Policy - Amshine</h3><p>We want our customers to be satisfied with their purchase.</p><h3>Return Eligibility</h3><ul><li>Return requests must be made within 7 days of delivery.</li><li>The product must be unused and in its original packaging.</li></ul><h3>Refund Process</h3><p>Once the returned product is received, the refund will be processed within a few business days.</p></div><Footer /></div>;
  
  if (slug === 'terms-of-service') return <div><div style={{background:'#3A1A6A',padding:'60px',textAlign:'center',color:'#fff'}}><h1 style={{fontFamily:'serif',fontWeight:300}}>Terms of Service</h1></div><div style={{maxWidth:800,margin:'0 auto',padding:'60px 24px'}}><h3>Terms of Service - Amshine</h3><p>By accessing or using the Amshine website, you agree to comply with the following terms.</p><h3>Use of Website</h3><ul><li>You agree to use the website only for lawful purposes.</li><li>You must provide accurate information while placing an order.</li></ul><h3>Contact Us</h3><p>Email: support@amshinejewels.com</p></div><Footer /></div>;
  
  return <div style={{textAlign:'center',padding:80}}><h2>Page not found</h2><Link to="/">Go Home</Link></div>;
}