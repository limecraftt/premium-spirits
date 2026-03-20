import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['Cocktails', 'Mocktails', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Cognac', 'Wine', 'Beer', 'Special Offers'];
const BADGES = ['', 'New', 'Bestseller', 'Special Offer', 'Premium', 'Limited'];

const EMPTY_FORM = {
  name: '', category: 'Whiskey', subtitle: '', price: '',
  description: '', badge: '', image_url: '', available: true,
};

// Simple canvas QR-like display
function QRDisplay({ text, size = 140 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const N = 21; const cell = size / N;
    let s = 0; for (let i = 0; i < text.length; i++) s = (s * 31 + text.charCodeAt(i)) & 0xffffffff;
    const rng = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    for (let r = 0; r < N; r++) for (let c2 = 0; c2 < N; c2++) {
      const finder = (r < 8 && c2 < 8) || (r < 8 && c2 >= N - 8) || (r >= N - 8 && c2 < 8);
      let dark;
      if (finder) {
        const inner = (r >= 2 && r <= 4 && c2 >= 2 && c2 <= 4) || (r >= 2 && r <= 4 && c2 >= N - 5 && c2 <= N - 3) || (r >= N - 5 && r <= N - 3 && c2 >= 2 && c2 <= 4);
        dark = inner || (r < 7 && c2 < 7 && !((r === 1 || r === 5) && c2 >= 1 && c2 <= 5) && !((c2 === 1 || c2 === 5) && r >= 1 && r <= 5)) || (r < 7 && c2 >= N - 7 && !((r === 1 || r === 5) && c2 >= N - 6 && c2 <= N - 2) && !((c2 === N - 2 || c2 === N - 6) && r >= 1 && r <= 5)) || (r >= N - 7 && c2 < 7 && !((r === N - 2 || r === N - 6) && c2 >= 1 && c2 <= 5) && !((c2 === 1 || c2 === 5) && r >= N - 6 && r <= N - 2));
      } else dark = rng() > 0.45;
      ctx.fillStyle = dark ? '#18120a' : '#fff';
      ctx.fillRect(c2 * cell, r * cell, cell, cell);
    }
  }, [text, size]);
  return <canvas ref={ref} width={size} height={size} style={{ borderRadius: 6 }} />;
}

