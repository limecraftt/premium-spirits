import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['All', 'Cocktails', 'Mocktails', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Cognac', 'Wine', 'Beer', 'Special Offers'];

const EMOJI_MAP = {
  Cocktails: '🍹', Mocktails: '🧃', Whiskey: '🥃', Vodka: '🍸',
  Rum: '🥃', Gin: '🍸', Tequila: '🥂', Cognac: '🥃',
  Wine: '🍷', Beer: '🍺', 'Special Offers': '⭐', default: '🍶',
};

// Fallback demo drinks if Supabase isn't connected yet
const DEMO_DRINKS = [
  { id: 1, name: 'Highland Reserve 18', category: 'Whiskey', subtitle: 'Single Malt Scotch Whisky', price: 189.99, description: 'Rich, complex single malt aged 18 years with notes of dried fruit and oak.', available: true, badge: 'Premium', image_url: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80' },
  { id: 2, name: 'Crystal Premium', category: 'Vodka', subtitle: 'Ultra-Smooth Vodka', price: 49.99, description: 'Five-times distilled for an exceptionally clean, crisp finish.', available: true, badge: '', image_url: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80' },
  { id: 3, name: 'Caribbean Gold', category: 'Rum', subtitle: 'Aged Dark Rum', price: 79.99, description: 'Aged in charred oak barrels, deep caramel notes with a smooth finish.', available: true, badge: 'Bestseller', image_url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=600&q=80' },
  { id: 4, name: 'Botanical Excellence', category: 'Gin', subtitle: 'London Dry Gin', price: 65.99, description: 'A blend of 12 handpicked botanicals for a refreshing floral taste.', available: true, badge: '', image_url: 'https://images.unsplash.com/photo-1606399668044-d9b5fe6d73a3?w=600&q=80' },
  { id: 5, name: 'Passion Fruit Mojito', category: 'Cocktails', subtitle: 'House Cocktail', price: 18.99, description: 'White rum, passion fruit, fresh mint, lime juice, topped with soda.', available: true, badge: 'New', image_url: 'https://images.unsplash.com/photo-1571950006418-f883b2f0b1e5?w=600&q=80' },
  { id: 6, name: 'Mango Sunrise', category: 'Mocktails', subtitle: 'Non-Alcoholic', price: 12.99, description: 'Fresh mango, orange juice, grenadine and ginger ale over ice.', available: true, badge: '', image_url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80' },
];

export default function MenuPage() {
  const [drinks, setDrinks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedDrink, setSelectedDrink] = useState(null);

  useEffect(() => {
    fetchDrinks();
  }, []);

  const fetchDrinks = async () => {
    try {
      const { data, error } = await supabase
        .from('drinks')
        .select('*')
        .eq('available', true)
        .order('category');
      if (error) throw error;
      setDrinks(data && data.length > 0 ? data : DEMO_DRINKS);
    } catch {
      setDrinks(DEMO_DRINKS);
    } finally {
      setLoading(false);
    }
  };

  const usedCategories = ['All', ...new Set(drinks.map(d => d.category))];

  const filtered = drinks.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.subtitle || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Header */}
      <div className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-sm bg-zinc-950/95">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                <span className="text-white">Premium </span>
                <span className="text-amber-400">Spirits</span>
              </h1>
              <p className="text-zinc-500 text-xs mt-0.5 tracking-widest uppercase">Drinks Menu</p>
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Table Menu</div>
              <div className="text-amber-400 text-xs mt-0.5">{filtered.length} items</div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search drinks..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {usedCategories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-zinc-950'
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-zinc-800" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                  <div className="h-4 bg-zinc-800 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍸</div>
            <p className="text-zinc-500 text-lg">No drinks found</p>
            <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 text-amber-400 text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(drink => (
              <div
                key={drink.id}
                onClick={() => setSelectedDrink(drink)}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/30 transition-all cursor-pointer group hover:-translate-y-1 duration-200"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-zinc-800">
                  {drink.image_url ? (
                    <img
                      src={drink.image_url}
                      alt={drink.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      {EMOJI_MAP[drink.category] || EMOJI_MAP.default}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  {drink.badge && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                      {drink.badge}
                    </span>
                  )}
                  <span className="absolute top-3 left-3 bg-zinc-950/70 text-zinc-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                    {drink.category}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-white font-semibold text-base leading-tight">{drink.name}</h3>
                  {drink.subtitle && (
                    <p className="text-zinc-500 text-xs mt-1">{drink.subtitle}</p>
                  )}
                  {drink.description && (
                    <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">{drink.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-400 font-bold text-lg">${Number(drink.price).toFixed(2)}</span>
                    <span className="text-zinc-600 text-xs">Tap for details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drink Detail Modal */}
      {selectedDrink && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDrink(null)}>
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden border border-zinc-800" onClick={e => e.stopPropagation()}>
            {selectedDrink.image_url && (
              <div className="relative h-56 overflow-hidden">
                <img src={selectedDrink.image_url} alt={selectedDrink.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                {selectedDrink.badge && (
                  <span className="absolute top-4 right-4 bg-amber-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">
                    {selectedDrink.badge}
                  </span>
                )}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-white text-xl font-bold">{selectedDrink.name}</h2>
                  {selectedDrink.subtitle && <p className="text-zinc-400 text-sm mt-1">{selectedDrink.subtitle}</p>}
                </div>
                <span className="text-amber-400 font-bold text-2xl">${Number(selectedDrink.price).toFixed(2)}</span>
              </div>
              <span className="inline-block bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full mb-3">{selectedDrink.category}</span>
              {selectedDrink.description && (
                <p className="text-zinc-400 text-sm leading-relaxed">{selectedDrink.description}</p>
              )}
              <button onClick={() => setSelectedDrink(null)} className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-3 rounded-xl transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t border-zinc-800 mt-12 py-6 text-center">
        <p className="text-zinc-600 text-xs">© 2024 Premium Spirits · Please drink responsibly</p>
      </div>
    </div>
  );
}