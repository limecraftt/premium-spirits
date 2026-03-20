import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const generateSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');

export default function SignupPage() {
  const [form, setForm] = useState({ barName: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.barName || !form.email || !form.password) return setError('Please fill in all fields.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true);
    try {
      // 1. Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password });
      if (authError) throw authError;
      const userId = authData.user?.id;
      if (!userId) throw new Error('Signup failed. Please try again.');

      // 2. Create bar record
      const slug = generateSlug(form.barName);
      const { error: barError } = await supabase.from('bars').insert([{ owner_id: userId, name: form.barName, slug, email: form.email }]);
      if (barError) throw barError;

      // 3. Auto sign in and go straight to admin
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      if (signInError) throw signInError;

      window.location.href = '/admin';
    } catch (err) { setError(err.message || 'Something went wrong.'); }
    finally { setLoading(false); }
  };

  const EyeIcon = ({ open }) => open
    ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    : <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

  return (
    <div style={{ minHeight: '100vh', background: '#faf9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .syne { font-family: 'Syne', sans-serif; }
        .auth-input { width: 100%; background: #fff; border: 1.5px solid #e5e7eb; border-radius: 12px; padding: 13px 16px; font-size: 14px; color: #1a1535; font-family: 'Inter', sans-serif; outline: none; transition: all 0.2s; }
        .auth-input:focus { border-color: #7c3aed; box-shadow: 0 0 0 3px rgba(124,58,237,0.1); }
        .auth-input::placeholder { color: #9ca3af; }
        .purple-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-weight: 600; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .purple-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.3); }
        .purple-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        .pw-wrap { position: relative; }
        .pw-toggle { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; padding: 0; display: flex; line-height: 1; }
      `}</style>

      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <a href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 14, fontFamily: 'Syne' }}>MB</div>
            <span className="syne" style={{ fontWeight: 700, fontSize: 20, color: '#1a1535' }}>MyBar</span>
          </a>
          <h1 className="syne" style={{ fontSize: 24, fontWeight: 700, color: '#1a1535', marginBottom: 6 }}>Create your bar account</h1>
          <p style={{ color: '#9ca3af', fontSize: 14 }}>Get your digital menu up in minutes — it's free</p>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', border: '1px solid #ede9fe', borderRadius: 24, padding: '28px 24px', boxShadow: '0 4px 24px rgba(124,58,237,0.06)' }}>
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" fill="none" stroke="#ef4444" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Bar Name */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Bar / Club Name *</label>
              <input value={form.barName} onChange={e => set('barName', e.target.value)} placeholder="e.g. The Lounge Nairobi" className="auth-input" />
              {form.barName && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 14, height: 14, background: '#ede9fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="8" height="8" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>Menu URL: <span style={{ color: '#7c3aed' }}>mybar.com/menu/{generateSlug(form.barName)}</span></span>
                </div>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Email Address *</label>
              <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="you@yourbar.com" className="auth-input" />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Password *</label>
              <div className="pw-wrap">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 6 characters" className="auth-input" style={{ paddingRight: 44 }} />
                <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)}><EyeIcon open={showPassword} /></button>
              </div>
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Repeat Password *</label>
              <div className="pw-wrap">
                <input type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder="Repeat your password" className="auth-input" style={{ paddingRight: 44 }} />
                <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)}><EyeIcon open={showConfirm} /></button>
              </div>
              {form.confirm && form.password && (
                <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {form.password === form.confirm
                    ? <><div style={{ width: 14, height: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="8" height="8" fill="none" stroke="#16a34a" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div><span style={{ fontSize: 11, color: '#16a34a' }}>Passwords match</span></>
                    : <><div style={{ width: 14, height: 14, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><svg width="8" height="8" fill="none" stroke="#dc2626" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></div><span style={{ fontSize: 11, color: '#dc2626' }}>Passwords don't match</span></>}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="purple-btn" style={{ width: '100%', padding: '14px', borderRadius: 12, fontSize: 15 }}>
              {loading && <svg className="spin" width="16" height="16" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}/><path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }}/></svg>}
              {loading ? 'Setting up your account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 14, marginTop: 20 }}>
          Already have an account?{' '}
          <a href="/login" style={{ color: '#7c3aed', fontWeight: 600, textDecoration: 'none' }}>Log in</a>
        </p>
      </div>
    </div>
  );
}