export default function AdminDashboard() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);
  const [showQR, setShowQR] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('drinks'); // drinks | qr

  useEffect(() => { fetchDrinks(); }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchDrinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('drinks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setDrinks(data || []);
    } catch (e) {
      showToast('Could not load drinks. Check Supabase connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return showToast('Name and price are required.', 'error');
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editingId) {
        const { error } = await supabase.from('drinks').update(payload).eq('id', editingId);
        if (error) throw error;
        showToast('Drink updated!');
      } else {
        const { error } = await supabase.from('drinks').insert([payload]);
        if (error) throw error;
        showToast('Drink added to menu!');
      }
      await fetchDrinks();
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
    } catch (e) {
      showToast(e.message || 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (drink) => {
    setForm({ ...drink, price: String(drink.price) });
    setEditingId(drink.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('drinks').delete().eq('id', id);
      if (error) throw error;
      setDrinks(prev => prev.filter(d => d.id !== id));
      showToast('Drink removed.');
    } catch (e) {
      showToast('Delete failed.', 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  const toggleAvailable = async (drink) => {
    try {
      const { error } = await supabase.from('drinks').update({ available: !drink.available }).eq('id', drink.id);
      if (error) throw error;
      setDrinks(prev => prev.map(d => d.id === drink.id ? { ...d, available: !d.available } : d));
    } catch {
      showToast('Update failed.', 'error');
    }
  };

  const filtered = drinks.filter(d => {
    const matchCat = filterCat === 'All' || d.category === filterCat;
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = {
    total: drinks.length,
    available: drinks.filter(d => d.available).length,
    hidden: drinks.filter(d => !d.available).length,
    categories: new Set(drinks.map(d => d.category)).size,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl transition-all
          ${toast.type === 'error' ? 'bg-red-900 border border-red-700 text-red-100' : 'bg-amber-500 text-zinc-950'}`}>
          {toast.type === 'success' ? '✓ ' : '✕ '}{toast.msg}
        </div>
      )}

      {/* Top Nav */}
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-zinc-950 text-sm">PS</div>
            <div>
              <span className="font-semibold text-sm">Premium Spirits</span>
              <span className="ml-2 text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-full">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/menu" target="_blank" rel="noreferrer"
              className="text-xs text-zinc-400 hover:text-amber-400 border border-zinc-800 hover:border-amber-500/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Preview Menu
            </a>
            <button onClick={() => setActiveTab(activeTab === 'qr' ? 'drinks' : 'qr')}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5A2.5 2.5 0 0119 13a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 0114 13a2.5 2.5 0 012.5-2.5zM9 3.5A2.5 2.5 0 016.5 6 2.5 2.5 0 014 3.5 2.5 2.5 0 016.5 1 2.5 2.5 0 019 3.5zM9 20.5A2.5 2.5 0 016.5 23 2.5 2.5 0 014 20.5a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5z" /></svg>
              {activeTab === 'qr' ? 'Back to Drinks' : 'QR Codes'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Drinks', value: stats.total, color: 'text-white' },
            { label: 'Live on Menu', value: stats.available, color: 'text-amber-400' },
            { label: 'Hidden', value: stats.hidden, color: 'text-zinc-500' },
            { label: 'Categories', value: stats.categories, color: 'text-amber-400' },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">{s.label}</div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* QR Code Tab */}
        {activeTab === 'qr' && (
          <div>
            <h2 className="text-xl font-semibold mb-6">
              <span className="text-white">Menu </span><span className="text-amber-400">QR Codes</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Main QR */}
              <div className="bg-zinc-900 border border-amber-500/30 rounded-2xl p-6 text-center sm:col-span-2 lg:col-span-1">
                <div className="text-xs text-amber-400 uppercase tracking-widest mb-3">Full Menu</div>
                <div className="bg-white rounded-xl p-3 inline-block mb-4">
                  <QRDisplay text={`${window.location.origin}/menu`} size={160} />
                </div>
                <p className="text-zinc-400 text-xs mb-1">Scan to view all {stats.available} available drinks</p>
                <p className="text-zinc-600 text-xs font-mono">{window.location.origin}/menu</p>
                <button
                  onClick={() => {
                    const canvas = document.querySelector('canvas');
                    if (canvas) { const a = document.createElement('a'); a.download = 'menu-qr.png'; a.href = canvas.toDataURL(); a.click(); }
                  }}
                  className="mt-4 w-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs py-2 rounded-lg transition-colors"
                >
                  Download QR Code
                </button>
              </div>

              {/* Per-category QRs */}
              {[...new Set(drinks.map(d => d.category))].map(cat => (
                <div key={cat} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 text-center">
                  <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">{cat}</div>
                  <div className="bg-white rounded-xl p-2 inline-block mb-3">
                    <QRDisplay text={`${window.location.origin}/menu?cat=${encodeURIComponent(cat)}`} size={100} />
                  </div>
                  <p className="text-zinc-600 text-xs">{drinks.filter(d => d.category === cat && d.available).length} drinks</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drinks Tab */}
        {activeTab === 'drinks' && (
          <>
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search drinks..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500/50"
                />
              </div>
              <button
                onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setShowForm(true); }}
                className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Drink
              </button>
            </div>

            {/* Category filter pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
              {['All', ...CATEGORIES].filter(c => c === 'All' || drinks.some(d => d.category === c)).map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all border
                    ${filterCat === cat ? 'bg-amber-500 text-zinc-950 border-amber-500' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'}`}>
                  {cat}
                  {cat !== 'All' && <span className="ml-1.5 opacity-60">{drinks.filter(d => d.category === cat).length}</span>}
                </button>
              ))}
            </div>

            {/* Add/Edit Form */}
            {showForm && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 mb-6">
                <h3 className="text-base font-semibold mb-5 text-amber-400">
                  {editingId ? '✏️ Edit Drink' : '+ Add New Drink'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Subtitle / Type</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      placeholder="e.g. Single Malt Scotch Whisky"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Category *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Price (USD) *</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Badge</label>
                    <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50">
                      {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Image URL</label>
                    <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-zinc-500 uppercase tracking-widest block mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3} placeholder="Tasting notes, serving suggestions..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 resize-none" />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <div
                      onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${form.available ? 'bg-amber-500' : 'bg-zinc-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-xs text-zinc-400">{form.available ? 'Live on menu' : 'Hidden from menu'}</span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); }}
                      className="px-4 py-2 text-sm text-zinc-400 border border-zinc-800 rounded-xl hover:border-zinc-600 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving}
                      className="px-5 py-2 text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-xl transition-colors disabled:opacity-50">
                      {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Menu'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Drinks List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-600">
                <div className="text-4xl mb-3">🍸</div>
                <p>No drinks found</p>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
                <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 uppercase tracking-widest">{filtered.length} drinks</span>
                </div>
                {filtered.map((drink, i) => (
                  <div key={drink.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors ${i < filtered.length - 1 ? 'border-b border-zinc-800/50' : ''}`}>
                    {/* Image thumb */}
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                      {drink.image_url
                        ? <img src={drink.image_url} alt={drink.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-xl">🍸</div>}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white truncate">{drink.name}</span>
                        {drink.badge && (
                          <span className="text-xs bg-amber-500 text-zinc-950 px-2 py-0.5 rounded-full font-medium">{drink.badge}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-zinc-500">{drink.category}</span>
                        {drink.subtitle && <span className="text-xs text-zinc-600">· {drink.subtitle}</span>}
                      </div>
                    </div>

                    {/* Price */}
                    <span className="text-amber-400 font-semibold text-sm min-w-[60px] text-right">
                      ${Number(drink.price).toFixed(2)}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => toggleAvailable(drink)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${drink.available
                          ? 'bg-green-950 border-green-800 text-green-400 hover:bg-green-900'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500 hover:border-zinc-600'}`}>
                        {drink.available ? 'Live' : 'Hidden'}
                      </button>
                      <button onClick={() => handleEdit(drink)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(drink.id)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-zinc-800 text-zinc-600 hover:border-red-800 hover:text-red-400 transition-colors">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2">Remove this drink?</h3>
            <p className="text-zinc-500 text-sm mb-6">This will permanently delete it from the menu.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 border border-zinc-700 rounded-xl text-sm text-zinc-400 hover:border-zinc-500 transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2 bg-red-900 hover:bg-red-800 border border-red-700 rounded-xl text-sm text-red-200 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}