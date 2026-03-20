import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['Cocktails', 'Mocktails', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Cognac', 'Wine', 'Beer', 'Special Offers'];
const BADGES = ['', 'New', 'Bestseller', 'Special Offer', 'Premium', 'Limited'];

const EMPTY_FORM = {
  name: '', category: 'Whiskey', subtitle: '', price: '',
  description: '', badge: '', image_url: '', available: true,
};

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
      ctx.fillStyle = dark ? '#1a1a2e' : '#fff';
      ctx.fillRect(c2 * cell, r * cell, cell, cell);
    }
  }, [text, size]);
  return <canvas ref={ref} width={size} height={size} style={{ borderRadius: 6 }} />;
}

export default function AdminDashboard() {
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filterCat, setFilterCat] = useState('All');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('drinks');
  const fileInputRef = useRef(null);

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
    } catch {
      showToast('Could not load drinks. Check Supabase connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB.', 'error');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;
    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('drink-images')
        .upload(fileName, imageFile, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from('drink-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      showToast('Image upload failed: ' + e.message, 'error');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return showToast('Name and price are required.', 'error');
    setSaving(true);
    try {
      let image_url = form.image_url;
      if (imageFile) {
        const uploaded = await uploadImage();
        if (!uploaded) { setSaving(false); return; }
        image_url = uploaded;
      }
      const payload = { ...form, price: parseFloat(form.price), image_url };
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
      setImageFile(null);
      setImagePreview(null);
    } catch (e) {
      showToast(e.message || 'Something went wrong.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (drink) => {
    setForm({ ...drink, price: String(drink.price) });
    setEditingId(drink.id);
    setImagePreview(drink.image_url || null);
    setImageFile(null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase.from('drinks').delete().eq('id', id);
      if (error) throw error;
      setDrinks(prev => prev.filter(d => d.id !== id));
      showToast('Drink removed.');
    } catch {
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
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2
          ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'}`}>
          {toast.type === 'success'
            ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-white text-sm">PS</div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-none">Premium Spirits</p>
              <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="/menu" target="_blank" rel="noreferrer"
              className="text-sm text-gray-600 hover:text-amber-600 border border-gray-200 hover:border-amber-300 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Preview Menu
            </a>
            <button onClick={() => setActiveTab(activeTab === 'qr' ? 'drinks' : 'qr')}
              className="text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5A2.5 2.5 0 0119 13a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 0114 13a2.5 2.5 0 012.5-2.5zM9 3.5A2.5 2.5 0 016.5 6 2.5 2.5 0 014 3.5 2.5 2.5 0 016.5 1 2.5 2.5 0 019 3.5zM9 20.5A2.5 2.5 0 016.5 23 2.5 2.5 0 014 20.5a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5z" /></svg>
              {activeTab === 'qr' ? 'Back to Drinks' : 'QR Codes'}
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Drinks', value: stats.total, icon: '🍸', color: 'text-gray-800' },
            { label: 'Live on Menu', value: stats.available, icon: '✅', color: 'text-green-600' },
            { label: 'Hidden', value: stats.hidden, icon: '🔒', color: 'text-gray-400' },
            { label: 'Categories', value: stats.categories, icon: '📂', color: 'text-amber-500' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{s.label}</span>
                <span className="text-lg">{s.icon}</span>
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* QR Tab */}
        {activeTab === 'qr' && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">QR Codes</h2>
              <p className="text-gray-500 text-sm mt-1">Print and place on tables for customers to scan</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-amber-400 rounded-2xl p-6 text-center shadow-sm">
                <div className="text-xs text-amber-600 uppercase tracking-widest font-semibold mb-3">Full Menu</div>
                <div className="bg-white rounded-xl p-3 inline-block mb-4 border border-gray-100 shadow-sm">
                  <QRDisplay text={`${window.location.origin}/menu`} size={160} />
                </div>
                <p className="text-gray-500 text-xs mb-1">All {stats.available} available drinks</p>
                <p className="text-gray-400 text-xs font-mono">{window.location.origin}/menu</p>
              </div>
              {[...new Set(drinks.map(d => d.category))].map(cat => (
                <div key={cat} className="bg-white border border-gray-200 rounded-2xl p-5 text-center shadow-sm hover:border-amber-300 transition-colors">
                  <div className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-3">{cat}</div>
                  <div className="bg-white rounded-xl p-2 inline-block mb-3 border border-gray-100">
                    <QRDisplay text={`${window.location.origin}/menu?cat=${encodeURIComponent(cat)}`} size={100} />
                  </div>
                  <p className="text-gray-400 text-xs">{drinks.filter(d => d.category === cat && d.available).length} drinks</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drinks Tab */}
        {activeTab === 'drinks' && (
          <>
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search drinks..."
                  className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
              </div>
              <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setImagePreview(null); setImageFile(null); setShowForm(true); }}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Drink
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
              {['All', ...CATEGORIES].filter(c => c === 'All' || drinks.some(d => d.category === c)).map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${filterCat === cat ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:border-amber-300 hover:text-amber-600'}`}>
                  {cat}
                  {cat !== 'All' && <span className="ml-1.5 opacity-70">{drinks.filter(d => d.category === cat).length}</span>}
                </button>
              ))}
            </div>

            {/* Add / Edit Form */}
            {showForm && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-base font-bold text-gray-900">{editingId ? 'Edit Drink' : 'Add New Drink'}</h3>
                  <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImagePreview(null); setImageFile(null); }}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Image Upload */}
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-2">Drink Photo</label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-2xl cursor-pointer transition-all overflow-hidden
                        ${imagePreview ? 'border-amber-300' : 'border-gray-200 bg-gray-50 hover:border-amber-300 hover:bg-amber-50'}`}
                      style={{ height: imagePreview ? 220 : 130 }}>
                      {imagePreview ? (
                        <>
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="text-white text-sm font-semibold bg-black/50 px-4 py-2 rounded-full">Change Photo</span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center gap-2 text-gray-400">
                          <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm font-semibold text-gray-500">Click to upload a photo</span>
                          <span className="text-xs text-gray-400">JPG, PNG, WEBP · Max 5MB</span>
                        </div>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    {imagePreview && (
                      <button onClick={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: '' })); }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Remove photo
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Passion Fruit Mojito"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Subtitle / Type</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))}
                      placeholder="e.g. Single Malt Scotch Whisky"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Category *</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Price (KES) *</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0.00"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Badge</label>
                    <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all">
                      {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs text-gray-500 uppercase tracking-widest font-medium block mb-1.5">Description</label>
                    <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={3} placeholder="Tasting notes, ingredients, serving suggestions..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all resize-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <div onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${form.available ? 'bg-green-500' : 'bg-gray-300'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                    <span className="text-sm text-gray-600 font-medium">{form.available ? 'Live on menu' : 'Hidden from menu'}</span>
                  </label>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImagePreview(null); setImageFile(null); }}
                      className="px-4 py-2.5 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || uploading}
                      className="px-6 py-2.5 text-sm bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                      {(saving || uploading) && (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {uploading ? 'Uploading photo...' : saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Menu'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Drinks List */}
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-white rounded-2xl animate-pulse border border-gray-100" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">🍸</div>
                <p className="text-gray-400 font-medium">No drinks yet</p>
                <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }}
                  className="mt-4 text-amber-500 text-sm hover:underline font-semibold">Add your first drink →</button>
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest">{filtered.length} drinks</span>
                </div>
                {filtered.map((drink, i) => (
                  <div key={drink.id} className={`px-5 py-4 flex items-center gap-4 hover:bg-amber-50/40 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                      {drink.image_url
                        ? <img src={drink.image_url} alt={drink.name} className="w-full h-full object-cover" />
                        : <div className="w-full h-full flex items-center justify-center text-2xl">🍸</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900">{drink.name}</span>
                        {drink.badge && (
                          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">{drink.badge}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 font-medium">{drink.category}</span>
                        {drink.subtitle && <span className="text-xs text-gray-400">· {drink.subtitle}</span>}
                      </div>
                    </div>
                    <span className="text-amber-600 font-bold text-sm min-w-[80px] text-right">
                      KES {Number(drink.price).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => toggleAvailable(drink)}
                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors
                          ${drink.available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                        {drink.available ? 'Live' : 'Hidden'}
                      </button>
                      <button onClick={() => handleEdit(drink)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-amber-300 hover:text-amber-600 font-semibold transition-colors">
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(drink.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500 font-semibold transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1">Remove this drink?</h3>
            <p className="text-gray-500 text-sm text-center mb-6">This will permanently delete it from the menu.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-semibold transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-sm text-white font-semibold transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}