import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const SUPERADMIN_EMAIL = 'superadmin@mybar.com';

export default function SuperAdminDashboard() {
  const [bars, setBars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);
  const [selectedBar, setSelectedBar] = useState(null);

  useEffect(() => { init(); }, []);

  const init = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.email !== SUPERADMIN_EMAIL) { setUnauthorized(true); setLoading(false); return; }
    fetchBars();
  };

  const fetchBars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('superadmin_overview').select('*');
      if (error) throw error;
      setBars(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login'; };

  if (unauthorized) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-center px-4">
      <div>
        <div className="text-5xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-zinc-500 text-sm mb-6">You don't have permission to view this page.</p>
        <a href="/login" className="text-amber-400 hover:underline text-sm">Back to Login</a>
      </div>
    </div>
  );

  const filtered = bars.filter(b =>
    b.bar_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.owner_email?.toLowerCase().includes(search.toLowerCase()) ||
    b.location?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: bars.length,
    thisWeek: bars.filter(b => new Date(b.joined_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length,
    totalDrinks: bars.reduce((sum, b) => sum + (b.total_drinks || 0), 0),
    activeToday: bars.filter(b => b.last_sign_in_at && new Date(b.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="bg-zinc-950 border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black text-sm">MB</div>
            <div>
              <p className="font-bold text-white text-sm leading-none">MyBar</p>
              <p className="text-xs text-zinc-500 mt-0.5">Super Admin</p>
            </div>
            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium">Platform Overview</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 px-3 py-2 rounded-xl transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bars', value: stats.total, icon: '🏪', color: 'text-zinc-900', bg: 'bg-white' },
            { label: 'Joined This Week', value: stats.thisWeek, icon: '🆕', color: 'text-green-600', bg: 'bg-white' },
            { label: 'Total Drinks Listed', value: stats.totalDrinks, icon: '🍸', color: 'text-amber-600', bg: 'bg-white' },
            { label: 'Active Today', value: stats.activeToday, icon: '🟢', color: 'text-blue-600', bg: 'bg-white' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} border border-gray-200 rounded-2xl p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">{s.label}</span>
                <span className="text-lg">{s.icon}</span>
              </div>
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Search & Table */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-base font-bold text-gray-900">All Registered Bars</h2>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bars..."
                className="bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-400 w-64" />
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <div className="text-4xl mb-3">🏪</div>
              <p>No bars found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Bar Name', 'Owner Email', 'Location', 'Drinks', 'Joined', 'Last Active', 'Menu'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-gray-400 uppercase tracking-widest font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((bar, i) => (
                    <tr key={bar.bar_id} className={`hover:bg-amber-50/30 transition-colors ${i < filtered.length - 1 ? 'border-b border-gray-100' : ''}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-200 flex items-center justify-center text-sm font-bold text-amber-600 flex-shrink-0">
                            {bar.bar_name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{bar.bar_name}</p>
                            <p className="text-xs text-gray-400 font-mono">/{bar.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{bar.owner_email}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{bar.location || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">{bar.live_drinks}</span>
                          <span className="text-xs text-gray-400">/ {bar.total_drinks} total</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {bar.joined_at ? new Date(bar.joined_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-500">
                        {bar.last_sign_in_at ? (
                          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${new Date(bar.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${new Date(bar.last_sign_in_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) ? 'bg-green-500' : 'bg-gray-400'}`} />
                            {new Date(bar.last_sign_in_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <a href={`/menu/${bar.slug}`} target="_blank" rel="noreferrer"
                          className="text-xs text-amber-600 hover:text-amber-500 font-semibold flex items-center gap-1">
                          View
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
            <span className="text-xs text-gray-400">{filtered.length} bars · Last refreshed just now</span>
            <button onClick={fetchBars} className="ml-4 text-xs text-amber-500 hover:underline font-medium">Refresh</button>
          </div>
        </div>
      </div>
    </div>
  );
}