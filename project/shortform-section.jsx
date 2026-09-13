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

const SF_TH = window.THEME;
const SF_PALETTE = SF_TH.palette;
const SF_FONTS = SF_TH.fonts;

// Capa e player vêm de media.js — Cloudflare Stream quando o vídeo tem
// streamId, YouTube caso contrário.

// ─── Modal estilo Instagram ────────────────────────────────────
function ShortformModal({ item, onClose, isMobile, lang }) {
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
        background: 'rgba(245,244,240,0.88)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        // flex-start + margin:auto no filho em vez de align-items:center.
        // Centralizado, "center" corta o topo quando o conteúdo passa da
        // altura da tela e essa parte fica impossível de alcançar rolando.
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: isMobile ? 16 : 40,
        overflowY: 'auto',
      }}
    >
      <button
        onClick={onClose}
        style={{
          position: 'fixed', top: 20, right: 24, zIndex: 2,
          width: 40, height: 40, borderRadius: 20,
          border: `1px solid ${SF_PALETTE.line}`,
          background: SF_PALETTE.bg, color: SF_PALETTE.fg,
          fontSize: 20, lineHeight: 1, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = SF_PALETTE.surface)}
        onMouseLeave={(e) => (e.currentTarget.style.background = SF_PALETTE.bg)}
      >×</button>

      {/* Quadro: vídeo + texto em cima, color ocupando a largura embaixo */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          // margin auto centraliza quando sobra espaço, sem prender o topo
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          background: SF_PALETTE.bg,
          border: `1px solid ${SF_PALETTE.line}`,
          overflow: 'hidden',
          maxWidth: isMobile ? 480 : 1180,
          width: '100%',
          boxShadow: '0 30px 90px rgba(17,17,17,0.18)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}>
        {/* Vídeo 9:16 */}
        <div style={{
          flexShrink: 0,
          width: isMobile ? '100%' : 'auto',
          height: isMobile ? 'auto' : 'min(78vh, 760px)',
          aspectRatio: '9 / 16',
          background: '#000',
        }}>
          <iframe
            src={window.mediaPlayer(item, { autoplay: true })}
            allow={window.MEDIA_IFRAME_ALLOW}
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
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: isMobile ? 14 : 20 }}>
            {[item.year, item.subtitle].filter(Boolean).map((x, i) => (
              <span key={i} style={SF_TH.pill}>{x}</span>
            ))}
          </div>

          <h2 style={SF_TH.heading(isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 3vw, 56px)')}>
            {item.title}
          </h2>

          <div style={{ ...SF_TH.label, marginTop: isMobile ? 20 : 32, marginBottom: 8 }}>
            {(window.I18N[lang] || window.I18N.pt).video.descriptionLabel}
          </div>
          <p style={{ ...SF_TH.body(isMobile ? 14 : 15), maxWidth: 460 }}>
            {item.description}
          </p>

          {/* Só faz sentido pra vídeo hospedado no YouTube */}
          {window.mediaSource(item) === 'youtube' && (
            <a
              href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
              target="_blank" rel="noopener noreferrer"
              style={{
                marginTop: isMobile ? 24 : 36,
                alignSelf: 'flex-start',
                ...SF_TH.link, color: SF_PALETTE.muted,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = SF_PALETTE.fg)}
              onMouseLeave={(e) => (e.currentTarget.style.color = SF_PALETTE.muted)}
            >
              Ver no YouTube ↗
            </a>
          )}
        </div>
        </div>

        {/* Color — largura inteira embaixo, pra não esticar a coluna do texto
            e deixar a do vídeo vazia */}
        {window.ColorSection && item.color && (
          <div style={{ padding: isMobile ? '0 20px 28px' : '0 44px 48px' }}>
            <window.ColorSection color={item.color} isMobile={isMobile} lang={lang} compact />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Card vertical flutuante ───────────────────────────────────
// still = sem flutuação (grid da página short-form.html)
function SfCard({ item, index, onOpen, width, still }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={() => onOpen(index)}
      style={{
        width, flexShrink: 0, cursor: 'pointer',
        // Flutuação: cada card sobe/desce com fase própria
        animation: still ? 'none' : `sf-float ${5.5 + (index % 3) * 0.8}s ease-in-out ${index * 0.45}s infinite`,
      }}
    >
      <div style={{
        position: 'relative',
        aspectRatio: '9 / 16',
        background: SF_PALETTE.surface,
        border: `1px solid ${hover ? SF_PALETTE.accent : SF_PALETTE.line}`,
        overflow: 'hidden',
        transition: 'border-color 0.25s, transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        transform: hover ? 'scale(1.02)' : 'scale(1)',
      }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <img
          {...window.mediaThumbProps(item)}
          alt={item.title}
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hover ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
          }}
        />
        <window.HoverPlay hover={hover} hasMedia />
      </div>

      {/* Legenda: título, subtítulo, ano */}
      <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px 12px' }}>
        <div>
          <div style={{ fontFamily: SF_FONTS.sans, fontSize: 13, fontWeight: 500, lineHeight: 1.3, color: SF_PALETTE.fg }}>{item.title}</div>
          {item.subtitle && <div style={{ ...SF_TH.label, marginTop: 2 }}>{item.subtitle}</div>}
        </div>
        <div style={{ ...SF_TH.label, flexShrink: 0 }}>{item.year}</div>
      </div>
    </div>
  );
}

// ─── Seção com scroll horizontal "pinado" ──────────────────────
function ShortformSection({ isMobile, lang }) {
  const { useState, useEffect, useRef } = React;
  // hidden: true tira o vídeo do ar sem apagar os dados dele
  const items = (window.SHORTFORM || []).filter((v) => !v.hidden);
  const [openIndex, setOpenIndex] = useState(null);
  const [maxShift, setMaxShift] = useState(0);

  const wrapRef = useRef(null);
  const trackRef = useRef(null);

  const CARD_W = isMobile ? 230 : 300;
  const GAP = isMobile ? 16 : 32;
  const PAD = isMobile ? 20 : 40;

  const heading = lang === 'pt' ? 'Short-form.' : 'Short-form.';
  // 01 = Trabalhos selecionados, 02 = Projetos, 03 = aqui
  const label = '03, Vertical · Reels · Social';

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
        <div style={{ ...SF_TH.label, marginBottom: 14 }}>{label}</div>
        <h2 style={SF_TH.heading(isMobile ? 'clamp(32px, 9vw, 44px)' : 'clamp(32px, 3.2vw, 56px)')}>{heading}</h2>
      </div>
      <a href="./short-form.html" style={SF_TH.link}
        onMouseEnter={(e) => (e.currentTarget.style.color = SF_PALETTE.accent)}
        onMouseLeave={(e) => (e.currentTarget.style.color = SF_PALETTE.fg)}
      >{lang === 'pt' ? 'Ver tudo ↗' : 'See all ↗'}</a>
    </div>
  );

  const cards = items.map((item, i) => (
    <SfCard key={i} item={item} index={i} onOpen={setOpenIndex} width={CARD_W} />
  ));

  // ── Mobile: rolagem horizontal nativa com snap ──
  if (isMobile) {
    return (
      <section style={{
        padding: `32px 0 48px`,
        borderTop: SF_TH.sectionRule,
      }}>
        <div style={{ padding: `0 ${PAD}px` }}>{Header}</div>
        <div style={{
          marginTop: 8,
          display: 'flex', gap: GAP,
          // overflow-x: auto força overflow-y a "auto" → precisa de folga vertical
          padding: `20px ${PAD}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
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
          lang={lang}
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
        borderTop: SF_TH.sectionRule,
      }}
    >
      <div style={{
        position: 'sticky', top: 0,
        height: '100vh',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        <div style={{ padding: `0 ${PAD}px`, flexShrink: 0 }}>{Header}</div>

        {/* Folga vertical: o recorte horizontal também corta em cima/embaixo,
            e os cards crescem no hover (scale) e flutuam (translateY). */}
        <div style={{ marginTop: 16, padding: '24px 0', overflow: 'hidden' }}>
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
            ...SF_TH.label,
          }}>
            {lang === 'pt' ? '↓ Role para navegar' : '↓ Scroll to browse'}
          </div>
        )}
      </div>

      <ShortformModal
        item={openIndex !== null ? items[openIndex] : null}
        onClose={() => setOpenIndex(null)}
        isMobile={isMobile}
        lang={lang}
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
