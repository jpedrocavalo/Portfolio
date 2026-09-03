/* global React */
/* ════════════════════════════════════════════════════════════════
   PROJETOS — seção de capas na home
   --------------------------------------------------------------
   Cada capa leva pra project.html?p=<índice>, que lista os vídeos
   daquele projeto. Dados vêm de projects.js (window.PROJECTS).

   Expõe window.ProjectsSection({ isMobile, lang }).
   ════════════════════════════════════════════════════════════════ */

const PJ_PALETTE = { bg: '#0a0a0a', fg: '#f5f1e8', muted: '#8a8580', accent: '#7a00d8' };
const PJ_FONTS = {
  display: '"Fraunces", serif',
  sans: '"Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", monospace',
};

// Capa do primeiro vídeo do projeto — a reserva quando não há arte própria.
function capaDoPrimeiroVideo(proj) {
  const primeiro = ((proj && proj.videos) || [])
    .filter((v) => !v.hidden)
    .find((v) => window.hasMedia(v));
  return primeiro ? window.mediaThumb(primeiro) : '';
}

// Capa do projeto: a imagem própria, senão a do primeiro vídeo.
window.projectCover = function (proj) {
  if (!proj) return '';
  return proj.cover || capaDoPrimeiroVideo(proj);
};

function ProjectCard({ proj, index, isMobile, lang }) {
  const [hover, setHover] = React.useState(false);
  // Quando a arte própria falha e entra a capa do vídeo, o tratamento de
  // logo não vale mais: frame de vídeo pede preencher e escurecer.
  const [usouReserva, setUsouReserva] = React.useState(false);
  const capa = window.projectCover(proj);
  // coverFit 'contain' = arte/logo: mostra inteiro em vez de preencher cortando
  const ehLogo = proj.coverFit === 'contain' && !usouReserva;
  const fit = ehLogo ? 'contain' : 'cover';
  // Só os que estão no ar, pra bater com a contagem da página do projeto
  const qtd = (proj.videos || []).filter((v) => !v.hidden).length;
  const T = (window.I18N && window.I18N[lang]) || window.I18N.pt;
  const t = T.projects;

  return (
    <a
      href={`./project.html?p=${index}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column',
        textDecoration: 'none', color: 'inherit', cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'relative',
        aspectRatio: '4 / 3',
        background: `linear-gradient(135deg, ${PJ_PALETTE.accent}22, ${PJ_PALETTE.fg}08)`,
        border: `1px solid ${hover ? PJ_PALETTE.accent : PJ_PALETTE.fg + '1a'}`,
        overflow: 'hidden',
        transition: 'border-color 0.25s, transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        transform: hover ? 'scale(1.02)' : 'scale(1)',
      }}>
        {capa ? (
          <img
            src={capa} alt={proj.title}
            // Se a arte não existir no caminho indicado, cai na capa do
            // primeiro vídeo em vez de deixar imagem quebrada.
            onError={(e) => {
              const reserva = capaDoPrimeiroVideo(proj);
              e.currentTarget.onerror = null;
              if (reserva && e.currentTarget.src !== reserva) {
                e.currentTarget.src = reserva;
                setUsouReserva(true);
              }
            }}
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: fit,
              // Logo precisa ficar legível: não escurece, e respira nas bordas.
              padding: ehLogo ? (isMobile ? 28 : 40) : 0,
              filter: ehLogo
                ? 'none'
                : (hover ? 'grayscale(0) brightness(0.75)' : 'grayscale(0.35) brightness(0.5)'),
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1), filter 0.4s',
            }}
          />
        ) : (
          <div style={{
            position: 'absolute', inset: 0,
            background: `repeating-linear-gradient(90deg, transparent, transparent 28px, ${PJ_PALETTE.fg}08 28px, ${PJ_PALETTE.fg}08 30px)`,
          }} />
        )}

        {/* Vinheta pro nome ficar legível sobre qualquer imagem.
            Sobre um logo, só a faixa de baixo — o resto lavaria a arte. */}
        <div style={{
          position: 'absolute', inset: 0,
          background: ehLogo
            ? 'linear-gradient(to bottom, transparent 55%, rgba(0,0,0,0.75) 100%)'
            : 'linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, transparent 45%, rgba(0,0,0,0.8) 100%)',
        }} />

        {/* Nome do projeto sobre a capa */}
        <div style={{
          position: 'absolute', inset: 0,
          padding: isMobile ? 18 : 24,
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: PJ_FONTS.mono, fontSize: 10, letterSpacing: '0.3em',
            textTransform: 'uppercase', color: 'rgba(245,241,232,0.7)',
          }}>
            {proj.year}
          </div>
          <div>
            <h3 style={{
              fontFamily: PJ_FONTS.display, fontStyle: 'italic', fontWeight: 300,
              fontSize: isMobile ? 'clamp(24px, 7vw, 32px)' : 'clamp(28px, 2.4vw, 44px)',
              lineHeight: 1, letterSpacing: '-0.02em', margin: 0, color: '#fff',
              transform: hover ? 'translateX(6px)' : 'translateX(0)',
              transition: 'transform 0.4s cubic-bezier(0.2,0.8,0.2,1)',
            }}>
              {proj.title}
            </h3>
            <div style={{
              marginTop: 8,
              display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12,
              fontFamily: PJ_FONTS.mono, fontSize: 10, letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: hover ? PJ_PALETTE.accent : 'rgba(245,241,232,0.55)',
              transition: 'color 0.25s',
            }}>
              <span>{proj.subtitle || ''}</span>
              <span style={{ flexShrink: 0 }}>
                {qtd > 0 ? `${qtd} ${qtd === 1 ? t.videoSingular : t.videoPlural}` : t.soon}
              </span>
            </div>
          </div>
        </div>
      </div>
    </a>
  );
}

function ProjectsSection({ isMobile, lang }) {
  const projetos = window.PROJECTS || [];
  if (!projetos.length) return null;

  const T = (window.I18N && window.I18N[lang]) || window.I18N.pt;
  const t = T.projects;

  return (
    <section id="projects" style={{
      width: '100%',
      padding: isMobile ? '56px 20px 64px' : '80px 40px 96px',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{
        fontFamily: PJ_FONTS.mono, fontSize: 11, letterSpacing: '0.3em',
        textTransform: 'uppercase', color: 'rgba(245,241,232,0.35)', marginBottom: 14,
      }}>
        {t.label}
      </div>
      <h2 style={{
        fontFamily: PJ_FONTS.display,
        fontSize: isMobile ? 'clamp(36px, 11vw, 56px)' : 'clamp(48px, 5vw, 92px)',
        fontWeight: 300, lineHeight: 0.95, letterSpacing: '-0.04em', margin: 0,
      }}>
        {t.heading}
      </h2>

      <div style={{
        marginTop: isMobile ? 28 : 40,
        display: 'grid',
        // Capas grandes: no máximo 3 por linha, e uma só ocupa metade
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: isMobile ? 20 : 24,
      }}>
        {projetos.map((p, i) => (
          <ProjectCard key={i} proj={p} index={i} isMobile={isMobile} lang={lang} />
        ))}
      </div>
    </section>
  );
}

window.ProjectsSection = ProjectsSection;
