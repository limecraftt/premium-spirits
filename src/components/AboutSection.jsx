import React from 'react';

const AboutSection = () => {
  return (
    <div className="bg-zinc-900 py-20">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-5xl font-bold mb-6">
          Crafted with <span className="text-amber-500">Passion</span>
        </h2>
        <p className="text-zinc-400 text-lg leading-relaxed">
          At Premium Spirits, we believe that exceptional liquor is more than just a drink—it's an 
          experience. Each bottle in our collection has been carefully selected for its unique character, rich 
          history, and uncompromising quality. From rare single malts to artisanal vodkas, we bring you the 
          world's finest spirits, delivered with expertise and care.
        </p>
      </div>
    </div>
  );
};

export default AboutSection;