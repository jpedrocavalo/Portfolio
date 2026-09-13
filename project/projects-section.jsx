/* global React */
/* ════════════════════════════════════════════════════════════════
   PROJETOS — seção de capas na home
   --------------------------------------------------------------
   Cada capa leva pra project.html?p=<índice>, que lista os vídeos
   daquele projeto. Dados vêm de projects.js (window.PROJECTS).

   Expõe window.ProjectsSection({ isMobile, lang }).
   ════════════════════════════════════════════════════════════════ */

const PJ_TH = window.THEME;
const PJ_PALETTE = PJ_TH.palette;
const PJ_FONTS = PJ_TH.fonts;

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
  // logo não vale mais: frame de vídeo pede preencher.
  const [usouReserva, setUsouReserva] = React.useState(false);
  const capa = window.projectCover(proj);
  // coverFit 'contain' = arte/logo: mostra inteiro em vez de preencher cortando
  const ehLogo = proj.coverFit === 'contain' && !usouReserva;
  const fit = ehLogo ? 'contain' : 'cover';
  // Só os que estão no ar, pra bater com a contagem da página do projeto
  const qtd = (proj.videos || []).filter((v) => !v.hidden).length;
  const T = (window.I18N && window.I18N[lang]) || window.I18N.pt;
  const t = T.projects;
  const contagem = qtd > 0 ? `${qtd} ${qtd === 1 ? t.videoSingular : t.videoPlural}` : t.soon;

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
        background: PJ_PALETTE.surface,
        border: `1px solid ${hover ? PJ_PALETTE.accent : PJ_PALETTE.line}`,
        overflow: 'hidden',
        transition: 'border-color 0.25s, transform 0.5s cubic-bezier(0.2,0.8,0.2,1)',
        transform: hover ? 'scale(1.02)' : 'scale(1)',
      }}>
        {capa && (
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
              // Logo respira nas bordas
              padding: ehLogo ? (isMobile ? 28 : 40) : 0,
              transform: hover ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.6s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          />
        )}
        {/* Véu leve no hover, sem play: capa abre uma lista, não um vídeo */}
        <div style={{
          position: 'absolute', inset: 0,
          background: hover ? 'rgba(17,17,17,0.18)' : 'rgba(17,17,17,0)',
          transition: 'background 0.25s',
        }} />
      </div>

      {/* Nome e ficha abaixo da capa, como nos outros cards */}
      <div style={{
        marginTop: 10,
        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'baseline', gap: '4px 12px',
      }}>
        <div>
          <div style={{ fontFamily: PJ_FONTS.sans, fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: PJ_PALETTE.fg }}>
            {proj.title}
          </div>
          {proj.subtitle && (
            <div style={{ ...PJ_TH.label, marginTop: 2 }}>{proj.subtitle}</div>
          )}
        </div>
        <div style={{ ...PJ_TH.label, flexShrink: 0, textAlign: 'right' }}>
          {[proj.year, contagem].filter(Boolean).join(', ')}
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
      scrollMarginTop: 56,
      width: '100%',
      padding: isMobile ? '32px 20px 48px' : '32px 40px 64px',
      borderTop: PJ_TH.sectionRule,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <div style={PJ_TH.label}>{t.label}</div>
      </div>
      <h2 style={{ ...PJ_TH.heading(isMobile ? 'clamp(32px, 9vw, 44px)' : 'clamp(32px, 3.2vw, 56px)'), marginTop: 14 }}>
        {t.heading}
      </h2>

      <div style={{
        marginTop: isMobile ? 20 : 28,
        display: 'grid',
        // Capas grandes: no máximo 3 por linha
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
