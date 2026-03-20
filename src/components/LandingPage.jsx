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

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#faf9ff', color: '#1a1535', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .syne { font-family: 'Syne', sans-serif; }
        .purple-grad { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #5b21b6 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .purple-btn { background: linear-gradient(135deg, #7c3aed, #6d28d9); color: #fff; font-weight: 600; transition: all 0.3s; display: inline-flex; align-items: center; text-decoration: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; }
        .purple-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(124,58,237,0.35); }
        .outline-btn { border: 1.5px solid #7c3aed; color: #7c3aed; background: transparent; transition: all 0.3s; display: inline-flex; align-items: center; justify-content: center; text-decoration: none; cursor: pointer; font-family: 'Inter', sans-serif; font-weight: 600; }
        .outline-btn:hover { background: rgba(124,58,237,0.06); transform: translateY(-2px); }
        .feature-card { background: #fff; border: 1px solid #ede9fe; transition: all 0.4s; border-radius: 20px; }
        .feature-card:hover { border-color: #c4b5fd; transform: translateY(-4px); box-shadow: 0 12px 40px rgba(124,58,237,0.08); }
        .nav-link { color: #6b7280; font-size: 14px; background: none; border: none; cursor: pointer; font-family: 'Inter', sans-serif; transition: color 0.2s; padding: 0; }
        .nav-link:hover { color: #7c3aed; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { opacity: 0; animation: fadeUp 0.9s ease forwards; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #faf9ff; }
        ::-webkit-scrollbar-thumb { background: #c4b5fd; border-radius: 2px; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .hero-btns {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .hero-checks {
          display: flex;
          gap: 24px;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 40px;
        }
        .nav-links-desktop { display: flex; gap: 36px; align-items: center; }
        .nav-cta-desktop { display: flex; gap: 12px; align-items: center; }
        .nav-mobile-btn { display: none; background: none; border: none; cursor: pointer; padding: 4px; }
        .mobile-menu { display: none; }

        @media (max-width: 768px) {
          .nav-links-desktop { display: none; }
          .nav-cta-desktop { display: none; }
          .nav-mobile-btn { display: block; }
          .mobile-menu { display: flex; flex-direction: column; gap: 16px; background: #fff; border-top: 1px solid #ede9fe; padding: 20px 24px; position: fixed; top: 64px; left: 0; right: 0; z-index: 49; box-shadow: 0 8px 24px rgba(124,58,237,0.08); }
          .mobile-menu.closed { display: none; }
          .features-grid { grid-template-columns: 1fr; }
          .steps-grid { grid-template-columns: 1fr 1fr; }
          .hero-btns { flex-direction: column; align-items: center; }
          .hero-btns a, .hero-btns button { width: 100%; max-width: 320px; justify-content: center; }
          .hero-checks { gap: 12px; flex-direction: column; align-items: center; }
          .contact-row { flex-direction: column; align-items: center; gap: 20px !important; }
          .footer-inner { flex-direction: column; align-items: center; text-align: center; gap: 16px !important; }
        }

        @media (max-width: 480px) {
          .steps-grid { grid-template-columns: 1fr; }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          .features-grid { grid-template-columns: repeat(2, 1fr); }
          .steps-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: scrolled ? 'rgba(250,249,255,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #ede9fe' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.4s',
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 13, fontFamily: 'Syne', flexShrink: 0 }}>MB</div>
          <span className="syne" style={{ fontWeight: 700, fontSize: 18, color: '#1a1535' }}>MyBar</span>
        </a>

        <div className="nav-links-desktop">
          {['Features', 'How it Works', 'Contact'].map(l => (
            <button key={l} className="nav-link" onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}>{l}</button>
          ))}
        </div>

        <div className="nav-cta-desktop">
          <a href="/login" className="outline-btn" style={{ padding: '9px 20px', borderRadius: 12, fontSize: 14 }}>Log In</a>
          <a href="/signup" className="purple-btn" style={{ padding: '10px 22px', borderRadius: 12, fontSize: 14 }}>Get Started Free</a>
        </div>

        <button className="nav-mobile-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          <svg width="24" height="24" fill="none" stroke="#1a1535" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </nav>

      {/* MOBILE MENU */}
      <div className={`mobile-menu ${mobileOpen ? '' : 'closed'}`}>
        {['Features', 'How it Works', 'Contact'].map(l => (
          <button key={l} className="nav-link" style={{ fontSize: 15, textAlign: 'left', padding: '4px 0' }} onClick={() => scrollTo(l.toLowerCase().replace(/ /g, '-'))}>{l}</button>
        ))}
        <div style={{ borderTop: '1px solid #ede9fe', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <a href="/login" className="outline-btn" style={{ padding: '12px', borderRadius: 12, fontSize: 14, justifyContent: 'center' }}>Log In</a>
          <a href="/signup" className="purple-btn" style={{ padding: '12px', borderRadius: 12, fontSize: 14, justifyContent: 'center' }}>Get Started Free</a>
        </div>
      </div>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', paddingTop: 80 }}>
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: 'min(600px, 80vw)', height: 'min(600px, 80vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '5%', left: '-10%', width: 'min(500px, 70vw)', height: 'min(500px, 70vw)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(109,40,217,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #c4b5fd 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.25, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 860, width: '100%', padding: '0 24px', textAlign: 'center' }}>
          <div className="fade-up" style={{ animationDelay: '0.1s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#ede9fe', border: '1px solid #c4b5fd', borderRadius: 999, padding: '6px 16px', marginBottom: 28 }}>
              <div style={{ width: 7, height: 7, background: '#7c3aed', borderRadius: '50%' }} />
              <span style={{ color: '#6d28d9', fontSize: 12, fontWeight: 500 }}>Now available for bars & clubs across Kenya</span>
            </div>
          </div>

          <div className="fade-up" style={{ animationDelay: '0.3s' }}>
            <h1 className="syne" style={{ fontSize: 'clamp(36px, 8vw, 88px)', fontWeight: 800, lineHeight: 1.05, marginBottom: 24, color: '#1a1535' }}>
              Digital Menus for<br />
              <span className="purple-grad">Every Bar & Club</span>
            </h1>
          </div>

          <div className="fade-up" style={{ animationDelay: '0.5s' }}>
            <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', fontWeight: 300, color: '#6b7280', maxWidth: 520, margin: '0 auto 36px', lineHeight: 1.8 }}>
              Give your customers a stunning QR-powered drinks menu. Update it in real time. No app, no printing, no hassle.
            </p>
          </div>

          <div className="fade-up hero-btns" style={{ animationDelay: '0.7s' }}>
            <a href="/signup" className="purple-btn" style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15, gap: 8 }}>
              Start for Free
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <button onClick={() => scrollTo('how-it-works')} className="outline-btn" style={{ padding: '14px 32px', borderRadius: 14, fontSize: 15 }}>
              See How It Works
            </button>
          </div>

          <div className="fade-up hero-checks" style={{ animationDelay: '0.9s' }}>
            {['No credit card required', 'Setup in 2 minutes', 'Free to start'].map(t => (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', fontSize: 13 }}>
                <svg width="16" height="16" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: 'clamp(56px, 10vw, 112px) clamp(20px, 5vw, 80px)', maxWidth: 1200, margin: '0 auto' }}>
        <FadeIn>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{ display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 999, marginBottom: 16 }}>Everything You Need</div>
            <h2 className="syne" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#1a1535', marginBottom: 16 }}>
              Built for <span className="purple-grad">bars & clubs</span>
            </h2>
            <p style={{ color: '#9ca3af', maxWidth: 480, margin: '0 auto', fontSize: 15 }}>Everything you need to run a modern digital menu — in one simple platform.</p>
          </div>
        </FadeIn>
        <div className="features-grid">
          {FEATURES.map((f, i) => (
            <FadeIn key={f.title} delay={i * 0.08}>
              <div className="feature-card" style={{ padding: '28px 24px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{f.icon}</div>
                <h3 className="syne" style={{ fontSize: 17, fontWeight: 600, color: '#1a1535', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ background: '#fff', borderTop: '1px solid #ede9fe', borderBottom: '1px solid #ede9fe', padding: 'clamp(56px, 10vw, 112px) clamp(20px, 5vw, 80px)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <div style={{ display: 'inline-block', background: '#ede9fe', color: '#6d28d9', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', padding: '6px 16px', borderRadius: 999, marginBottom: 16 }}>Simple Process</div>
              <h2 className="syne" style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, color: '#1a1535' }}>
                Up and running in <span className="purple-grad">minutes</span>
              </h2>
            </div>
          </FadeIn>
          <div className="steps-grid">
            {STEPS.map((s, i) => (
              <FadeIn key={s.num} delay={i * 0.12}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: '#ede9fe', border: '1px solid #c4b5fd', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <span className="syne" style={{ color: '#7c3aed', fontWeight: 700, fontSize: 14 }}>{s.num}</span>
                  </div>
                  <h3 className="syne" style={{ fontSize: 17, fontWeight: 600, color: '#1a1535', marginBottom: 10 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: 'clamp(64px, 12vw, 128px) 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 50%, rgba(124,58,237,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <FadeIn>
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <h2 className="syne" style={{ fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 800, color: '#1a1535', marginBottom: 20, lineHeight: 1.1 }}>
              Ready to modernize<br /><span className="purple-grad">your bar's menu?</span>
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 16, marginBottom: 36, lineHeight: 1.7 }}>Join hundreds of bars already using MyBar to delight their customers.</p>
            <a href="/signup" className="purple-btn" style={{ padding: '16px 40px', borderRadius: 14, fontSize: 16, gap: 10, margin: '0 auto' }}>
              Create Your Free Account
              <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
          </div>
        </FadeIn>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ background: '#fff', borderTop: '1px solid #ede9fe', padding: 'clamp(48px, 8vw, 80px) 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <FadeIn>
            <h2 className="syne" style={{ fontSize: 'clamp(24px, 5vw, 32px)', fontWeight: 700, color: '#1a1535', marginBottom: 12 }}>Get in Touch</h2>
            <p style={{ color: '#9ca3af', marginBottom: 36 }}>Have questions? We'd love to hear from you.</p>
            <div className="contact-row" style={{ display: 'flex', gap: 32, justifyContent: 'center' }}>
              <a href="mailto:hello@mybar.co.ke" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', textDecoration: 'none', fontSize: 15 }}
                onMouseOver={e => e.currentTarget.style.color = '#7c3aed'} onMouseOut={e => e.currentTarget.style.color = '#6b7280'}>
                <div style={{ width: 40, height: 40, background: '#ede9fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                hello@mybar.co.ke
              </a>
              <a href="tel:+254700000000" style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#6b7280', textDecoration: 'none', fontSize: 15 }}
                onMouseOver={e => e.currentTarget.style.color = '#7c3aed'} onMouseOut={e => e.currentTarget.style.color = '#6b7280'}>
                <div style={{ width: 40, height: 40, background: '#ede9fe', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" fill="none" stroke="#7c3aed" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                +254 700 000 000
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#faf9ff', borderTop: '1px solid #ede9fe', padding: '28px 24px' }}>
        <div className="footer-inner" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 11, fontFamily: 'Syne' }}>MB</div>
            <span className="syne" style={{ fontWeight: 700, color: '#1a1535' }}>MyBar</span>
          </div>
          <p style={{ color: '#d1d5db', fontSize: 13 }}>© 2024 MyBar · Built for bars across Kenya</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="/login" style={{ color: '#9ca3af', fontSize: 13, textDecoration: 'none' }}>Login</a>
            <a href="/signup" style={{ color: '#9ca3af', fontSize: 13, textDecoration: 'none' }}>Sign Up</a>
          </div>
        </div>
      </footer>
    </div>
  );
}