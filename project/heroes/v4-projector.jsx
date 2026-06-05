/* global React */
const { useState: useState4, useEffect: useEffect4, useRef: useRef4 } = React;

// V4 — Cursor-driven projector / spotlight reveal
// Background is dark; cursor reveals a "projected" film still beneath. Magnetic CTA.
function HeroProjector({ palette, fonts, intensity, colorSrc, bwSrc, lang, setLang }) {
  // Textos traduzíveis (lang vem da pagina). Default seguro caso i18n.js não carregue.
  const T = (window.I18N && window.I18N[lang]) || { nav: { color: 'Color', reel: 'Reel', about: 'About', contact: 'Contact' }, color: { heroHeading1: 'Frames', heroHeading2: 'between', heroHeading3: 'frames.', heroDescription: '', moveToReveal: '◐ Move to reveal', nowShowing: 'Now showing' } };
  const [mouse, setMouse] = useState4({ x: 0.5, y: 0.5 });
  const [active, setActive] = useState4(false);
  const [step, setStep] = useState4(0);
  const [pastHero, setPastHero] = useState4(false);
  const [isMobile, setIsMobile] = useState4(false);
  const rootRef = useRef4(null);
  const inten = intensity ?? 1;

  // Detecta mobile
  useEffect4(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect4(() => {
    const onScroll = () => setPastHero(window.scrollY >= window.innerHeight);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-cycle:
  //   Desktop → 3 estados, 5s cada (cor revelada pelo cursor)
  //   Mobile  → 6 estados. A imagem P&B (estado par) fica MENOS tempo no ar
  //             antes de revelar a cor (estado ímpar), que fica mais tempo.
  const stepCount = isMobile ? 6 : 3;
  const BW_DURATION = 2200;     // tempo da imagem P&B antes de revelar (mobile)
  const COLOR_DURATION = 5000;  // tempo da imagem colorida revelada (mobile)
  useEffect4(() => {
    setStep(0);
    let id;
    const schedule = (cur) => {
      // No mobile, estado par = P&B (curto); ímpar = colorido (longo).
      const delay = isMobile ? (cur % 2 === 0 ? BW_DURATION : COLOR_DURATION) : 5000;
      id = setTimeout(() => {
        const next = (cur + 1) % stepCount;
        setStep(next);
        schedule(next);
      }, delay);
    };
    schedule(0);
    return () => clearTimeout(id);
  }, [stepCount]);

  // No mobile: stillIdx avança a cada 2 passos; estado par = P&B, ímpar = cor revelada.
  const stillIdx = isMobile ? Math.floor(step / 2) : step;
  const revealed = isMobile ? step % 2 === 1 : undefined;

  useEffect4(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setMouse({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
    };
    const onEnter = () => setActive(true);
    const onLeave = () => setActive(false);
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  const stills = [
    { title: 'Aurora',      src: './Captura de tela 2026-03-14 085100.jpg', bwSrc: './Captura de tela 2026-03-14 083559.jpg' },
    { title: 'Marés',       src: './Captura de tela 2026-03-14 101310.jpg', bwSrc: './Captura de tela 2026-03-14 101139.jpg' },
    { title: 'Vento Norte', src: './Captura de tela 2026-03-14 101853.jpg', bwSrc: './Captura de tela 2026-03-14 101759.jpg' },
  ];
  const still = stills[stillIdx];

  const radius = 220 * (0.6 + inten * 0.6);

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        background: '#0a0a0a',
        color: palette.fg,
        fontFamily: fonts.sans,
        overflow: 'hidden',
      }}
    >
      {/* As 3 imagens são montadas simultaneamente; só a ativa fica visível.
          Crossfade de 1.2s na troca dá uma transição suave.
          fullReveal: undefined no desktop (cursor); no mobile, true/false controla
          a revelação automática P&B → cor da imagem ativa. */}
      {stills.map((s, i) => (
        <div key={i} style={{
          position: 'absolute',
          inset: 0,
          opacity: i === stillIdx ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
          zIndex: i === stillIdx ? 2 : 1,
        }}>
          <window.ColorRevealBackground
            palette={palette}
            intensity={inten}
            sceneIdx={i % 5}
            colorSrc={s.src}
            bwSrc={s.bwSrc}
            fullReveal={isMobile ? (i === stillIdx ? revealed : false) : undefined}
          />
        </div>
      ))}

      {/* Header */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: fonts.mono, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#fff',
        zIndex: 10,
        mixBlendMode: pastHero ? 'difference' : 'screen',
      }}>
        <a href="./index.html" style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: '-0.02em', textTransform: 'none', fontStyle: 'italic', color: '#fff', textDecoration: 'none' }}>Jotap Films</a>

        {/* Toggle de idioma — centralizado no viewport */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => setLang && setLang('en')} style={{ cursor: 'pointer', color: lang === 'en' ? palette.accent : 'inherit', opacity: lang === 'en' ? 1 : 0.55, transition: 'opacity 0.2s, color 0.2s' }}>EN</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span onClick={() => setLang && setLang('pt')} style={{ cursor: 'pointer', color: lang === 'pt' ? palette.accent : 'inherit', opacity: lang === 'pt' ? 1 : 0.55, transition: 'opacity 0.2s, color 0.2s' }}>PT</span>
        </div>

        <div style={{ display: 'flex', gap: 32 }}>
          <a href="./reel.html" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{T.nav.reel}</a>
          <a href="./index.html" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{T.nav.about}</a>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=jotapfilms@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{T.nav.contact}</a>
        </div>
      </div>

      {/* Main type — center */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        textAlign: 'center',
        padding: '0 40px',
        pointerEvents: 'none',
        zIndex: 5,
      }}>
        {!isMobile && (
          <div style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#fff',
            marginBottom: 32,
            mixBlendMode: 'screen',
          }}>
            {T.color.moveToReveal}
          </div>
        )}
        <h1 style={{
          fontFamily: fonts.display,
          fontSize: 'clamp(56px, 10vw, 160px)',
          lineHeight: 0.88,
          fontWeight: 300,
          letterSpacing: '-0.045em',
          margin: 0,
          color: palette.fg,
          mixBlendMode: 'difference',
        }}>
          {T.color.heroHeading1}<br />
          <em style={{ fontWeight: 300 }}>{T.color.heroHeading2}</em><br />
          {T.color.heroHeading3}
        </h1>
        <div style={{
          marginTop: 32,
          fontFamily: fonts.sans,
          fontSize: 14,
          maxWidth: 480,
          color: '#fff',
          lineHeight: 1.6,
          mixBlendMode: 'screen',
        }}>
          {T.color.heroDescription}
        </div>
      </div>

      {/* Bottom right credit */}
      <div style={{
        position: 'absolute',
        right: 40,
        bottom: 40,
        fontFamily: fonts.mono,
        fontSize: 10,
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        color: '#fff',
        textAlign: 'right',
        zIndex: 10,
        mixBlendMode: 'screen',
      }}>
        <div style={{ color: palette.accent, marginBottom: 4 }}>{T.color.nowShowing}</div>
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontStyle: 'italic', textTransform: 'none', letterSpacing: '-0.02em', color: '#fff' }}>
          {still.title}
        </div>
      </div>

    </div>
  );
}

window.HeroProjector = HeroProjector;
