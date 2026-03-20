import React, { useState, useEffect, useRef } from 'react';

function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function FadeIn({ children, delay = 0 }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(28px)', transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const FEATURES = [
  { icon: '📱', title: 'Instant QR Menus', desc: 'Each bar gets a unique QR code. Customers scan and see a live, beautiful menu — no app needed.' },
  { icon: '⚡', title: 'Real-time Updates', desc: 'Add, edit or remove drinks instantly. Your menu updates live the moment you save.' },
  { icon: '🏪', title: 'Your Own Brand', desc: 'Every bar gets a personalized menu page at mybar.com/menu/your-bar-name.' },
  { icon: '📊', title: 'Smart Dashboard', desc: 'Manage your entire drinks menu from one clean admin panel — no tech skills needed.' },
  { icon: '🔒', title: 'Secure & Private', desc: 'Each bar only sees their own data. Your menu, your drinks, your customers.' },
  { icon: '🌍', title: 'Works Everywhere', desc: 'Desktop, tablet, mobile — your menu looks stunning on any device, anywhere.' },
];

const STEPS = [
  { num: '01', title: 'Sign Up', desc: 'Create your bar account in under 2 minutes. No credit card required.' },
  { num: '02', title: 'Add Your Drinks', desc: 'Upload photos, set prices, add categories. Your menu comes alive instantly.' },
  { num: '03', title: 'Get Your QR Code', desc: 'Download your unique QR code and place it on tables, walls, or receipts.' },
  { num: '04', title: 'Customers Scan', desc: 'Guests scan the QR, browse your menu, and know exactly what you offer.' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); setMobileOpen(false); };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .hero-grad { background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .amber-btn { background: linear-gradient(135deg, #f59e0b, #d97706); color: #000; font-weight: 600; transition: all 0.3s; display: inline-block; }
        .amber-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(245,158,11,0.35); }
        .outline-btn { border: 1px solid rgba(245,158,11,0.4); color: #f59e0b; background: transparent; transition: all 0.3s; display: inline-block; }
        .outline-btn:hover { background: rgba(245,158,11,0.08); transform: translateY(-2px); }
        .feature-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); transition: all 0.4s; }
        .feature-card:hover { background: rgba(245,158,11,0.04); border-color: rgba(245,158,11,0.2); transform: translateY(-4px); }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp 0.9s ease forwards; }
      `}</style>

      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-sm">MB</div>
            <span className="syne font-bold text-lg text-white">MyBar</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'How it Works', 'Contact'].map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))} className="text-zinc-400 hover:text-white text-sm transition-colors">{l}</button>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            <a href="/login" className="outline-btn text-sm px-4 py-2 rounded-xl">Log In</a>
            <a href="/signup" className="amber-btn text-sm px-5 py-2 rounded-xl">Get Started Free</a>
          </div>
          <button className="md:hidden text-zinc-400" onClick={() => setMobileOpen(!mobileOpen)}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-zinc-900 border-t border-zinc-800 px-6 py-4 flex flex-col gap-4">
            {['Features', 'How it Works', 'Contact'].map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))} className="text-zinc-300 text-sm text-left">{l}</button>
            ))}
            <a href="/login" className="outline-btn text-sm px-4 py-2.5 rounded-xl text-center">Log In</a>
            <a href="/signup" className="amber-btn text-sm px-4 py-2.5 rounded-xl text-center">Get Started Free</a>
          </div>
        )}
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.12) 0%, transparent 60%)' }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(rgba(245,158,11,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-8">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-amber-400 text-xs font-medium tracking-wide">Now available for bars & clubs across Kenya</span>
            </div>
          </div>
          <div className="fade-up" style={{ animationDelay: '0.3s' }}>
            <h1 className="syne text-5xl sm:text-7xl font-extrabold leading-none mb-6">
              <span className="block text-white">Digital Menus for</span>
              <span className="block hero-grad">Every Bar & Club</span>
            </h1>
          </div>
          <div className="fade-up" style={{ animationDelay: '0.5s' }}>
            <p className="text-zinc-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Give your customers a stunning QR-powered drinks menu. Update it in real time from your phone. No app, no printing, no hassle.
            </p>
          </div>
          <div className="fade-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.7s' }}>
            <a href="/signup" className="amber-btn text-base px-8 py-4 rounded-2xl inline-flex items-center gap-2 justify-center">
              Start for Free
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <button onClick={() => scrollTo('how-it-works')} className="outline-btn text-base px-8 py-4 rounded-2xl">See How It Works</button>
          </div>
          <div className="fade-up mt-12 flex items-center justify-center gap-6 text-zinc-500 text-sm flex-wrap" style={{ animationDelay: '0.9s' }}>
            {['No credit card required', 'Setup in 2 minutes', 'Free to start'].map(t => (
              <div key={t} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-zinc-800/50 bg-zinc-900/30 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
          {[{ n: '500+', l: 'Bars Onboarded' }, { n: '50K+', l: 'Menu Scans Daily' }, { n: '2 min', l: 'Average Setup Time' }].map((s, i) => (
            <FadeIn key={s.l} delay={i * 0.1}>
              <div>
                <div className="syne text-4xl font-extrabold text-amber-400 mb-1">{s.n}</div>
                <div className="text-zinc-500 text-sm">{s.l}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="features" className="py-24 px-6 max-w-6xl mx-auto">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-4">Everything You Need</div>
            <h2 className="syne text-4xl md:text-5xl font-bold text-white mb-4">Built for <span className="hero-grad">bars & clubs</span></h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Everything you need to run a modern digital menu — in one simple platform.</p>
          </div>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="feature-card rounded-2xl p-6">
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="syne text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="py-24 px-6 bg-zinc-900/30 border-y border-zinc-800/50">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <div className="text-amber-500 text-sm font-medium tracking-widest uppercase mb-4">Simple Process</div>
              <h2 className="syne text-4xl md:text-5xl font-bold text-white">Up and running in <span className="hero-grad">minutes</span></h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.12}>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                    <span className="syne text-amber-400 font-bold text-sm">{s.num}</span>
                  </div>
                  <h3 className="syne text-lg font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(ellipse at 50% 50%, rgba(245,158,11,0.08) 0%, transparent 70%)' }} />
        <FadeIn>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="syne text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to modernize<br />your <span className="hero-grad">bar's menu?</span></h2>
            <p className="text-zinc-400 text-lg mb-10">Join hundreds of bars already using MyBar to delight their customers.</p>
            <a href="/signup" className="amber-btn text-lg px-10 py-4 rounded-2xl inline-flex items-center gap-3">
              Create Your Free Account
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </FadeIn>
      </section>

      <section id="contact" className="py-16 px-6 border-t border-zinc-800/50">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <h2 className="syne text-3xl font-bold text-white mb-3">Get in Touch</h2>
            <p className="text-zinc-500 mb-8">Have questions? We'd love to hear from you.</p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a href="mailto:hello@mybar.co.ke" className="flex items-center gap-3 text-zinc-400 hover:text-amber-400 transition-colors justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                hello@mybar.co.ke
              </a>
              <a href="tel:+254700000000" className="flex items-center gap-3 text-zinc-400 hover:text-amber-400 transition-colors justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                +254 700 000 000
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      <footer className="border-t border-zinc-800/50 py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-black text-xs">MB</div>
            <span className="syne font-bold text-white">MyBar</span>
          </div>
          <p className="text-zinc-600 text-sm">© 2024 MyBar · Built for bars across Kenya</p>
          <div className="flex gap-6">
            <a href="/login" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Login</a>
            <a href="/signup" className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">Sign Up</a>
          </div>
        </div>
      </footer>
    </div>
  );
}