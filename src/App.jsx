import React, { useState } from 'react';
import AgeVerificationModal from './components/AgeVerificationModal';
import HeroSection from './components/HeroSection';
import CollectionSection from './components/CollectionSection';
import AboutSection from './components/AboutSection';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';
import MenuPage from './components/MenuPage';
import AdminDashboard from './components/AdminDashboard';

// Simple client-side routing based on pathname
const getRoute = () => {
  const path = window.location.pathname;
  if (path === '/menu') return 'menu';
  if (path === '/admin') return 'admin';
  return 'home';
};

const App = () => {
  const [showAgeVerification, setShowAgeVerification] = useState(true);
  const route = getRoute();

  const handleAgeVerification = (isOfAge) => {
    if (isOfAge) {
      setShowAgeVerification(false);
    } else {
      alert('You must be 21 or older to enter this site.');
    }
  };

  // Menu page - no age gate needed, it's just the drinks menu
  if (route === 'menu') return <MenuPage />;

  // Admin dashboard - protect with your own auth if needed
  if (route === 'admin') return <AdminDashboard />;

  // Main site with age verification
  if (showAgeVerification) {
    return <AgeVerificationModal onVerify={handleAgeVerification} />;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <HeroSection />
      <CollectionSection />
      <AboutSection />
      <NewsletterSection />
      <Footer />
    </div>
  );
};

export default App;