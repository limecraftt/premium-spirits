import React, { useEffect, useRef, useState } from 'react';

const NAV_LINKS = ['Story', 'Menu', 'Contact'];

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setInView(true); observer.disconnect(); }
    }, { threshold });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: inView ? 1 : 0,
      transform: inView ? 'translateY(0)' : 'translateY(32px)',
      transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`
    }}>
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', 'Georgia', serif", background: '#0a0702', color: '#f5ede0', minHeight: '100vh', overflowX: 'hidden' }}>

      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0702; }
        ::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 2px; }

        .gold { color: #c9a84c; }
        .gold-gradient { background: linear-gradient(135deg, #f0d080 0%, #c9a84c 40%, #a07830 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .nav-link {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 3px; text-transform: uppercase;
          color: #a89070; text-decoration: none;
          transition: color 0.3s; cursor: pointer;
        }
        .nav-link:hover { color: #c9a84c; }

        .btn-primary {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase;
          background: linear-gradient(135deg, #c9a84c, #a07830);
          color: #0a0702; border: none;
          padding: 16px 40px; cursor: pointer;
          transition: all 0.3s; display: inline-block;
          text-decoration: none;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(201,168,76,0.35); }

        .btn-outline {
          font-family: 'Montserrat', sans-serif;
          font-size: 11px; font-weight: 600;
          letter-spacing: 3px; text-transform: uppercase;
          background: transparent;
          color: #c9a84c; border: 1px solid #c9a84c;
          padding: 15px 38px; cursor: pointer;
          transition: all 0.3s; display: inline-block;
          text-decoration: none;
        }
        .btn-outline:hover { background: #c9a84c22; transform: translateY(-2px); }

        .divider {
          display: flex; align-items: center; gap: 16px;
          margin: 0 auto;
        }
        .divider-line { flex: 1; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c55, transparent); }
        .divider-diamond { width: 6px; height: 6px; background: #c9a84c; transform: rotate(45deg); flex-shrink: 0; }

        .grain::after {
          content: '';
          position: fixed; inset: 0; pointer-events: none; z-index: 999;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.35;
        }

        .card-hover { transition: transform 0.4s ease, box-shadow 0.4s ease; }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 60px rgba(201,168,76,0.12); }

        .input-gold {
          background: #0f0c06;
          border: 1px solid #2a2010;
          border-bottom: 1px solid #c9a84c55;
          color: #f5ede0;
          font-family: 'Montserrat', sans-serif;
          font-size: 13px;
          padding: 14px 0;
          width: 100%;
          outline: none;
          transition: border-color 0.3s;
        }
        .input-gold::placeholder { color: #5a4a30; }
        .input-gold:focus { border-bottom-color: #c9a84c; }

        textarea.input-gold { padding: 14px 0; resize: none; }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>

      <div className="grain" />

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 48px', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(10,7,2,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid #1a1408' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        transition: 'all 0.5s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, border: '1px solid #c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#c9a84c', fontSize: 12, fontWeight: 600, fontFamily: 'Montserrat', letterSpacing: 1 }}>PS</span>
          </div>
          <span style={{ fontFamily: 'Cormorant Garamond', fontSize: 20, fontWeight: 500, letterSpacing: 2, color: '#f5ede0' }}>
            Premium <span style={{ color: '#c9a84c' }}>Spirits</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          {NAV_LINKS.map(link => (
            <span key={link} className="nav-link" onClick={() => scrollTo(link.toLowerCase())}>{link}</span>
          ))}
          <span className="btn-primary" onClick={() => scrollTo('menu')} style={{ padding: '10px 24px', fontSize: 10 }}>
            View Menu
          </span>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>

        {/* Background layers */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 60% 50%, #1a0f00 0%, #0a0702 60%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.12 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(10,7,2,0.3) 0%, rgba(10,7,2,0.6) 60%, rgba(10,7,2,1) 100%)' }} />

        {/* Decorative orbs */}
        <div style={{ position: 'absolute', top: '20%', right: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, #c9a84c18 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '25%', left: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #c9a84c10 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Vertical lines decoration */}
        <div style={{ position: 'absolute', left: 48, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent, #c9a84c22, transparent)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: 48, top: 0, bottom: 0, width: 1, background: 'linear-gradient(180deg, transparent, #c9a84c22, transparent)', pointerEvents: 'none' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: 860, padding: '0 24px' }}>

          <div style={{ opacity: 0, animation: 'fadeSlide 1s ease 0.2s forwards' }}>
            <style>{`@keyframes fadeSlide { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 32 }}>
              <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg, transparent, #c9a84c)' }} />
              <span style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 5, color: '#c9a84c', textTransform: 'uppercase' }}>Est. 2024 · Nairobi</span>
              <div style={{ height: 1, width: 60, background: 'linear-gradient(90deg, #c9a84c, transparent)' }} />
            </div>
          </div>

          <div style={{ opacity: 0, animation: 'fadeSlide 1s ease 0.5s forwards' }}>
            <h1 style={{ fontSize: 'clamp(52px, 10vw, 110px)', fontWeight: 300, lineHeight: 1, letterSpacing: -1, marginBottom: 8 }}>
              <span style={{ display: 'block', color: '#f5ede0' }}>Exceptional</span>
              <span style={{ display: 'block', background: 'linear-gradient(135deg, #f0d080, #c9a84c, #a07830)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontStyle: 'italic' }}>Spirits</span>
              <span style={{ display: 'block', color: '#f5ede0', fontSize: '0.65em', letterSpacing: 2 }}>Curated for You</span>
            </h1>
          </div>

          <div style={{ opacity: 0, animation: 'fadeSlide 1s ease 0.8s forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '40px auto' }}>
              <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, transparent, #c9a84c44)' }} />
              <div style={{ width: 5, height: 5, background: '#c9a84c', transform: 'rotate(45deg)' }} />
              <div style={{ height: 1, width: 80, background: 'linear-gradient(90deg, #c9a84c44, transparent)' }} />
            </div>
            <p style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 300, letterSpacing: 2, color: '#a89070', lineHeight: 2, maxWidth: 480, margin: '0 auto 48px' }}>
              Discover our handpicked collection of the world's finest whiskeys, vodkas, rums, and premium liquors — served with expertise and passion.
            </p>
          </div>

          <div style={{ opacity: 0, animation: 'fadeSlide 1s ease 1.1s forwards', display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/menu" className="btn-primary">Explore the Menu</a>
            <span className="btn-outline" onClick={() => scrollTo('story')}>Our Story</span>
          </div>

          {/* Scroll indicator */}
          <div style={{ opacity: 0, animation: 'fadeSlide 1s ease 1.4s forwards', marginTop: 80 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'Montserrat', fontSize: 9, letterSpacing: 4, color: '#5a4a30', textTransform: 'uppercase' }}>Scroll</span>
              <div style={{ width: 1, height: 50, background: 'linear-gradient(180deg, #c9a84c, transparent)', animation: 'float 2s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section style={{ borderTop: '1px solid #1a1408', borderBottom: '1px solid #1a1408', background: '#0d0a04', padding: '40px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {[
            { number: '200+', label: 'Premium Labels' },
            { number: '50+', label: 'Cocktail Recipes' },
            { number: '10+', label: 'Years of Expertise' },
          ].map((s, i) => (
            <FadeIn key={s.label} delay={i * 0.15}>
              <div style={{ textAlign: 'center', padding: '0 24px', borderRight: i < 2 ? '1px solid #1a1408' : 'none' }}>
                <div style={{ fontSize: 'clamp(36px, 5vw, 52px)', fontWeight: 300, color: '#c9a84c', letterSpacing: -1, lineHeight: 1 }}>{s.number}</div>
                <div style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 3, color: '#5a4a30', textTransform: 'uppercase', marginTop: 8 }}>{s.label}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ── STORY ── */}
      <section id="story" style={{ padding: 'clamp(80px, 12vw, 140px) clamp(24px, 8vw, 120px)', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>
          <FadeIn delay={0}>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '3/4' }}>
                <img src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&q=80" alt="Spirits" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.8) sepia(0.2)' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #c9a84c18, transparent)' }} />
              </div>
              {/* Floating accent box */}
              <div style={{ position: 'absolute', bottom: -24, right: -24, background: '#0d0a04', border: '1px solid #c9a84c33', padding: '24px 32px', minWidth: 160 }}>
                <div style={{ fontSize: 36, fontWeight: 300, color: '#c9a84c', lineHeight: 1 }}>18+</div>
                <div style={{ fontFamily: 'Montserrat', fontSize: 9, letterSpacing: 3, color: '#5a4a30', textTransform: 'uppercase', marginTop: 4 }}>Years Aged<br />Collection</div>
              </div>
              {/* Top border accent */}
              <div style={{ position: 'absolute', top: -12, left: -12, width: 60, height: 60, borderTop: '2px solid #c9a84c', borderLeft: '2px solid #c9a84c' }} />
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div>
              <div style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 4, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 24 }}>Our Story</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 300, lineHeight: 1.1, marginBottom: 32, color: '#f5ede0' }}>
                Crafted with<br /><span style={{ fontStyle: 'italic', color: '#c9a84c' }}>Passion</span>
              </h2>
              <div style={{ width: 60, height: 1, background: 'linear-gradient(90deg, #c9a84c, transparent)', marginBottom: 32 }} />
              <p style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 300, lineHeight: 2, color: '#8a7050', marginBottom: 24 }}>
                At Premium Spirits, we believe that exceptional liquor is more than just a drink — it's an experience. Each bottle in our collection has been carefully selected for its unique character, rich history, and uncompromising quality.
              </p>
              <p style={{ fontFamily: 'Montserrat', fontSize: 14, fontWeight: 300, lineHeight: 2, color: '#8a7050', marginBottom: 40 }}>
                From rare single malts to artisanal vodkas, we bring you the world's finest spirits, delivered with expertise and care. Every pour tells a story of craftsmanship spanning generations.
              </p>
              <div style={{ display: 'flex', gap: 32 }}>
                {[{ v: 'Authentic', i: '✦' }, { v: 'Premium', i: '✦' }, { v: 'Curated', i: '✦' }].map(item => (
                  <div key={item.v} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ color: '#c9a84c', fontSize: 8 }}>{item.i}</span>
                    <span style={{ fontFamily: 'Montserrat', fontSize: 11, letterSpacing: 2, color: '#a89070', textTransform: 'uppercase' }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── MENU TEASER ── */}
      <section id="menu" style={{ background: '#0d0a04', padding: 'clamp(80px, 10vw, 120px) clamp(24px, 8vw, 80px)', borderTop: '1px solid #1a1408' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <FadeIn>
            <div style={{ textAlign: 'center', marginBottom: 64 }}>
              <div style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 4, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 16 }}>What We Offer</div>
              <h2 style={{ fontSize: 'clamp(36px, 5vw, 58px)', fontWeight: 300, color: '#f5ede0', marginBottom: 24 }}>
                Our <span style={{ fontStyle: 'italic', color: '#c9a84c' }}>Collection</span>
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 300, margin: '0 auto' }}>
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #c9a84c55)' }} />
                <div style={{ width: 5, height: 5, background: '#c9a84c', transform: 'rotate(45deg)' }} />
                <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #c9a84c55, transparent)' }} />
              </div>
            </div>
          </FadeIn>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 2, marginBottom: 60 }}>
            {[
              { name: 'Whiskey & Scotch', desc: 'Single malts, blended Scotch, Irish & bourbon expressions', img: 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=600&q=80', icon: '🥃' },
              { name: 'Cocktails', desc: 'House-crafted cocktails with premium base spirits', img: 'https://images.unsplash.com/photo-1571950006418-f883b2f0b1e5?w=600&q=80', icon: '🍹' },
              { name: 'Wine & Cognac', desc: 'Old World and New World selections, aged to perfection', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=600&q=80', icon: '🍷' },
              { name: 'Mocktails', desc: 'Sophisticated alcohol-free creations for every palate', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80', icon: '🧃' },
            ].map((cat, i) => (
              <FadeIn key={cat.name} delay={i * 0.1}>
                <div className="card-hover" style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', aspectRatio: '3/4' }} onClick={() => window.location.href = '/menu'}>
                  <img src={cat.img} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.5) sepia(0.3)', transition: 'transform 0.6s ease' }}
                    onMouseOver={e => e.target.style.transform = 'scale(1.06)'}
                    onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 30%, rgba(10,7,2,0.95) 100%)' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '32px 24px' }}>
                    <div style={{ fontSize: 24, marginBottom: 8 }}>{cat.icon}</div>
                    <h3 style={{ fontSize: 22, fontWeight: 400, color: '#f5ede0', marginBottom: 8, letterSpacing: 0.5 }}>{cat.name}</h3>
                    <p style={{ fontFamily: 'Montserrat', fontSize: 12, fontWeight: 300, color: '#8a7050', lineHeight: 1.7 }}>{cat.desc}</p>
                    <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 3, color: '#c9a84c', textTransform: 'uppercase' }}>Explore</span>
                      <div style={{ width: 24, height: 1, background: '#c9a84c' }} />
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.3}>
            <div style={{ textAlign: 'center' }}>
              <a href="/menu" className="btn-primary">View Full Menu</a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" style={{ padding: 'clamp(80px, 10vw, 120px) clamp(24px, 8vw, 80px)', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'start' }}>

          <FadeIn delay={0}>
            <div>
              <div style={{ fontFamily: 'Montserrat', fontSize: 10, letterSpacing: 4, color: '#c9a84c', textTransform: 'uppercase', marginBottom: 16 }}>Find Us</div>
              <h2 style={{ fontSize: 'clamp(36px, 4vw, 52px)', fontWeight: 300, color: '#f5ede0', lineHeight: 1.1, marginBottom: 48 }}>
                Come Visit<br /><span style={{ fontStyle: 'italic', color: '#c9a84c' }}>Us</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {[
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="#c9a84c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    ),
                    label: 'Location',
                    value: 'Nairobi, Kenya',
                    sub: 'Visit us for a curated tasting experience'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="#c9a84c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    ),
                    label: 'Phone',
                    value: '+254 700 000 000',
                    sub: 'Mon – Sat, 10am – 10pm'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="#c9a84c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    ),
                    label: 'Email',
                    value: 'hello@premiumspirits.co.ke',
                    sub: 'We reply within 24 hours'
                  },
                  {
                    icon: (
                      <svg width="18" height="18" fill="none" stroke="#c9a84c" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    ),
                    label: 'Hours',
                    value: 'Mon – Sun: 10am – 11pm',
                    sub: 'Last orders 30 mins before closing'
                  },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, border: '1px solid #c9a84c33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Montserrat', fontSize: 9, letterSpacing: 3, color: '#5a4a30', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 18, fontWeight: 400, color: '#f5ede0', marginBottom: 4 }}>{item.value}</div>
                      <div style={{ fontFamily: 'Montserrat', fontSize: 12, color: '#6a5a40', fontWeight: 300 }}>{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div style={{ background: '#0d0a04', border: '1px solid #1a1408', padding: '48px 40px' }}>
              <h3 style={{ fontSize: 28, fontWeight: 300, color: '#f5ede0', marginBottom: 8 }}>Send a <span style={{ fontStyle: 'italic', color: '#c9a84c' }}>Message</span></h3>
              <p style={{ fontFamily: 'Montserrat', fontSize: 12, color: '#5a4a30', marginBottom: 40, lineHeight: 1.8 }}>
                Reservations, bulk orders, or just want to say hello — we'd love to hear from you.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {[
                  { placeholder: 'Your Name', type: 'text' },
                  { placeholder: 'Email Address', type: 'email' },
                  { placeholder: 'Phone Number', type: 'tel' },
                ].map(field => (
                  <div key={field.placeholder} style={{ borderBottom: '1px solid #2a2010' }}>
                    <input type={field.type} placeholder={field.placeholder} className="input-gold" style={{ background: 'transparent', border: 'none', borderBottom: 'none' }} />
                  </div>
                ))}
                <div style={{ borderBottom: '1px solid #2a2010' }}>
                  <textarea placeholder="Your Message" rows={4} className="input-gold" style={{ background: 'transparent', border: 'none', borderBottom: 'none' }} />
                </div>
                <button className="btn-primary" style={{ width: '100%', textAlign: 'center', marginTop: 8 }}>
                  Send Message
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid #1a1408', background: '#07050100', padding: '48px clamp(24px, 8vw, 80px)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, border: '1px solid #c9a84c44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#c9a84c', fontSize: 10, fontFamily: 'Montserrat', letterSpacing: 1 }}>PS</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 400, letterSpacing: 3, color: '#5a4a30' }}>PREMIUM SPIRITS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, maxWidth: 300, width: '100%' }}>
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, #c9a84c22)' }} />
            <div style={{ width: 4, height: 4, background: '#c9a84c33', transform: 'rotate(45deg)' }} />
            <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, #c9a84c22, transparent)' }} />
          </div>
          <p style={{ fontFamily: 'Montserrat', fontSize: 11, color: '#3a2a18', letterSpacing: 1 }}>
            © 2024 Premium Spirits · Nairobi, Kenya · Please drink responsibly
          </p>
        </div>
      </footer>

    </div>
  );
}