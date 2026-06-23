/* global React */
const { useState, useEffect, useRef } = React;

// V1 — Cinematic full-bleed showreel hero
// Massive type, ambient grain, cursor-tracked vignette, ticking clock, scroll cue
function HeroShowreel({ palette, fonts, intensity, colorSrc, bwSrc, videoSrc, streamSrc, heroTitle, heroDuration, heroHref, heroThumbStream, lang, setLang }) {
  const T = (window.I18N && window.I18N[lang]) || { nav: { color: 'COLOR', about: 'ABOUT', contact: 'CONTACT' }, reel: { heroLabel: '[001] — Filmmaker & Editor / Reel 2026', heroDescription: '', scroll: 'Scroll', latestWork: '↗ Latest work' } };
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [thumbHover, setThumbHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      setMouse({
        x: (e.clientX - r.left) / r.width,
        y: (e.clientY - r.top) / r.height,
      });
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, []);

  const inten = intensity ?? 1;

  return (
    <div
      ref={rootRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: palette.bg,
        color: palette.fg,
        overflow: 'hidden',
        fontFamily: fonts.sans,
      }}
    >
      {streamSrc ? (
        <iframe
          src={streamSrc}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 'none',
            zIndex: 0,
          }}
        />
      ) : videoSrc ? (
        <video
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 0,
          }}
        />
      ) : colorSrc && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `url("${colorSrc}") center/cover no-repeat`,
            zIndex: 0,
          }}
        />
      )}
      {/* Vinheta sutil */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Top bar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          padding: isMobile ? '20px 20px' : '28px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#fff',
          zIndex: 10,
          mixBlendMode: 'difference',
        }}
      >
        <a href="./index.html" style={{
          fontFamily: fonts.display, fontSize: 16, letterSpacing: '-0.02em',
          textTransform: 'none', fontStyle: 'italic', color: '#fff',
          textDecoration: 'none',
        }}>Jotap Films</a>

        {/* Toggle de idioma — centralizado no viewport */}
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span onClick={() => setLang && setLang('en')} style={{ cursor: 'pointer', color: lang === 'en' ? palette.accent : 'inherit', opacity: lang === 'en' ? 1 : 0.55, transition: 'opacity 0.2s, color 0.2s' }}>EN</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span onClick={() => setLang && setLang('pt')} style={{ cursor: 'pointer', color: lang === 'pt' ? palette.accent : 'inherit', opacity: lang === 'pt' ? 1 : 0.55, transition: 'opacity 0.2s, color 0.2s' }}>PT</span>
        </div>

        <div style={{ display: 'flex', gap: isMobile ? 20 : 32 }}>
          <a href="./index.html" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{(T.nav.about || 'ABOUT').toUpperCase()}</a>
          {!isMobile && (
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=jotapfilms@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>{(T.nav.contact || 'CONTACT').toUpperCase()}</a>
          )}
        </div>
      </div>

      {/* Main type lockup */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile ? '0 20px' : '0 40px',
          zIndex: 5,
        }}
      >
        <div
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: palette.muted,
            marginBottom: 20,
          }}
        >
          {T.reel.heroLabel}
        </div>

        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: isMobile ? 'clamp(56px, 18vw, 100px)' : 'clamp(72px, 14vw, 240px)',
            lineHeight: 0.85,
            margin: 0,
            fontWeight: 400,
            letterSpacing: '-0.04em',
            color: palette.fg,
          }}
        >
          <span style={{ display: 'block' }}>Jotap</span>
          <span
            style={{
              display: 'block',
              fontStyle: 'italic',
              fontWeight: 300,
              color: palette.accent,
              transform: isMobile ? 'none' : `translateX(${(mouse.x - 0.5) * 30 * inten}px)`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            Films
          </span>
        </h1>

        {!isMobile && (
          <div
            style={{
              marginTop: 40,
              display: 'flex',
              gap: 80,
              fontFamily: fonts.sans,
              fontSize: 13,
              color: palette.muted,
              maxWidth: 720,
            }}
          >
            <div style={{ flex: 1, lineHeight: 1.6 }}>
              {T.reel.heroDescription}
            </div>
          </div>
        )}
      </div>


      {/* Scroll cue */}
      <div
        style={{
          position: 'absolute',
          left: 40,
          bottom: 40,
          fontFamily: fonts.mono,
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: palette.muted,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          zIndex: 8,
        }}
      >
        <span>{T.reel.scroll}</span>
        <div style={{ width: 1, height: 60, background: `linear-gradient(${palette.muted}, transparent)`, animation: 'jp-scroll 2.2s ease-in-out infinite' }} />
      </div>

      {/* Mini-vídeo clicável — só no desktop. No mobile ocupa espaço demais. */}
      {!isMobile && (heroTitle || heroThumbStream) && (
        <a
          href={heroHref || './video.html'}
          onMouseEnter={() => setThumbHover(true)}
          onMouseLeave={() => setThumbHover(false)}
          style={{
            position: 'absolute',
            right: 40,
            bottom: 40,
            zIndex: 8,
            width: 248,
            textDecoration: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'block',
          }}
        >
          {/* Label acima */}
          <div style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: thumbHover ? palette.accent : palette.muted,
            transition: 'color 0.25s',
            marginBottom: 10,
          }}>
            {T.reel.latestWork}
          </div>

          {/* Thumbnail 16:9 */}
          <div style={{
            position: 'relative',
            aspectRatio: '16 / 9',
            background: `linear-gradient(135deg, ${palette.accent}33, ${palette.fg}11)`,
            border: `1px solid ${thumbHover ? palette.accent : palette.fg + '1a'}`,
            overflow: 'hidden',
            transition: 'border-color 0.25s, transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
            transform: thumbHover ? 'scale(1.03)' : 'scale(1)',
          }}>
            {heroThumbStream ? (
              <iframe
                src={heroThumbStream}
                allow="autoplay; encrypted-media; picture-in-picture"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
              />
            ) : (
              <>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `repeating-linear-gradient(90deg, transparent, transparent 22px, ${palette.fg}08 22px, ${palette.fg}08 24px)`,
                }} />
                <div style={{
                  position: 'absolute', inset: '28% 40%',
                  border: `1px solid ${palette.accent}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: `11px solid ${palette.accent}`,
                    borderTop: '7px solid transparent',
                    borderBottom: '7px solid transparent',
                    marginLeft: 3,
                  }} />
                </div>
              </>
            )}
          </div>

          {/* Título + duração abaixo */}
          <div style={{
            marginTop: 10,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}>
            <span style={{
              fontFamily: fonts.display,
              fontStyle: 'italic',
              fontSize: 16,
              color: palette.fg,
            }}>
              {heroTitle}
            </span>
            <span style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              letterSpacing: '0.2em',
              color: palette.muted,
            }}>
              {heroDuration}
            </span>
          </div>
        </a>
      )}

      <style>{`
        @keyframes jp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes jp-scroll { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
      `}</style>
    </div>
  );
}

window.HeroShowreel = HeroShowreel;
