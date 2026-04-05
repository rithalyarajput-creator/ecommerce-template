import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast/Toast';
import Sidebar from './components/Sidebar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Orders from './pages/Orders/Orders';
import Customers from './pages/Customers/Customers';
import Categories from './pages/Categories/Categories';
import Settings from './pages/Settings/Settings';
import HomePage from './pages/HomePage/HomePage';
import Offers from './pages/Offers/Offers';
import FAQs from './pages/FAQs/FAQs';
import Subscriptions from './pages/Subscriptions/Subscriptions';
import Leads from './pages/Leads/Leads';
import CMS from './pages/CMS/CMS';
import Testimonials from './pages/Testimonials/Testimonials';
import styles from './App.module.css';

function PrivateRoute() {
  const { admin, loading } = useAuth();
  if (loading) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner spinner-lg" /></div>;
  if (!admin) return <Navigate to="/login" replace />;
  return <Layout />;
}

function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  return (
    <div className={styles.layout}>
      <Sidebar mobileOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />
      <div className={styles.main}>
        <Navbar onToggleSidebar={() => setMobileSidebarOpen(v => !v)} />
        <div className={styles.content}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/home-page"     element={<HomePage />} />
              <Route path="/products"      element={<Products />} />
              <Route path="/orders"        element={<Orders />} />
              <Route path="/customers"     element={<Customers />} />
              <Route path="/categories"    element={<Categories />} />
              <Route path="/offers"        element={<Offers />} />
              <Route path="/faqs"          element={<FAQs />} />
              <Route path="/subscriptions" element={<Subscriptions />} />
              <Route path="/leads"         element={<Leads />} />
              <Route path="/cms"           element={<CMS />} />
              <Route path="/testimonials"  element={<Testimonials />} />
              <Route path="/settings"      element={<Settings />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}