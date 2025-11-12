import React, { useState } from 'react';
import ProductCard from './ProductCard';

const CollectionSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Cognac'];
  
  const products = [
    { 
      name: 'Highland Reserve 18', 
      description: 'Single Malt Scotch Whisky', 
      price: '189.99', 
      category: 'Whiskey', 
      imageUrl: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?q=80&w=800&auto=format&fit=crop'
    },
    { 
      name: 'Crystal Premium', 
      description: 'Ultra-Smooth Vodka', 
      price: '49.99', 
      category: 'Vodka', 
      imageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=800&auto=format&fit=crop'
    },
    { 
      name: 'Caribbean Gold', 
      description: 'Aged Dark Rum', 
      price: '79.99', 
      category: 'Rum', 
      imageUrl: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?q=80&w=800&auto=format&fit=crop'
    },
    { 
      name: 'Botanical Excellence', 
      description: 'London Dry Gin', 
      price: '65.99', 
      category: 'Gin', 
      imageUrl: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?q=80&w=800&auto=format&fit=crop'
    },
    { 
      name: 'Agave Supremo', 
      description: 'Extra Añejo Tequila', 
      price: '129.99', 
      category: 'Tequila', 
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=800&auto=format&fit=crop'
    },
    { 
      name: 'Château Napoleon', 
      description: 'XO Cognac', 
      price: '249.99', 
      category: 'Cognac', 
      imageUrl: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800&auto=format&fit=crop'
    },
  ];

  const filteredProducts = selectedCategory === 'All' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="text-center mb-12">
        <h2 className="text-5xl font-bold mb-4">
          Our <span className="text-amber-500">Collection</span>
        </h2>
        <p className="text-zinc-400 text-lg">
          Handpicked spirits from renowned distilleries worldwide
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-3 mb-12 overflow-x-auto pb-4">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black scale-105 shadow-lg shadow-amber-500/50'
                : 'bg-zinc-900 text-white hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product, idx) => (
          <ProductCard key={idx} {...product} />
        ))}
      </div>
    </div>
  );
};

export default CollectionSection;