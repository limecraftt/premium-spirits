import React from 'react';

const HeroSection = () => {
  return (
    <div 
      className="relative h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=2000&auto=format&fit=crop')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-950"></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <h1 className="text-6xl md:text-7xl font-bold mb-4">
          <span className="text-amber-500">Exceptional Spirits</span>
          <br />
          <span className="text-white">Curated for You</span>
        </h1>
        
        <p className="text-xl text-zinc-300 mb-8">
          Discover our handpicked collection of the world's finest whiskeys, vodkas, and premium liquors
        </p>
        
        <div className="flex gap-4 justify-center flex-wrap">
          <button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors flex items-center gap-2">
            Explore Collection
            <span>→</span>
          </button>
          <button className="bg-transparent hover:bg-zinc-800 text-amber-500 font-semibold px-8 py-3 rounded-lg border-2 border-amber-500 transition-colors">
            Our Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;