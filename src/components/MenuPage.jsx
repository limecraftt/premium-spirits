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
    const slug = window.location.pathname.split('/menu/')[1]?.split('?')[0];
    const params = new URLSearchParams(window.location.search);
    const cat = params.get('cat');
    if (cat) setActiveCategory(cat);
    if (slug) fetchBarAndDrinks(slug);
    else setNotFound(true);
  }, []);

  const fetchBarAndDrinks = async (slug) => {
    try {
      const { data: barData, error: barError } = await supabase.from('bars').select('*').eq('slug', slug).single();
      if (barError || !barData) { setNotFound(true); setLoading(false); return; }
      setBar(barData);
      const { data: drinksData, error: drinksError } = await supabase.from('drinks').select('*').eq('bar_id', barData.id).eq('available', true).order('category');
      if (drinksError) throw drinksError;
      setDrinks(drinksData || []);
    } catch { setNotFound(true); }
    finally { setLoading(false); }
  };

  const usedCategories = ['All', ...new Set(drinks.map(d => d.category))];
  const filtered = drinks.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || (d.subtitle || '').toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (notFound) return (
    <div style={{ minHeight: '100vh', background: '#0f0a1e', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div>
        <div style={{ fontSize: 56, marginBottom: 16 }}>🍸</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>Menu not found</h1>
        <p style={{ color: '#6b7280', fontSize: 14 }}>This bar's menu doesn't exist or the link may be incorrect.</p>
        <a href="/" style={{ display: 'inline-block', marginTop: 20, color: '#a78bfa', fontSize: 13, textDecoration: 'none' }}>← Back to MyBar</a>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f0a1e', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .syne { font-family: 'Syne', sans-serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .drink-card { background: #1a1030; border: 1px solid #2d1f50; border-radius: 20px; overflow: hidden; cursor: pointer; transition: all 0.25s; }
        .drink-card:hover { border-color: #7c3aed; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(124,58,237,0.15); }
        .drink-card:active { transform: translateY(-2px); }
        .search-input { width: 100%; background: #1a1030; border: 1.5px solid #2d1f50; border-radius: 999px; padding: 11px 16px 11px 40px; font-size: 14px; color: #fff; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; }
        .search-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.15); }
        .search-input::placeholder { color: #4b5563; }
        .cat-btn { border: 1.5px solid #2d1f50; background: #1a1030; color: #6b7280; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; white-space: nowrap; border-radius: 999px; padding: 7px 16px; flex-shrink: 0; }
        .cat-btn:hover { border-color: #7c3aed; color: #a78bfa; }
        .cat-btn.active { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; border-color: transparent; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .skeleton { animation: pulse 1.5s ease-in-out infinite; background: #1a1030; border-radius: 20px; overflow: hidden; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

        /* Grid */
        .drinks-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 900px) { .drinks-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .drinks-grid { grid-template-columns: 1fr; } }

        /* Modal slide up on mobile */
        @media (max-width: 640px) {
          .modal-inner { border-bottom-left-radius: 0 !important; border-bottom-right-radius: 0 !important; max-height: 90vh; overflow-y: auto; }
        }
      `}</style>

      {/* Sticky Header */}
      <div style={{ background: 'rgba(15,10,30,0.96)', borderBottom: '1px solid #2d1f50', position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 16px 0' }}>

          {/* Bar name + count */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              {loading
                ? <div style={{ height: 26, width: 160, background: '#1a1030', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                : <>
                    <h1 className="syne" style={{ fontSize: 'clamp(18px, 5vw, 24px)', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{bar?.name}</h1>
                    {bar?.location && <p style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>{bar.location}</p>}
                  </>
              }
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: '#4b5563', textTransform: 'uppercase', letterSpacing: 2 }}>Menu</div>
              <div style={{ fontSize: 13, color: '#a78bfa', fontWeight: 600, marginTop: 2 }}>{filtered.length} items</div>
            </div>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <svg style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#4b5563' }} width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drinks..." className="search-input" />
          </div>
        </div>

        {/* Category filters */}
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px 14px' }}>
          <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
            {usedCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px 48px' }}>
        {loading ? (
          <div className="drinks-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton">
                <div style={{ height: 200, background: '#2d1f50' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ height: 14, background: '#2d1f50', borderRadius: 6, width: '70%' }} />
                  <div style={{ height: 11, background: '#2d1f50', borderRadius: 6, width: '50%' }} />
                  <div style={{ height: 14, background: '#2d1f50', borderRadius: 6, width: '30%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 52, marginBottom: 12 }}>🍸</div>
            <p style={{ color: '#6b7280', fontSize: 16, fontWeight: 500 }}>No drinks found</p>
            {(search || activeCategory !== 'All') && (
              <button onClick={() => { setSearch(''); setActiveCategory('All'); }}
                style={{ marginTop: 12, color: '#a78bfa', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, fontFamily: 'Inter' }}>
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="drinks-grid">
            {filtered.map(drink => (
              <div key={drink.id} className="drink-card" onClick={() => setSelectedDrink(drink)}>
                {/* Image */}
                <div style={{ position: 'relative', height: 200, background: '#2d1f50', overflow: 'hidden' }}>
                  {drink.image_url
                    ? <img src={drink.image_url} alt={drink.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }}
                        onMouseOver={e => e.target.style.transform = 'scale(1.06)'}
                        onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>{EMOJI_MAP[drink.category] || EMOJI_MAP.default}</div>}
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,30,0.9) 0%, transparent 50%)' }} />
                  {drink.badge && (
                    <span style={{ position: 'absolute', top: 10, right: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999 }}>{drink.badge}</span>
                  )}
                  <span style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(15,10,30,0.75)', color: '#a78bfa', fontSize: 10, padding: '3px 9px', borderRadius: 999, backdropFilter: 'blur(4px)', fontWeight: 500 }}>{drink.category}</span>
                </div>

                {/* Info */}
                <div style={{ padding: '14px 16px 16px' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#fff', lineHeight: 1.3, marginBottom: 4 }}>{drink.name}</h3>
                  {drink.subtitle && <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 6 }}>{drink.subtitle}</p>}
                  {drink.description && <p className="line-clamp-2" style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.6, marginBottom: 10 }}>{drink.description}</p>}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#a78bfa' }}>KES {Number(drink.price).toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: '#4b5563' }}>Tap for details</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedDrink && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 50, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0', backdropFilter: 'blur(8px)' }}
          onClick={() => setSelectedDrink(null)}>
          <div
            className="modal-inner"
            style={{ background: '#1a1030', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 480, overflow: 'hidden', border: '1px solid #2d1f50', borderBottom: 'none' }}
            onClick={e => e.stopPropagation()}>

            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
              <div style={{ width: 40, height: 4, background: '#2d1f50', borderRadius: 999 }} />
            </div>

            {selectedDrink.image_url ? (
              <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                <img src={selectedDrink.image_url} alt={selectedDrink.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1a1030 0%, rgba(26,16,48,0.4) 50%, transparent 100%)' }} />
                {selectedDrink.badge && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 999 }}>{selectedDrink.badge}</span>
                )}
              </div>
            ) : (
              <div style={{ height: 120, background: '#2d1f50', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 56 }}>{EMOJI_MAP[selectedDrink.category] || EMOJI_MAP.default}</div>
            )}

            <div style={{ padding: '20px 20px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                  <h2 className="syne" style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>{selectedDrink.name}</h2>
                  {selectedDrink.subtitle && <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{selectedDrink.subtitle}</p>}
                </div>
                <span className="syne" style={{ fontSize: 22, fontWeight: 700, color: '#a78bfa', flexShrink: 0 }}>KES {Number(selectedDrink.price).toLocaleString()}</span>
              </div>
              <span style={{ display: 'inline-block', background: '#2d1f50', color: '#a78bfa', fontSize: 11, padding: '4px 12px', borderRadius: 999, marginBottom: 14, fontWeight: 500 }}>{selectedDrink.category}</span>
              {selectedDrink.description && <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.7 }}>{selectedDrink.description}</p>}
              <button onClick={() => setSelectedDrink(null)}
                style={{ marginTop: 20, width: '100%', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', color: '#fff', fontWeight: 600, fontSize: 15, padding: '14px', borderRadius: 14, border: 'none', cursor: 'pointer', fontFamily: 'Inter', transition: 'opacity 0.2s' }}
                onMouseOver={e => e.target.style.opacity = 0.9} onMouseOut={e => e.target.style.opacity = 1}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop: '1px solid #2d1f50', padding: '20px 16px', textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#4b5563' }}>
          Powered by <a href="/" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>MyBar</a> · Please drink responsibly
        </p>
      </div>
    </div>
  );
}