import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';

const CATEGORIES = ['Cocktails', 'Mocktails', 'Whiskey', 'Vodka', 'Rum', 'Gin', 'Tequila', 'Cognac', 'Wine', 'Beer', 'Special Offers'];
const BADGES = ['', 'New', 'Bestseller', 'Special Offer', 'Premium', 'Limited'];
const EMPTY_FORM = { name: '', category: 'Whiskey', subtitle: '', price: '', description: '', badge: '', image_url: '', available: true };

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
      ctx.fillStyle = dark ? '#1a1535' : '#fff';
      ctx.fillRect(c2 * cell, r * cell, cell, cell);
    }
  }, [text, size]);
  return React.createElement('canvas', { ref, width: size, height: size, style: { borderRadius: 6 } });
}

export default function AdminDashboard() {
  const [bar, setBar] = useState(null);
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { init(); }, []);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.href = '/login'; return; }
    const { data: barData } = await supabase.from('bars').select('*').eq('owner_id', user.id).single();
    if (!barData) { showToast('Bar profile not found.', 'error'); setLoading(false); return; }
    setBar(barData);
    await fetchDrinks(barData.id);
  };

  const fetchDrinks = async (barId) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('drinks').select('*').eq('bar_id', barId).order('created_at', { ascending: false });
      if (error) throw error;
      setDrinks(data || []);
    } catch { showToast('Could not load drinks.', 'error'); }
    finally { setLoading(false); }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 5 * 1024 * 1024) return showToast('Image must be under 5MB.', 'error');
    setImageFile(file); setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;
    setUploading(true);
    try {
      const ext = imageFile.name.split('.').pop();
      const fileName = `${bar.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from('drink-images').upload(fileName, imageFile, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('drink-images').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) { showToast('Image upload failed: ' + e.message, 'error'); return null; }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return showToast('Name and price are required.', 'error');
    setSaving(true);
    try {
      let image_url = form.image_url;
      if (imageFile) { const u = await uploadImage(); if (!u) { setSaving(false); return; } image_url = u; }
      const payload = { ...form, price: parseFloat(form.price), image_url, bar_id: bar.id };
      if (editingId) {
        const { error } = await supabase.from('drinks').update(payload).eq('id', editingId);
        if (error) throw error; showToast('Drink updated!');
      } else {
        const { error } = await supabase.from('drinks').insert([payload]);
        if (error) throw error; showToast('Drink added!');
      }
      await fetchDrinks(bar.id);
      setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(null);
    } catch (e) { showToast(e.message || 'Something went wrong.', 'error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (drink) => { setForm({ ...drink, price: String(drink.price) }); setEditingId(drink.id); setImagePreview(drink.image_url || null); setImageFile(null); setShowForm(true); };
  const handleDelete = async (id) => {
    try { const { error } = await supabase.from('drinks').delete().eq('id', id); if (error) throw error; setDrinks(p => p.filter(d => d.id !== id)); showToast('Drink removed.'); }
    catch { showToast('Delete failed.', 'error'); } finally { setConfirmDelete(null); }
  };
  const toggleAvailable = async (drink) => {
    try { const { error } = await supabase.from('drinks').update({ available: !drink.available }).eq('id', drink.id); if (error) throw error; setDrinks(p => p.map(d => d.id === drink.id ? { ...d, available: !d.available } : d)); }
    catch { showToast('Update failed.', 'error'); }
  };
  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };

  const filtered = drinks.filter(d => (filterCat === 'All' || d.category === filterCat) && d.name.toLowerCase().includes(search.toLowerCase()));
  const stats = { total: drinks.length, available: drinks.filter(d => d.available).length, hidden: drinks.filter(d => !d.available).length, categories: new Set(drinks.map(d => d.category)).size };
  const menuUrl = bar ? `${window.location.origin}/menu/${bar.slug}` : '';

  return (
    <div style={{ minHeight: '100vh', background: '#faf9ff', fontFamily: "'Inter', system-ui, sans-serif", color: '#1a1535' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .syne { font-family: 'Syne', sans-serif; }
        .admin-input { width: 100%; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 11px 14px; font-size: 14px; color: #1a1535; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; }
        .admin-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.08); }
        .admin-input::placeholder { color: #9ca3af; }
        .purple-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .purple-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,58,237,0.3); }
        .purple-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .outline-purple { border: 1.5px solid #ede9fe; background: #fff; color: #6d28d9; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
        .outline-purple:hover { border-color: #c4b5fd; background: #faf9ff; }
        .cat-pill { border: 1.5px solid #e5e7eb; background: #fff; color: #6b7280; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.2s; white-space: nowrap; }
        .cat-pill:hover { border-color: #c4b5fd; color: #7c3aed; }
        .cat-pill.active { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; border-color: transparent; }
        .stat-card { background: #fff; border: 1px solid #ede9fe; border-radius: 16px; padding: 16px; }
        .drink-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; transition: background 0.15s; }
        .drink-row:hover { background: #faf9ff; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* Stats grid */
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px; }
        @media (max-width: 640px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }

        /* Form grid */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

        /* QR grid */
        .qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        @media (max-width: 480px) { .qr-grid { grid-template-columns: 1fr 1fr; } }

        /* Nav actions - hide text on small screens */
        .nav-preview-text { display: inline; }
        .nav-qr-text { display: inline; }
        @media (max-width: 480px) {
          .nav-preview-text { display: none; }
          .nav-qr-text { display: none; }
        }

        /* Search + Add row */
        .search-add-row { display: flex; gap: 10px; margin-bottom: 14px; }
        .search-add-row .search-wrap { flex: 1; min-width: 0; position: relative; }

        /* Drink row actions — stack on small screen */
        .drink-actions { display: flex; gap: 6px; flex-shrink: 0; }
        @media (max-width: 500px) {
          .drink-row { flex-wrap: wrap; }
          .drink-actions { width: 100%; justify-content: flex-end; }
          .drink-price { min-width: unset !important; }
        }

        /* Menu URL banner */
        .menu-banner { background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 16px; padding: 12px 16px; margin-bottom: 20px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
        .menu-banner-url { font-size: 12px; color: #7c3aed; font-family: monospace; word-break: break-all; }
        @media (max-width: 480px) { .menu-banner-url { display: none; } }

        /* Form bottom row */
        .form-bottom { display: flex; align-items: center; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 1px solid #f3f4f6; flex-wrap: wrap; gap: 12px; }
        .form-actions { display: flex; gap: 10px; }

        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 100, padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, color: toast.type === 'error' ? '#dc2626' : '#16a34a', maxWidth: 'calc(100vw - 32px)' }}>
          {toast.type === 'success' ? <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> : <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>}
          {toast.msg}
        </div>
      )}

      {/* Nav */}
      <nav style={{ background: '#fff', borderBottom: '1px solid #ede9fe', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 1px 8px rgba(124,58,237,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 12, fontFamily: 'Syne', flexShrink: 0 }}>MB</div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 13, color: '#1a1535', margin: 0, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="syne">{bar?.name || 'MyBar'}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0, marginTop: 2 }}>Admin Dashboard</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {bar && (
              <a href={menuUrl} target="_blank" rel="noreferrer" className="outline-purple" style={{ padding: '7px 12px', borderRadius: 10, fontSize: 12 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                <span className="nav-preview-text">Preview</span>
              </a>
            )}
            <button onClick={() => setActiveTab(activeTab === 'qr' ? 'drinks' : 'qr')} className="purple-btn" style={{ padding: '7px 12px', borderRadius: 10, fontSize: 12 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 3.5A2.5 2.5 0 0119 13a2.5 2.5 0 01-2.5 2.5A2.5 2.5 0 0114 13a2.5 2.5 0 012.5-2.5zM9 3.5A2.5 2.5 0 016.5 6 2.5 2.5 0 014 3.5 2.5 2.5 0 016.5 1 2.5 2.5 0 019 3.5zM9 20.5A2.5 2.5 0 016.5 23 2.5 2.5 0 014 20.5a2.5 2.5 0 012.5-2.5 2.5 2.5 0 012.5 2.5z" /></svg>
              <span className="nav-qr-text">{activeTab === 'qr' ? 'Drinks' : 'QR'}</span>
            </button>
            <button onClick={handleLogout}
              style={{ padding: '7px 12px', borderRadius: 10, fontSize: 12, background: 'none', border: '1.5px solid #e5e7eb', color: '#9ca3af', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}
              onMouseOver={e => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#dc2626'; }}
              onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px 40px' }}>

        {/* Menu URL Banner */}
        {bar && (
          <div className="menu-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <div style={{ width: 26, height: 26, background: '#ede9fe', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="13" height="13" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <span style={{ fontSize: 13, color: '#6d28d9', fontWeight: 500, flexShrink: 0 }}>Your menu:</span>
              <span className="menu-banner-url">{menuUrl}</span>
            </div>
            <a href={menuUrl} target="_blank" rel="noreferrer" className="purple-btn" style={{ padding: '6px 14px', borderRadius: 8, fontSize: 12 }}>Open Menu</a>
          </div>
        )}

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label: 'Total', value: stats.total, icon: '🍸', color: '#1a1535' },
            { label: 'Live', value: stats.available, icon: '✅', color: '#16a34a' },
            { label: 'Hidden', value: stats.hidden, icon: '🔒', color: '#9ca3af' },
            { label: 'Categories', value: stats.categories, icon: '📂', color: '#7c3aed' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1.5, fontWeight: 600 }}>{s.label}</span>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color, lineHeight: 1 }} className="syne">{s.value}</div>
            </div>
          ))}
        </div>

        {/* QR Tab */}
        {activeTab === 'qr' && bar && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <h2 className="syne" style={{ fontSize: 20, fontWeight: 700, color: '#1a1535', marginBottom: 4 }}>Your QR Codes</h2>
              <p style={{ color: '#9ca3af', fontSize: 13 }}>Print and place on tables for customers to scan</p>
            </div>
            <div className="qr-grid">
              <div style={{ background: '#fff', border: '2px solid #7c3aed', borderRadius: 20, padding: 20, textAlign: 'center', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' }}>
                <div style={{ fontSize: 10, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>Full Menu</div>
                <div style={{ background: '#fff', borderRadius: 10, padding: 8, display: 'inline-block', marginBottom: 12, border: '1px solid #ede9fe' }}>
                  <QRDisplay text={menuUrl} size={130} />
                </div>
                <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>{stats.available} drinks</p>
                <p style={{ fontSize: 9, color: '#c4b5fd', fontFamily: 'monospace', wordBreak: 'break-all' }}>{menuUrl}</p>
              </div>
              {[...new Set(drinks.map(d => d.category))].map(cat => (
                <div key={cat} style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 20, padding: 16, textAlign: 'center', transition: 'border-color 0.2s' }}
                  onMouseOver={e => e.currentTarget.style.borderColor = '#c4b5fd'} onMouseOut={e => e.currentTarget.style.borderColor = '#ede9fe'}>
                  <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, fontWeight: 600, marginBottom: 10 }}>{cat}</div>
                  <div style={{ background: '#fff', borderRadius: 8, padding: 6, display: 'inline-block', marginBottom: 8, border: '1px solid #ede9fe' }}>
                    <QRDisplay text={`${menuUrl}?cat=${encodeURIComponent(cat)}`} size={90} />
                  </div>
                  <p style={{ fontSize: 11, color: '#9ca3af' }}>{drinks.filter(d => d.category === cat && d.available).length} drinks</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Drinks Tab */}
        {activeTab === 'drinks' && (
          <>
            <div className="search-add-row">
              <div className="search-wrap">
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="15" height="15" fill="none" stroke="#9ca3af" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drinks..." className="admin-input" style={{ paddingLeft: 38 }} />
              </div>
              <button onClick={() => { setForm(EMPTY_FORM); setEditingId(null); setImagePreview(null); setImageFile(null); setShowForm(true); }} className="purple-btn" style={{ padding: '10px 16px', borderRadius: 12, fontSize: 13, whiteSpace: 'nowrap', flexShrink: 0 }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add Drink
              </button>
            </div>

            {/* Category Pills */}
            <div className="scrollbar-hide" style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
              {['All', ...CATEGORIES].filter(c => c === 'All' || drinks.some(d => d.category === c)).map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)} className={`cat-pill ${filterCat === cat ? 'active' : ''}`} style={{ padding: '5px 12px', borderRadius: 999, flexShrink: 0 }}>
                  {cat}{cat !== 'All' && <span style={{ marginLeft: 4, opacity: 0.65 }}>{drinks.filter(d => d.category === cat).length}</span>}
                </button>
              ))}
            </div>

            {/* Form */}
            {showForm && (
              <div style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 20, padding: '20px 16px', marginBottom: 16, boxShadow: '0 4px 20px rgba(124,58,237,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 className="syne" style={{ fontSize: 16, fontWeight: 700, color: '#1a1535', margin: 0 }}>{editingId ? 'Edit Drink' : 'Add New Drink'}</h3>
                  <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImagePreview(null); setImageFile(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>

                {/* Image Upload */}
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Drink Photo</label>
                  <div onClick={() => fileInputRef.current?.click()}
                    style={{ border: `2px dashed ${imagePreview ? '#c4b5fd' : '#e5e7eb'}`, borderRadius: 16, cursor: 'pointer', overflow: 'hidden', height: imagePreview ? 200 : 110, background: imagePreview ? 'transparent' : '#faf9ff', transition: 'all 0.2s', position: 'relative' }}
                    onMouseOver={e => { if (!imagePreview) e.currentTarget.style.borderColor = '#c4b5fd'; }}
                    onMouseOut={e => { if (!imagePreview) e.currentTarget.style.borderColor = '#e5e7eb'; }}>
                    {imagePreview ? (
                      <>
                        <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                          onMouseOver={e => e.currentTarget.style.opacity = 1} onMouseOut={e => e.currentTarget.style.opacity = 0}>
                          <span style={{ color: '#fff', fontSize: 13, fontWeight: 600, background: 'rgba(0,0,0,0.5)', padding: '8px 20px', borderRadius: 999 }}>Change Photo</span>
                        </div>
                      </>
                    ) : (
                      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, color: '#9ca3af' }}>
                        <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#6b7280' }}>Click to upload a photo</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>JPG, PNG, WEBP · Max 5MB</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(null); setImageFile(null); setForm(f => ({ ...f, image_url: '' })); }}
                      style={{ marginTop: 8, fontSize: 12, color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      Remove photo
                    </button>
                  )}
                </div>

                <div className="form-grid">
                  {[{ label: 'Name *', key: 'name', placeholder: 'e.g. Passion Fruit Mojito' }, { label: 'Subtitle', key: 'subtitle', placeholder: 'e.g. House Cocktail' }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>{f.label}</label>
                      <input value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.placeholder} className="admin-input" />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Category *</label>
                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="admin-input">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Price (KES) *</label>
                    <input type="number" step="0.01" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className="admin-input" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Badge</label>
                    <select value={form.badge} onChange={e => setForm(p => ({ ...p, badge: e.target.value }))} className="admin-input">
                      {BADGES.map(b => <option key={b} value={b}>{b || 'None'}</option>)}
                    </select>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Description</label>
                    <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Tasting notes, ingredients..." className="admin-input" style={{ resize: 'none', lineHeight: 1.6 }} />
                  </div>
                </div>

                <div className="form-bottom">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', userSelect: 'none' }}>
                    <div onClick={() => setForm(p => ({ ...p, available: !p.available }))}
                      style={{ width: 44, height: 24, borderRadius: 999, background: form.available ? '#7c3aed' : '#e5e7eb', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}>
                      <div style={{ width: 18, height: 18, background: '#fff', borderRadius: '50%', position: 'absolute', top: 3, left: form.available ? 23 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                    </div>
                    <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>{form.available ? 'Live on menu' : 'Hidden'}</span>
                  </label>
                  <div className="form-actions">
                    <button onClick={() => { setShowForm(false); setEditingId(null); setForm(EMPTY_FORM); setImagePreview(null); setImageFile(null); }}
                      style={{ padding: '9px 16px', fontSize: 13, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, color: '#6b7280', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}>
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || uploading} className="purple-btn" style={{ padding: '9px 20px', borderRadius: 10, fontSize: 13 }}>
                      {(saving || uploading) && <svg className="spin" width="14" height="14" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}/></svg>}
                      {uploading ? 'Uploading...' : saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add to Menu'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Drinks List */}
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[...Array(4)].map((_, i) => <div key={i} className="pulse" style={{ height: 72, background: '#fff', borderRadius: 16, border: '1px solid #ede9fe' }} />)}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🍸</div>
                <p style={{ color: '#9ca3af', fontWeight: 500, fontSize: 15 }}>No drinks yet</p>
                <button onClick={() => setShowForm(true)} style={{ marginTop: 12, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'Inter' }}>Add your first drink →</button>
              </div>
            ) : (
              <div style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 20, overflow: 'hidden', boxShadow: '0 2px 12px rgba(124,58,237,0.04)' }}>
                <div style={{ padding: '10px 16px', borderBottom: '1px solid #f3f4f6', background: '#faf9ff' }}>
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>{filtered.length} drinks</span>
                </div>
                {filtered.map((drink, i) => (
                  <div key={drink.id} className="drink-row" style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f5f3ff', overflow: 'hidden', flexShrink: 0, border: '1px solid #ede9fe' }}>
                      {drink.image_url ? <img src={drink.image_url} alt={drink.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🍸</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1535' }}>{drink.name}</span>
                        {drink.badge && <span style={{ fontSize: 10, background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ede9fe', padding: '1px 7px', borderRadius: 999, fontWeight: 600 }}>{drink.badge}</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{drink.category}</span>
                        {drink.subtitle && <><span style={{ color: '#e5e7eb' }}>·</span><span style={{ fontSize: 11, color: '#9ca3af' }}>{drink.subtitle}</span></>}
                      </div>
                    </div>
                    <span className="drink-price" style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed', minWidth: 72, textAlign: 'right', flexShrink: 0 }}>KES {Number(drink.price).toLocaleString()}</span>
                    <div className="drink-actions">
                      <button onClick={() => toggleAvailable(drink)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', border: 'none', fontFamily: 'Inter', background: drink.available ? '#f0fdf4' : '#f9fafb', color: drink.available ? '#16a34a' : '#9ca3af' }}>
                        {drink.available ? 'Live' : 'Off'}
                      </button>
                      <button onClick={() => handleEdit(drink)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', background: '#fff', border: '1.5px solid #e5e7eb', color: '#6b7280', fontFamily: 'Inter' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#c4b5fd'; e.currentTarget.style.color = '#7c3aed'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#6b7280'; }}>
                        Edit
                      </button>
                      <button onClick={() => setConfirmDelete(drink.id)}
                        style={{ fontSize: 11, padding: '4px 10px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', background: '#fff', border: '1.5px solid #e5e7eb', color: '#9ca3af', fontFamily: 'Inter' }}
                        onMouseOver={e => { e.currentTarget.style.borderColor = '#fecaca'; e.currentTarget.style.color = '#ef4444'; }}
                        onMouseOut={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#9ca3af'; }}>
                        Del
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Modal */}
      {confirmDelete && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,21,53,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, backdropFilter: 'blur(4px)' }}
          onClick={() => setConfirmDelete(null)}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, maxWidth: 340, width: '100%', boxShadow: '0 20px 60px rgba(124,58,237,0.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="22" height="22" fill="none" stroke="#ef4444" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </div>
            <h3 className="syne" style={{ fontSize: 17, fontWeight: 700, color: '#1a1535', textAlign: 'center', marginBottom: 8 }}>Remove this drink?</h3>
            <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>This will permanently delete it from your menu.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 13, color: '#6b7280', background: '#fff', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}>Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} style={{ flex: 1, padding: '11px', border: 'none', borderRadius: 10, fontSize: 13, color: '#fff', background: '#ef4444', cursor: 'pointer', fontFamily: 'Inter', fontWeight: 600 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}