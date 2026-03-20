import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const SUPERADMIN_EMAIL = 'superadmin@mybar.com';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.email || !form.password) return setError('Please enter your email and password.');
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (authError) throw authError;
      window.location.href = data.user?.email === SUPERADMIN_EMAIL ? '/superadmin' : '/admin';
    } catch (err) { setError(err.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black text-sm">MB</div>
            <span className="font-bold text-xl text-white">MyBar</span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-zinc-500 text-sm">Sign in to manage your drinks menu</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-1.5">Email Address</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@yourbar.com" autoComplete="email"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium">Password</label>
              </div>
              <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Your password" autoComplete="current-password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 transition-all" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-zinc-500 text-sm mt-6">Don't have an account? <a href="/signup" className="text-amber-400 hover:text-amber-300 font-medium">Sign up free</a></p>
      </div>
    </div>
  );
}