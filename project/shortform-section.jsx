/* global React */
/* ════════════════════════════════════════════════════════════════
   SHORT-FORM — seção com scroll horizontal + modal estilo Instagram
   --------------------------------------------------------------
   Expõe:
     window.ShortformSection — seção "pinada": ao rolar, a tela trava
       e os cards 9:16 deslizam pro lado, flutuando.
     window.ShortformModal   — vídeo 9:16 à esquerda, título grande e
       ano + descrição à direita.

   Dados vêm de shortform.js (window.SHORTFORM).
   ════════════════════════════════════════════════════════════════ */

const SF_PALETTE = { bg: '#0a0a0a', fg: '#f5f1e8', muted: '#8a8580', accent: '#7a00d8' };
const SF_FONTS = {
  display: '"Fraunces", serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

function sfThumb(id) {
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}
function sfPlayer(id) {
  return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`;
}

// ─── Modal estilo Instagram ────────────────────────────────────
function ShortformModal({ item, onClose, isMobile }) {
  const { useEffect } = React;

  useEffect(() => {
    if (!item) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(8,8,8,0.86)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? 16 : 40,
        overflowY: 'auto',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 20, right: 24, zIndex: 2,
          width: 40, height: 40, borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.2)',
          background: 'transparent', color: '#fff',
          fontSize: 20, lineHeight: 1, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      >×</button>

      {/* Quadro: vídeo à esquerda, texto à direita */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          background: '#0d0d0d',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 4,
          overflow: 'hidden',
          maxWidth: isMobile ? 480 : 1180,
          width: '100%',
          boxShadow: '0 30px 90px rgba(0,0,0,0.65)',
        }}
      >
        {/* Vídeo 9:16 */}
        <div style={{
          flexShrink: 0,
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? 'auto' : 'min(78vh, 760px)',
          aspectRatio: '9 / 16',
          background: '#000',
        }}>
          <iframe
            src={sfPlayer(item.youtubeId)}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
          />
        </div>

        {/* Painel de texto */}
        <div style={{
          flex: 1,
          padding: isMobile ? '24px 20px 28px' : '48px 44px',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-start',
          minWidth: 0,
        }}>
          <h2 style={{
            fontFamily: SF_FONTS.display,
            fontStyle: 'italic', fontWeight: 300,
            fontSize: isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(40px, 3.6vw, 68px)',
            lineHeight: 1.02, letterSpacing: '-0.03em',
            margin: 0, color: SF_PALETTE.fg,
          }}>
            {item.title}
          </h2>

          <div style={{
            marginTop: isMobile ? 16 : 28,
            fontFamily: SF_FONTS.mono, fontSize: 11, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: SF_PALETTE.accent,
          }}>
            {[item.year, item.subtitle].filter(Boolean).join(' · ')}
          </div>

          <p style={{
            marginTop: 16, marginBottom: 0,
            fontFamily: SF_FONTS.sans,
            fontSize: isMobile ? 14 : 15, lineHeight: 1.75,
            color: 'rgba(245,241,232,0.72)',
            whiteSpace: 'pre-line',
            maxWidth: 460,
          }}>
            {item.description}
          </p>

          <a
            href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
            target="_blank" rel="noopener noreferrer"
            style={{
              marginTop: isMobile ? 24 : 36,
              alignSelf: 'flex-start',
              fontFamily: SF_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: 'rgba(245,241,232,0.45)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = SF_PALETTE.fg)}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,241,232,0.45)')}
          >
            Ver no YouTube ↗
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Card vertical flutuante ───────────────────────────────────
function SfCard({ item, index, onOpen, width }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={() => onOpen(index)}
      style={{
        width, flexShrink: 0, cursor: 'pointer',
        // Flutuação: cada card sobe/desce com fase própria
        animation: `sf-float ${5.5 + (index % 3) * 0.8}s ease-in-out ${index * 0.45}s infinite`,
      }}
    >
      <div style={{
        position: 'relative',
        aspectRatio: '9 / 16',
        background: `linear-gradient(135deg, ${SF_PALETTE.accent}33, ${SF_PALETTE.fg}11)`,
        border: `1px solid ${hover ? SF_PALETTE.accent : 'rgba(255,255,255,0.1)'}`,
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'border-color 0.25s, transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        transform: hover ? 'scale(1.02)' : 'scale(1)',
      }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          src={sfThumb(item.youtubeId)}
          alt={item.title}
          onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`; e.currentTarget.onerror = null; }}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hover ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: hover ? 'rgba(10,10,10,0.3)' : 'rgba(10,10,10,0)',
          transition: 'background 0.25s',
        }}>
          <div style={{
            width: 0, height: 0,
            borderLeft: `18px solid ${hover ? SF_PALETTE.accent : 'rgba(255,255,255,0.9)'}`,
            borderTop: '12px solid transparent',
            borderBottom: '12px solid transparent',
            marginLeft: 5,
            opacity: hover ? 1 : 0,
            transform: hover ? 'scale(1)' : 'scale(0.7)',
            transition: 'opacity 0.25s, transform 0.25s, border-color 0.25s',
          }} />
        </div>
      </div>

      {/* Legenda: título, subtítulo, ano */}
      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div style={{
          fontFamily: SF_FONTS.display, fontStyle: 'italic',
          fontSize: 14, lineHeight: 1.2, color: SF_PALETTE.fg,
        }}>{item.title}</div>
        <div style={{
          fontFamily: SF_FONTS.sans, fontSize: 11, lineHeight: 1.4,
          color: SF_PALETTE.muted,
        }}>{item.subtitle}</div>
        <div style={{
          fontFamily: SF_FONTS.mono, fontSize: 9, letterSpacing: '0.25em',
          textTransform: 'uppercase',
          color: hover ? SF_PALETTE.accent : 'rgba(245,241,232,0.4)',
          transition: 'color 0.25s',
        }}>{item.year}</div>
      </div>
    </div>
  );
}

