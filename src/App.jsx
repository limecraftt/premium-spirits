import React, { useState } from 'react';
import AgeVerificationModal from './components/AgeVerificationModal';
import HeroSection from './components/HeroSection';
import CollectionSection from './components/CollectionSection';
import AboutSection from './components/AboutSection';
import NewsletterSection from './components/NewsletterSection';
import Footer from './components/Footer';

const App = () => {
  const [showAgeVerification, setShowAgeVerification] = useState(true);

  const handleAgeVerification = (isOfAge) => {
    if (isOfAge) {
      setShowAgeVerification(false);
    } else {
      alert('You must be 21 or older to enter this site.');
    }
  };

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