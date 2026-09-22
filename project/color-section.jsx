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

const CS_TH = window.THEME;
const CS_PALETTE = CS_TH.palette;
const CS_FONTS = CS_TH.fonts;

// Rótulo pequeno acima de cada moldura
const CS_LABEL = { ...CS_TH.label, marginBottom: 8 };

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
      <div style={CS_LABEL}>{label}</div>
      <div style={{
        position: 'relative',
        ...(real ? molduraFluida(real) : { aspectRatio: usada }),
        background: src ? '#000' : CS_PALETTE.surface,
        border: `1px solid ${CS_PALETTE.line}`,
        overflow: 'hidden',
      }}>
        {src ? (
          <img src={src} alt={alt}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: fit || 'cover' }} />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            ...CS_TH.label,
          }}>
            {soonLabel}
          </div>
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
    ...CS_TH.pill,
    position: 'absolute', top: 12, [lado]: 12,
    background: 'rgba(245,244,240,0.9)',
    borderColor: 'transparent',
    backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
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
        border: `1px solid ${CS_PALETTE.line}`,
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
        background: CS_PALETTE.bg,
        boxShadow: '0 0 12px rgba(0,0,0,0.45)',
        pointerEvents: 'none',
      }} />

      {/* Alça */}
      <div style={{
        position: 'absolute', top: '50%', left: `${pos}%`,
        transform: 'translate(-50%, -50%)',
        width: isMobile ? 36 : 42, height: isMobile ? 36 : 42,
        borderRadius: '50%',
        border: `1px solid ${CS_PALETTE.line}`,
        background: 'rgba(245,244,240,0.92)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 5,
        color: CS_PALETTE.fg, fontSize: 12, lineHeight: 1,
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
    <div style={{ ...CS_TH.label, fontSize: 12, marginTop: primeiro ? 12 : 6 }}>
      {label}:{' '}
      {item.url ? (
        <a
          href={item.url}
          target="_blank" rel="noopener noreferrer"
          style={{ color: CS_PALETTE.fg, fontWeight: 500, textDecoration: 'none', borderBottom: `1px solid ${CS_PALETTE.line}` }}
          onMouseEnter={(e) => { e.currentTarget.style.color = CS_PALETTE.accent; e.currentTarget.style.borderBottomColor = CS_PALETTE.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = CS_PALETTE.fg; e.currentTarget.style.borderBottomColor = CS_PALETTE.line; }}
        >
          {item.name} ↗
        </a>
      ) : <span style={{ color: CS_PALETTE.fg, fontWeight: 500 }}>{item.name}</span>}
    </div>
  );
}

// compact = dentro do modal do short-form, onde o espaço é menor.
function ColorSection({ color, isMobile, lang, compact }) {
  const T = (window.I18N && window.I18N[lang]) || window.I18N.pt;
  if (!color) return null;

  const breakdown = color.breakdown;

  // Comparações. Um look aplicado a várias câmeras vira uma lista em
  // `comparisons`, cada uma com rótulo; o par solto before/after continua
  // valendo como o caso de uma só.
  const comparacoes = (color.comparisons && color.comparisons.length)
    ? color.comparisons
    : [{ label: '', before: color.before, after: color.after }];
  const temComparacao = comparacoes.some((c) => c.before || c.after);

  const temAlgo = !!(temComparacao || color.nodes || window.hasMedia(breakdown));
  if (!temAlgo) return null;

  const t = T.colorGrade;

  return (
    <div style={{
      width: '100%',
      maxWidth: compact ? '100%' : 'none',
      marginTop: compact ? 32 : (isMobile ? 48 : 72),
      paddingTop: compact ? 26 : (isMobile ? 32 : 40),
      borderTop: CS_TH.sectionRule,
    }}>
      <div style={{ ...CS_TH.label, marginBottom: 14 }}>{t.label}</div>
      <h2 style={CS_TH.heading(compact
        ? (isMobile ? '22px' : '28px')
        : (isMobile ? 'clamp(28px, 8vw, 40px)' : 'clamp(32px, 3.2vw, 56px)'))}>
        {t.heading}
      </h2>

      {/* Antes / depois, uma comparação por câmera. Com as duas imagens
          vira comparador arrastável; faltando alguma, cai nas molduras
          lado a lado pra mostrar o que ainda não foi preenchido. */}
      {comparacoes.map((cmp, i) => {
        return (
          <div key={i} style={{ marginTop: i === 0 ? (compact ? 22 : (isMobile ? 32 : 44)) : (isMobile ? 24 : 32) }}>
            {cmp.before && cmp.after ? (
              <>
                <div style={CS_LABEL}>
                  {cmp.label && <span style={{ color: CS_PALETTE.fg, fontWeight: 500 }}>{cmp.label}</span>}
                  {cmp.label && ', '}
                  {t.before} / {t.after}, {t.drag}
                </div>
                <BeforeAfterSlider
                  before={cmp.before}
                  after={cmp.after}
                  labelBefore={t.before}
                  labelAfter={t.after}
                  isMobile={isMobile}
                />
              </>
            ) : (
              <>
                {cmp.label && (
                  <div style={{ ...CS_LABEL, color: CS_PALETTE.fg, fontWeight: 500 }}>
                    {cmp.label}
                  </div>
                )}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: isMobile ? 20 : 24,
                }}>
                  <ColorSlot label={t.before} src={cmp.before} alt={t.before}
                    ratio="16 / 9" isMobile={isMobile} soonLabel={t.soon} />
                  <ColorSlot label={t.after} src={cmp.after} alt={t.after}
                    ratio="16 / 9" isMobile={isMobile} soonLabel={t.soon} />
                </div>
              </>
            )}
          </div>
        );
      })}

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
        <div style={CS_LABEL}>{t.breakdown}</div>
        <div style={{
          // Mesma moldura do print de nodes: limitada pela altura da tela
          position: 'relative', ...molduraFluida(16 / 9),
          background: CS_PALETTE.surface,
          border: `1px solid ${CS_PALETTE.line}`,
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
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...CS_TH.label,
            }}>
              {t.soon}
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}


window.ColorSection = ColorSection;