// ─── Seção com scroll horizontal "pinado" ──────────────────────
function ShortformSection({ isMobile, lang }) {
  const { useState, useEffect, useRef } = React;
  const items = window.SHORTFORM || [];
  const [openIndex, setOpenIndex] = useState(null);
  const [maxShift, setMaxShift] = useState(0);

  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const CARD_W = isMobile ? 230 : 300;
  const GAP = isMobile ? 16 : 32;
  const PAD = isMobile ? 20 : 40;

  const heading = lang === 'pt' ? 'Short-form.' : 'Short-form.';
  const label = lang === 'pt' ? '02, Vertical · Reels · Social' : '02, Vertical · Reels · Social';

  // Mede o quanto a faixa precisa deslizar pra revelar o último card
  useEffect(() => {
    if (isMobile) { setMaxShift(0); return; }
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const overflow = track.scrollWidth - window.innerWidth + PAD;
      setMaxShift(Math.max(0, overflow));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [isMobile, items.length, PAD]);

  // Converte scroll vertical em deslocamento horizontal.
  // Escreve o transform direto no nó: evita um re-render do React por frame.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (isMobile || maxShift <= 0) {
      track.style.transform = 'translate3d(0, 0, 0)';
      return;
    }
    let queued = false;
    const apply = () => {
      queued = false;
      const wrap = wrapRef.current;
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      if (scrollable <= 0) return;
      const p = Math.min(1, Math.max(0, -rect.top / scrollable));
      track.style.transform = `translate3d(${-p * maxShift}px, 0, 0)`;
    };
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isMobile, maxShift]);

  if (!items.length) return null;

  const Header = (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
      gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <div style={{
          fontFamily: SF_FONTS.mono, fontSize: 11, letterSpacing: '0.3em',
          textTransform: 'uppercase', color: 'rgba(245,241,232,0.35)', marginBottom: 14,
        }}>{label}</div>
        <h2 style={{
          fontFamily: SF_FONTS.display,
          fontSize: isMobile ? 'clamp(36px, 11vw, 56px)' : 'clamp(48px, 5vw, 92px)',
          fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0,
        }}>{heading}</h2>
      </div>
      <a href="./short-form.html" style={{
        fontFamily: SF_FONTS.mono, fontSize: 11, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: SF_PALETTE.accent, textDecoration: 'none',
      }}>{lang === 'pt' ? 'Ver tudo ↗' : 'See all ↗'}</a>
    </div>
  );

  const cards = items.map((item, i) => (
    <SfCard key={i} item={item} index={i} onOpen={setOpenIndex} width={CARD_W} />
  ));

  // ── Mobile: rolagem horizontal nativa com snap ──
  if (isMobile) {
    return (
      <section style={{
        padding: `56px 0 64px`,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ padding: `0 ${PAD}px` }}>{Header}</div>
        <div style={{
          marginTop: 28,
          display: 'flex', gap: GAP,
          padding: `0 ${PAD}px`,
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
        }}
          className="sf-noscrollbar"
        >
          {items.map((item, i) => (
            <div key={i} style={{ scrollSnapAlign: 'start' }}>
              <SfCard item={item} index={i} onOpen={setOpenIndex} width={CARD_W} />
            </div>
          ))}
        </div>
        <ShortformModal
          item={openIndex !== null ? items[openIndex] : null}
          onClose={() => setOpenIndex(null)}
          isMobile={isMobile}
        />
        <style>{`
          .sf-noscrollbar::-webkit-scrollbar { display: none; }
          @keyframes sf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        `}</style>
      </section>
    );
  }

  // ── Desktop: seção pinada, cards deslizam com o scroll ──
  return (
    <div
      ref={wrapRef}
      style={{
        position: 'relative',
        height: `calc(100vh + ${maxShift}px)`,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ padding: `0 ${PAD}px`, flexShrink: 0 }}>{Header}</div>

        <div style={{ marginTop: 40, overflow: 'hidden' }}>
          <div
            ref={trackRef}
            style={{
              display: 'flex', gap: GAP,
              padding: `0 ${PAD}px`,
              width: 'max-content',
              willChange: 'transform',
            }}
          >
            {cards}
          </div>
        </div>

        {maxShift > 0 && (
          <div style={{
            position: 'absolute', bottom: 32, left: PAD,
            fontFamily: SF_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
            textTransform: 'uppercase', color: 'rgba(245,241,232,0.3)',
          }}>
            {lang === 'pt' ? '↓ Role para navegar' : '↓ Scroll to browse'}
          </div>
        )}
      </div>

      <ShortformModal
        item={openIndex !== null ? items[openIndex] : null}
        onClose={() => setOpenIndex(null)}
        isMobile={isMobile}
      />

      <style>{`
        @keyframes sf-float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      `}</style>
    </div>
  );
}

window.ShortformModal = ShortformModal;
window.ShortformSection = ShortformSection;
window.SfCard = SfCard;
