import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from '../pages/Landing/LandingPage';
import WhatIsGestly from '../pages/WhatIsGestly/WhatIsGestlyPage';
import ForWhoPage from '../pages/ForWho/ForWhoPage';
import Pricing from '../pages/Pricing/PricingPage';
import About from '../pages/About/AboutPage';
import Contact from '../pages/Contact/ContactPage';
import GuidePage from '../pages/Guide/GuidePage';
import Login from '../pages/Auth/Login';
import Onboarding from '../pages/Auth/Onboarding';
import LoadingScreen from './components/LoadingScreen';
import AdminLayout from '../pages/Admin/layouts/AdminLayout';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUsers from '../pages/Admin/AdminUsers';
import AdminBusinesses from '../pages/Admin/AdminBusinesses';
import AdminSettings from '../pages/Admin/AdminSettings';
import AdminAccounting from '../pages/Admin/AdminAccounting';
import AdminAffiliates from '../pages/Admin/AdminAffiliates';

import AppLayout from '../pages/App/layouts/AppLayout';
import POS from '../pages/App/POS';
import Dashboard from '../pages/App/Dashboard';
import Sales from '../pages/App/Sales';
import Catalog from '../pages/App/Catalog';
import Customers from '../pages/App/Customers';
import Employees from '../pages/App/Employees';
import Branches from '../pages/App/Branches';
import ShoppingList from '../pages/App/ShoppingList';
import AppGuide from '../pages/App/Guide';
import Settings from '../pages/App/Settings';
import CustomSection from '../pages/App/CustomSection';

import ScrollToTop from '../shared/components/ScrollToTop';
import ScrollToTopButton from '../shared/components/ScrollToTopButton';
import ChatBot from '../shared/components/ChatBot';
import { NotificationProvider } from '../shared/components/Notification/NotificationContext';

function App() {
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const handleLoad = async () => {
      // Solo mostrar la carga si las fuentes no están listas
      if (document.fonts.status !== 'loaded') {
        setLoading(true);
        try {
          await document.fonts.ready;
        } catch (e) {
          console.error("Error cargando fuentes", e);
        }
      }
      
      // Desactivar la carga inmediatamente una vez que todo esté listo
      setLoading(false);
    };

    handleLoad();
  }, [location.pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NotificationProvider>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/what-is-gestly" element={<WhatIsGestly />} />
        <Route path="/features" element={<WhatIsGestly />} />
        <Route path="/for-who" element={<ForWhoPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        
        {/* App User Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="ventas" element={<Sales />} />
          <Route path="catalogo" element={<Catalog />} />
          <Route path="clientes" element={<Customers />} />
          <Route path="empleados" element={<Employees />} />
          <Route path="sucursales" element={<Branches />} />
          <Route path="compras" element={<ShoppingList />} />
          <Route path="guia" element={<AppGuide />} />
          <Route path="configuracion" element={<Settings />} />
          <Route path="secciones/nueva" element={<CustomSection />} />
          <Route path="secciones/:sectionId" element={<CustomSection />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="businesses" element={<AdminBusinesses />} />
          <Route path="accounting" element={<AdminAccounting />} />
          <Route path="affiliates" element={<AdminAffiliates />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
      <ScrollToTopButton />
      <ChatBot />
    </NotificationProvider>
  );
}

export default App;
