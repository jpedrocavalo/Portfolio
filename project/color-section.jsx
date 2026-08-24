/* global React */
/* ════════════════════════════════════════════════════════════════
   BLOCO DE COLOR — compartilhado
   --------------------------------------------------------------
   Usado por:
     • video.html            — abaixo da descrição do trabalho
     • shortform-section.jsx — dentro do modal do short-form

   Alimentado pelo campo `color` do item (videos.js / shortform.js):
     before / after → frames pro comparador arrastável
     nodes          → print da árvore de nodes
     powergrade/lut → créditos da base usada
     breakdown      → vídeo do processo ({ streamId } ou { youtubeId })

   Some inteiro quando nada foi preenchido; o que faltar dentro de um
   bloco já iniciado aparece como espaço reservado.

   Expõe window.ColorSection({ color, isMobile, lang }).
   ════════════════════════════════════════════════════════════════ */

const CS_PALETTE = { bg: '#0a0a0a', fg: '#f5f1e8', muted: '#8a8580', accent: '#7a00d8' };
const CS_FONTS = {
  display: '"Fraunces", serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// Descobre a proporção real da imagem. Assim a moldura se molda ao
// arquivo em vez de recortá-lo: frame vertical, print de node largo,
// cada um entra inteiro sem precisar de configuração.
function useImageRatio(src, fallback) {
  const [ratio, setRatio] = React.useState(null);
  React.useEffect(() => {
    setRatio(null);
    if (!src) return;
    let vivo = true;
    const im = new Image();
    im.onload = () => { if (vivo && im.naturalHeight) setRatio(im.naturalWidth / im.naturalHeight); };
    im.src = src;
    return () => { vivo = false; };
  }, [src]);
  return ratio || fallback;
}

// Limita a altura pra um frame vertical não virar uma coluna gigante.
function molduraFluida(ratio) {
  return {
    width: '100%',
    maxWidth: `min(100%, calc(78vh * ${ratio}))`,
    aspectRatio: String(ratio),
    margin: '0 auto',
  };
}

// Moldura com legenda em cima. Mostra a imagem ou o espaço vazio.
function ColorSlot({ label, src, alt, ratio, isMobile, soonLabel, fit }) {
  const real = useImageRatio(src, null);
  const usada = real || ratio;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
      <div style={{
        fontFamily: CS_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
        textTransform: 'uppercase', color: CS_PALETTE.muted, marginBottom: 10,
      }}>
        {label}
      </div>
      <div style={{
        position: 'relative',
        ...(real ? molduraFluida(real) : { aspectRatio: usada }),
        background: src ? '#000' : `linear-gradient(135deg, ${CS_PALETTE.accent}18, ${CS_PALETTE.fg}06)`,
        border: `1px solid ${CS_PALETTE.fg}1a`,
        overflow: 'hidden',
      }}>
        {src ? (
          <img src={src} alt={alt}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit || 'cover' }} />
        ) : (
          <>
            <div style={{
              position: 'absolute', inset: 0,
              background: `repeating-linear-gradient(90deg, transparent, transparent 26px, ${CS_PALETTE.fg}08 26px, ${CS_PALETTE.fg}08 28px)`,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: CS_FONTS.mono, fontSize: 9, letterSpacing: '0.3em',
              textTransform: 'uppercase', color: 'rgba(245,241,232,0.3)',
            }}>
              {soonLabel}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Comparador antes/depois: as duas imagens sobrepostas, com uma divisória
// arrastável. A da esquerda é o "antes", recortada até a posição da alça.
function BeforeAfterSlider({ before, after, labelBefore, labelAfter, isMobile }) {
  const [pos, setPos] = React.useState(50);
  // O ref é a fonte da verdade do arrasto; o state só muda o cursor.
  // Depender do state aqui abriria uma corrida: entre soltar e o React
  // re-renderizar, o listener antigo ainda pegaria um pointermove.
  const draggingRef = React.useRef(false);
  const [dragging, setDragging] = React.useState(false);
  const boxRef = React.useRef(null);

  const posFromX = React.useCallback((clientX) => {
    const el = boxRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  }, []);

  React.useEffect(() => {
    const move = (e) => { if (draggingRef.current) posFromX(e.clientX); };
    const stop = () => { draggingRef.current = false; setDragging(false); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [posFromX]);

  const onKeyDown = (e) => {
    const passo = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') { setPos((p) => Math.max(0, p - passo)); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPos((p) => Math.min(100, p + passo)); e.preventDefault(); }
    if (e.key === 'Home') { setPos(0); e.preventDefault(); }
    if (e.key === 'End') { setPos(100); e.preventDefault(); }
  };

  // A moldura assume a proporção do arquivo — serve frame 16:9 e vertical
  // sem recortar nenhum dos dois.
  const ratio = useImageRatio(after, null) || 16 / 9;

  const imgStyle = {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    objectFit: 'cover', userSelect: 'none', pointerEvents: 'none',
  };

  const tag = (lado) => ({
    position: 'absolute', top: 12, [lado]: 12,
    padding: '5px 9px',
    background: 'rgba(10,10,10,0.6)',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
    fontFamily: CS_FONTS.mono, fontSize: 9, letterSpacing: '0.25em',
    textTransform: 'uppercase', color: 'rgba(245,241,232,0.9)',
    pointerEvents: 'none',
  });

  return (
    <div
      ref={boxRef}
      role="slider"
      tabIndex={0}
      aria-label={`${labelBefore} / ${labelAfter}`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pos)}
      onPointerDown={(e) => { draggingRef.current = true; setDragging(true); posFromX(e.clientX); }}
      onKeyDown={onKeyDown}
      style={{
        position: 'relative',
        ...molduraFluida(ratio),
        background: '#000',
        border: `1px solid ${CS_PALETTE.fg}1a`,
        overflow: 'hidden',
        cursor: dragging ? 'grabbing' : 'ew-resize',
        // pan-y deixa o dedo rolar a página na vertical e só captura o
        // arrasto horizontal, que é o que a divisória usa.
        touchAction: 'pan-y',
        outline: 'none',
      }}
    >
      {/* Depois — base, ocupa tudo */}
      <img src={after} alt={labelAfter} draggable={false} style={imgStyle} />

      {/* Antes — por cima, recortada até a divisória */}
      <img
        src={before} alt={labelBefore} draggable={false}
        style={{ ...imgStyle, clipPath: `inset(0 ${100 - pos}% 0 0)` }}
      />

      <div style={tag('left')}>{labelBefore}</div>
      <div style={tag('right')}>{labelAfter}</div>

      {/* Divisória */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: `${pos}%`,
        width: 2, marginLeft: -1,
        background: CS_PALETTE.fg,
        boxShadow: '0 0 12px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
      }} />

      {/* Alça */}
      <div style={{
        position: 'absolute', top: '50%', left: `${pos}%`,
        transform: 'translate(-50%, -50%)',
        width: isMobile ? 36 : 42, height: isMobile ? 36 : 42,
        borderRadius: '50%',
        border: `1.5px solid ${CS_PALETTE.fg}`,
        background: 'rgba(10,10,10,0.55)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 5,
        color: CS_PALETTE.fg, fontSize: 11, lineHeight: 1,
        pointerEvents: 'none',
      }}>
        <span>‹</span><span>›</span>
      </div>
    </div>
  );
}

// Linha de crédito da base usada no tratamento (PowerGrade, LUT...).
// Some quando o campo não foi preenchido; vira link quando tem url.
function CreditoBase({ label, item, primeiro }) {
  if (!item || !item.name) return null;
  return (
    <div style={{
      marginTop: primeiro ? 12 : 6,
      fontFamily: CS_FONTS.mono, fontSize: 10, letterSpacing: '0.2em',
      textTransform: 'uppercase', color: CS_PALETTE.muted,
    }}>
      {label}:{' '}
      {item.url ? (
        <a
          href={item.url}
          target="_blank" rel="noopener noreferrer"
          style={{ color: CS_PALETTE.fg, textDecoration: 'none', borderBottom: `1px solid ${CS_PALETTE.fg}40` }}
          onMouseEnter={(e) => { e.currentTarget.style.color = CS_PALETTE.accent; e.currentTarget.style.borderBottomColor = CS_PALETTE.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = CS_PALETTE.fg; e.currentTarget.style.borderBottomColor = CS_PALETTE.fg + '40'; }}
        >
          {item.name} ↗
        </a>
      ) : item.name}
    </div>
  );
}

// compact = dentro do modal do short-form, onde o espaço é menor.
function ColorSection({ color, isMobile, lang, compact }) {
  const T = (window.I18N && window.I18N[lang]) || window.I18N.pt;
  if (!color) return null;

  const breakdown = color.breakdown;
  const temAlgo = !!(color.before || color.after || color.nodes || window.hasMedia(breakdown));
  if (!temAlgo) return null;

  const t = T.colorGrade;

  return (
    <div style={{
      width: '100%',
      maxWidth: compact ? '100%' : 1100,
      marginTop: compact ? 32 : (isMobile ? 48 : 80),
      paddingTop: compact ? 26 : (isMobile ? 40 : 56),
      borderTop: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        fontFamily: CS_FONTS.mono, fontSize: 11, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: CS_PALETTE.accent, marginBottom: 14,
      }}>
        {t.label}
      </div>
      {/* Inter, não Fraunces: o bloco é técnico e o serifado editorial
          fica reservado pro título do trabalho. */}
      <h2 style={{
        fontFamily: CS_FONTS.sans,
        fontSize: compact
          ? (isMobile ? '20px' : '24px')
          : (isMobile ? 'clamp(24px, 6.5vw, 32px)' : 'clamp(28px, 2.6vw, 44px)'),
        fontWeight: 500,
        letterSpacing: '-0.02em', lineHeight: 1.05, margin: 0,
      }}>
        {t.heading}
      </h2>

      {/* Antes / depois. Com as duas imagens vira comparador arrastável;
          faltando alguma, cai nas molduras lado a lado pra mostrar o que
          ainda não foi preenchido. */}
      <div style={{ marginTop: compact ? 22 : (isMobile ? 32 : 44) }}>
        {color.before && color.after ? (
          <>
            <div style={{
              fontFamily: CS_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
              textTransform: 'uppercase', color: CS_PALETTE.muted, marginBottom: 10,
            }}>
              {t.before} / {t.after} — {t.drag}
            </div>
            <BeforeAfterSlider
              before={color.before}
              after={color.after}
              labelBefore={t.before}
              labelAfter={t.after}
              isMobile={isMobile}
            />
          </>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 20 : 24,
          }}>
            <ColorSlot label={t.before} src={color.before} alt={t.before}
              ratio="16 / 9" isMobile={isMobile} soonLabel={t.soon} />
            <ColorSlot label={t.after} src={color.after} alt={t.after}
              ratio="16 / 9" isMobile={isMobile} soonLabel={t.soon} />
          </div>
        )}
      </div>

      {/* Estrutura de nodes — contain pra não cortar nenhum node */}
      <div style={{ marginTop: isMobile ? 24 : 32 }}>
        <ColorSlot label={t.nodes} src={color.nodes} alt={t.nodes}
          ratio={isMobile ? '16 / 9' : '21 / 9'} isMobile={isMobile}
          soonLabel={t.soon} fit="contain" />

        {/* Base usada — fica com os nodes porque é parte deles */}
        <CreditoBase label={t.powergrade} item={color.powergrade} primeiro />
        <CreditoBase label={t.lut} item={color.lut} />
      </div>

      {/* Vídeo do breakdown. Só entra quando o trabalho declara o campo:
          sem a chave `breakdown`, nem o espaço reservado aparece. */}
      {breakdown && (
      <div style={{ marginTop: isMobile ? 24 : 32 }}>
        <div style={{
          fontFamily: CS_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
          textTransform: 'uppercase', color: CS_PALETTE.muted, marginBottom: 10,
        }}>
          {t.breakdown}
        </div>
        <div style={{
          position: 'relative', aspectRatio: '16 / 9',
          background: `linear-gradient(135deg, ${CS_PALETTE.accent}18, ${CS_PALETTE.fg}06)`,
          border: `1px solid ${CS_PALETTE.fg}1a`,
          overflow: 'hidden',
        }}>
          {window.hasMedia(breakdown) ? (
            <iframe
              src={window.mediaPlayer(breakdown)}
              allow={window.MEDIA_IFRAME_ALLOW}
              allowFullScreen
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
            />
          ) : (
            <>
              <div style={{
                position: 'absolute', inset: 0,
                background: `repeating-linear-gradient(90deg, transparent, transparent 32px, ${CS_PALETTE.fg}08 32px, ${CS_PALETTE.fg}08 34px)`,
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: CS_FONTS.mono, fontSize: 9, letterSpacing: '0.3em',
                textTransform: 'uppercase', color: 'rgba(245,241,232,0.3)',
              }}>
                {t.soon}
              </div>
            </>
          )}
        </div>
      </div>
      )}
    </div>
  );
}


window.ColorSection = ColorSection;
