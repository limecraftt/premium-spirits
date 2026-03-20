import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function SignupPage() {
  const [form, setForm] = useState({ barName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.barName || !form.email || !form.password) return setError('Please fill in all fields.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Signup failed. Please try again.');
      const slug = generateSlug(form.barName);
      const { error: barError } = await supabase.from('bars').insert([{ owner_id: userId, name: form.barName, slug, email: form.email }]);
      if (barError) throw barError;
      setSuccess(true);
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  if (success) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Account Created!</h2>
        <p className="text-zinc-400 mb-2">Check your email to confirm your account.</p>
        <p className="text-zinc-500 text-sm mb-8">Once confirmed, log in and start adding your drinks menu.</p>
        <a href="/login" className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-semibold px-8 py-3 rounded-xl transition-colors">Go to Login</a>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center font-bold text-black text-sm">MB</div>
            <span className="font-bold text-xl text-white">MyBar</span>
          </a>
          <h1 className="text-2xl font-bold text-white mb-2">Create your bar account</h1>
          <p className="text-zinc-500 text-sm">Get your digital menu up in minutes — it's free</p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-1.5">Bar / Club Name *</label>
              <input
                value={form.barName}
                onChange={e => set('barName', e.target.value)}
                placeholder="e.g. The Lounge Nairobi"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
              {form.barName && (
                <p className="text-xs text-zinc-600 mt-1.5">
                  Your menu: <span className="text-amber-500/70">mybar.com/menu/{generateSlug(form.barName)}</span>
                </p>
              )}
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-1.5">Email Address *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                placeholder="you@yourbar.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-1.5">Password *</label>
              <input
                type="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-widest font-medium block mb-1.5">Repeat Password *</label>
              <input
                type="password"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                placeholder="Repeat your password"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {loading && <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-zinc-500 text-sm mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">Log in</a>
        </p>
      </div>
    </div>
  );
}