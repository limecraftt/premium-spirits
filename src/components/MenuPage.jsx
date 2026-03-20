import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const EMOJI_MAP = { Cocktails: '🍹', Mocktails: '🧃', Whiskey: '🥃', Vodka: '🍸', Rum: '🥃', Gin: '🍸', Tequila: '🥂', Cognac: '🥃', Wine: '🍷', Beer: '🍺', 'Special Offers': '⭐', default: '🍶' };

export default function MenuPage() {
  const [bar, setBar] = useState(null);
  const [drinks, setDrinks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedDrink, setSelectedDrink] = useState(null);

  useEffect(() => {
    // Extract slug from /menu/slug
    const slug = window.location.pathname.split('/menu/')[1]?.split('?')[0];
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setActiveCategory(cat);
    if (slug) fetchBarAndDrinks(slug);
    else setNotFound(true);
  }, []);

  const fetchBarAndDrinks = async (slug) => {
    try {
      const { data: barData, error: barError } = await supabase
        .from('bars').select('*').eq('slug', slug).single();
      if (barError || !barData) { setNotFound(true); setLoading(false); return; }
      setBar(barData);

      const { data: drinksData, error: drinksError } = await supabase
        .from('drinks').select('*')
        .eq('bar_id', barData.id)
        .eq('available', true)
        .order('category');
      if (drinksError) throw drinksError;
      setDrinks(drinksData || []);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const usedCategories = ['All', ...new Set(drinks.map(d => d.category))];
  const filtered = drinks.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || (d.subtitle || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (notFound) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-6xl mb-4">🍸</div>
        <h1 className="text-2xl font-bold text-white mb-2">Menu not found</h1>
        <p className="text-zinc-500">This bar's menu doesn't exist or the link may be incorrect.</p>
        <a href="/" className="mt-6 inline-block text-amber-400 hover:underline text-sm">Back to MyBar</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="bg-zinc-950/95 border-b border-zinc-800 sticky top-0 z-40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              {loading ? (
                <div className="h-7 w-40 bg-zinc-800 rounded-lg animate-pulse" />
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-white">{bar?.name}</h1>
                  {bar?.location && <p className="text-zinc-500 text-xs mt-0.5">{bar.location}</p>}
                </>
              )}
            </div>
            <div className="text-right">
              <div className="text-xs text-zinc-600 uppercase tracking-widest">Drinks Menu</div>
              <div className="text-amber-400 text-xs mt-0.5">{filtered.length} items</div>
            </div>
          </div>
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drinks..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50 transition-colors" />
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 pb-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-600'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <div key={i} className="bg-zinc-900 rounded-2xl overflow-hidden animate-pulse"><div className="h-52 bg-zinc-800" /><div className="p-4 space-y-3"><div className="h-4 bg-zinc-800 rounded w-3/4" /><div className="h-3 bg-zinc-800 rounded w-1/2" /><div className="h-4 bg-zinc-800 rounded w-1/4" /></div></div>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🍸</div>
            <p className="text-zinc-500 text-lg font-medium">No drinks found</p>
            {(search || activeCategory !== 'All') && <button onClick={() => { setSearch(''); setActiveCategory('All'); }} className="mt-4 text-amber-400 text-sm hover:underline font-medium">Clear filters</button>}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(drink => (
              <div key={drink.id} onClick={() => setSelectedDrink(drink)}
                className="bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 hover:border-amber-500/30 transition-all cursor-pointer group hover:-translate-y-1 duration-200">
                <div className="relative h-52 overflow-hidden bg-zinc-800">
                  {drink.image_url
                    ? <img src={drink.image_url} alt={drink.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center text-6xl">{EMOJI_MAP[drink.category] || EMOJI_MAP.default}</div>}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                  {drink.badge && <span className="absolute top-3 right-3 bg-amber-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">{drink.badge}</span>}
                  <span className="absolute top-3 left-3 bg-zinc-950/70 text-zinc-300 text-xs px-2 py-1 rounded-full backdrop-blur-sm">{drink.category}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-base leading-tight">{drink.name}</h3>
                  {drink.subtitle && <p className="text-zinc-500 text-xs mt-1">{drink.subtitle}</p>}
                  {drink.description && <p className="text-zinc-400 text-xs mt-2 line-clamp-2 leading-relaxed">{drink.description}</p>}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-amber-400 font-bold text-lg">KES {Number(drink.price).toLocaleString()}</span>
                    <span className="text-zinc-600 text-xs">Tap for details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDrink && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedDrink(null)}>
          <div className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden border border-zinc-800" onClick={e => e.stopPropagation()}>
            {selectedDrink.image_url ? (
              <div className="relative h-56 overflow-hidden">
                <img src={selectedDrink.image_url} alt={selectedDrink.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent" />
                {selectedDrink.badge && <span className="absolute top-4 right-4 bg-amber-500 text-zinc-950 text-xs font-bold px-3 py-1 rounded-full">{selectedDrink.badge}</span>}
              </div>
            ) : (
              <div className="h-32 bg-zinc-800 flex items-center justify-center text-6xl">{EMOJI_MAP[selectedDrink.category] || EMOJI_MAP.default}</div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div><h2 className="text-white text-xl font-bold">{selectedDrink.name}</h2>{selectedDrink.subtitle && <p className="text-zinc-400 text-sm mt-0.5">{selectedDrink.subtitle}</p>}</div>
                <span className="text-amber-400 font-bold text-2xl ml-4">KES {Number(selectedDrink.price).toLocaleString()}</span>
              </div>
              <span className="inline-block bg-zinc-800 text-zinc-300 text-xs px-3 py-1 rounded-full mb-3">{selectedDrink.category}</span>
              {selectedDrink.description && <p className="text-zinc-400 text-sm leading-relaxed">{selectedDrink.description}</p>}
              <button onClick={() => setSelectedDrink(null)} className="mt-6 w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold py-3 rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="border-t border-zinc-800 mt-12 py-6 text-center">
        <p className="text-zinc-600 text-xs">Powered by <a href="/" className="text-amber-500/70 hover:text-amber-400">MyBar</a> · Please drink responsibly</p>
      </div>
    </div>
  );
}