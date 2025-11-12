import React from 'react';
import { Mail } from 'lucide-react';

const NewsletterSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-20">
      <div className="border border-zinc-800 rounded-2xl p-12 text-center">
        <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail className="text-amber-500" size={32} />
        </div>
        
        <h2 className="text-4xl font-bold mb-4">
          Stay in the <span className="text-amber-500">Loop</span>
        </h2>
        
        <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
          Subscribe to our newsletter for exclusive offers, new arrivals, and expert 
          recommendations delivered to your inbox.
        </p>
        
        <div className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
          <button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold px-8 py-3 rounded-lg transition-colors">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsletterSection;