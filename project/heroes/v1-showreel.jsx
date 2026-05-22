/* global React */
const { useState, useEffect, useRef } = React;

// V1 — Cinematic full-bleed showreel hero
// Massive type, ambient grain, cursor-tracked vignette, ticking clock, scroll cue
function HeroShowreel({ palette, fonts, intensity, colorSrc, bwSrc, videoSrc, streamSrc, heroTitle, heroDuration }) {
  const [time, setTime] = useState(() => new Date());
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const rootRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
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

  const fmt = (n) => String(n).padStart(2, '0');
  const timeStr = `${fmt(time.getHours())}:${fmt(time.getMinutes())}:${fmt(time.getSeconds())}`;

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
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: '28px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: fonts.mono,
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: palette.muted,
          zIndex: 10,
        }}
      >
        <a href="./index.html" style={{
          fontFamily: fonts.display, fontSize: 16, letterSpacing: '-0.02em',
          textTransform: 'none', fontStyle: 'italic', color: palette.fg,
          textDecoration: 'none',
        }}>Jotap Films</a>
        <div style={{ display: 'flex', gap: 32 }}>
          <a href="./color.html" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>COLOR</a>
          <a href="./index.html" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>ABOUT</a>
          <a href="https://mail.google.com/mail/?view=cm&fs=1&to=jotapfilms@gmail.com" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>CONTACT</a>
        </div>
        <div>{timeStr} BRT</div>
      </div>

      {/* Main type lockup */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 40px',
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
            marginBottom: 24,
          }}
        >
          [001] — Video Editor / Reel 2026
        </div>

        <h1
          style={{
            fontFamily: fonts.display,
            fontSize: 'clamp(72px, 14vw, 240px)',
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
              transform: `translateX(${(mouse.x - 0.5) * 30 * inten}px)`,
              transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
          >
            Films
          </span>
        </h1>

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
            Crafting cinematic stories for brands, artists, and the in-between. Available for commissions Q3–Q4 2026.
          </div>
        </div>
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
        <span>Scroll</span>
        <div style={{ width: 1, height: 60, background: `linear-gradient(${palette.muted}, transparent)`, animation: 'jp-scroll 2.2s ease-in-out infinite' }} />
      </div>

      {/* Crédito do vídeo da hero — título + duração (canto inferior-direito) */}
      {(heroTitle || heroDuration) && (
        <div
          style={{
            position: 'absolute',
            right: 40,
            bottom: 40,
            zIndex: 8,
            display: 'flex',
            alignItems: 'baseline',
            gap: 16,
          }}
        >
          <span style={{
            fontFamily: fonts.display,
            fontStyle: 'italic',
            fontSize: 18,
            color: palette.fg,
          }}>
            {heroTitle}
          </span>
          <span style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            letterSpacing: '0.2em',
            color: palette.muted,
          }}>
            {heroDuration}
          </span>
        </div>
      )}

      <style>{`
        @keyframes jp-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes jp-scroll { 0% { transform: scaleY(0); transform-origin: top; } 50% { transform: scaleY(1); transform-origin: top; } 51% { transform-origin: bottom; } 100% { transform: scaleY(0); transform-origin: bottom; } }
      `}</style>
    </div>
  );
}

window.HeroShowreel = HeroShowreel;
