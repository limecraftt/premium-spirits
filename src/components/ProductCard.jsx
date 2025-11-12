import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ name, description, price, category, imageUrl }) => {
  return (
    <div className="bg-black rounded-lg overflow-hidden border border-zinc-800 hover:border-amber-500 transition-all duration-300 group">
      <div className="relative h-64 bg-zinc-900 overflow-hidden">
        <span className="absolute top-4 right-4 bg-amber-500 text-black px-3 py-1 rounded text-sm font-semibold z-10">
          {category}
        </span>
        
        {/* Image with hover effect */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${imageUrl}')`,
          }}
        ></div>
        
        {/* Overlay that appears on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-500 transition-colors">
          {name}
        </h3>
        <p className="text-zinc-400 text-sm mb-4">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-amber-500 text-2xl font-bold">${price}</span>
          <button className="bg-amber-900 hover:bg-amber-700 text-amber-100 px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-900/50">
            <ShoppingCart size={18} />
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;