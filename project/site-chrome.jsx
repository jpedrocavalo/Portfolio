/* global React */
/* ════════════════════════════════════════════════════════════════
   MOLDURA DO SITE — cabeçalho, chamada de contato e rodapé
   --------------------------------------------------------------
   As mesmas peças em todas as páginas, pra mudar num lugar só.

   Expõe:
     window.useIsMobile()
     window.SiteHeader({ current, lang, setLang, onContactOpen })
       current: 'reel' | 'works' | 'about' — qual item fica em negrito
     window.ContactCta({ lang, isMobile })   — "Vamos conversar."
     window.SiteFooter({ lang })             — linha final com o ©
     window.HoverPlay({ hover, hasMedia })   — véu escuro + play nos cards
     window.Seta()                           — a seta ↘ que abre os títulos
   ════════════════════════════════════════════════════════════════ */

const TH = window.THEME;
const CH_P = TH.palette;
const CH_F = TH.fonts;

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

// Seta que abre os blocos de título, como na referência.
function Seta({ size }) {
  const s = size || 22;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: 'block', color: CH_P.fg }}>
      <path d="M5 5 L19 19 M19 8 V19 H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
    </svg>
  );
}

function NavItem({ href, label, active, last, onClick }) {
  const [hover, setHover] = React.useState(false);
  const style = {
    color: active || hover ? CH_P.fg : CH_P.muted,
    fontWeight: active ? 600 : 400,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'color 0.2s',
  };
  const inner = <>{label}{last ? '' : ','}</>;
  return href
    ? <a href={href} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{inner}</a>
    : <span onClick={onClick} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{inner}</span>;
}

function SiteHeader({ current, lang, setLang, onContactOpen }) {
  const isMobile = useIsMobile();
  const N = window.I18N[lang].nav;
  const items = [
    { key: 'reel',  href: './index.html', label: N.reel },
    { key: 'works', href: './works.html', label: N.works },
    { key: 'about', href: './about.html', label: N.about },
  ];
  // No mobile não cabe tudo: some o item da página atual.
  const shown = isMobile ? items.filter((it) => it.key !== current) : items;

  const langBtn = (code) => (
    <span
      onClick={() => setLang(code)}
      style={{
        cursor: 'pointer',
        color: lang === code ? CH_P.fg : CH_P.muted,
        fontWeight: lang === code ? 600 : 400,
        transition: 'color 0.2s',
      }}
    >{code.toUpperCase()}</span>
  );

  const nav = (
    <div style={{ display: 'flex', gap: 6 }}>
      {shown.map((it, i) => (
        <NavItem key={it.key} href={it.href} label={it.label}
          active={it.key === current} last={i === shown.length - 1} />
      ))}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 20,
      padding: isMobile ? '16px 20px' : '20px 40px',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      fontFamily: CH_F.sans, fontSize: 13, lineHeight: 1,
      color: CH_P.fg,
      background: 'rgba(245,244,240,0.86)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
    }}>
      <a href="./index.html" style={{
        fontWeight: 600, color: CH_P.fg, textDecoration: 'none', letterSpacing: '-0.01em',
      }}>Jotap Films<sup style={{ fontSize: 8, marginLeft: 1, fontWeight: 500 }}>®</sup></a>

      {!isMobile && (
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
          {nav}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 16 : 28 }}>
        {isMobile && nav}
        <span style={{ display: 'flex', gap: 5, fontSize: 11 }}>
          {langBtn('pt')}<span style={{ color: CH_P.muted }}>/</span>{langBtn('en')}
        </span>
        {!isMobile && (
          <span onClick={onContactOpen} style={{ cursor: 'pointer', fontWeight: 500 }}>{N.contact}</span>
        )}
      </div>
    </div>
  );
}

// Véu escuro + triângulo de play que aparecem no hover dos cards.
function HoverPlay({ hover, hasMedia }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: hover ? 'rgba(17,17,17,0.28)' : 'rgba(17,17,17,0)',
      transition: 'background 0.25s',
    }}>
      <div style={{
        width: 0, height: 0,
        borderLeft: `18px solid ${hover ? CH_P.accent : 'rgba(255,255,255,0.92)'}`,
        borderTop: '12px solid transparent',
        borderBottom: '12px solid transparent',
        marginLeft: 5,
        opacity: hover ? 1 : (hasMedia ? 0 : 0.5),
        transform: hover ? 'scale(1)' : 'scale(0.7)',
        transition: 'opacity 0.25s, transform 0.25s, border-color 0.25s',
      }} />
    </div>
  );
}

function PillButton({ href, filled, children }) {
  const [hover, setHover] = React.useState(false);
  const base = TH.button(filled);
  const style = hover
    ? { ...base, background: filled ? CH_P.accent : CH_P.fg, borderColor: filled ? CH_P.accent : CH_P.fg, color: CH_P.bg }
    : base;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={style}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      {children}
    </a>
  );
}

// Chamada de contato no fim das páginas.
function ContactCta({ lang, isMobile }) {
  const t = window.I18N[lang].contact;
  return (
    <section id="contact" style={{
      padding: isMobile ? '80px 20px 72px' : '140px 40px 120px',
      borderTop: TH.sectionRule,
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
      gap: isMobile ? 28 : 40,
      alignItems: 'end',
    }}>
      <div>
        <div style={{ ...TH.label, marginBottom: 18 }}>{t.smallLabel}</div>
        <h2 style={TH.heading(isMobile ? 'clamp(40px, 12vw, 64px)' : 'clamp(48px, 6vw, 104px)')}>
          {t.headingA} {t.headingB}.
        </h2>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'flex-start' : 'flex-end', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <PillButton href="https://wa.me/5584988370946" filled>WhatsApp <span>↗</span></PillButton>
          <PillButton href="https://mail.google.com/mail/?view=cm&fs=1&to=jotapfilms@gmail.com">jotapfilms@gmail.com <span>↗</span></PillButton>
        </div>
        <div style={TH.label}>{t.openFor}</div>
      </div>
    </section>
  );
}

function SiteFooter({ lang }) {
  const t = window.I18N[lang].footer;
  return (
    <footer style={{
      padding: '24px 40px',
      borderTop: TH.sectionRule,
      display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
      ...TH.label,
    }}>
      <span style={{ color: CH_P.fg, fontWeight: 600 }}>Jotap Films<sup style={{ fontSize: 7, marginLeft: 1 }}>®</sup></span>
      <span>{t.rightsReserved}</span>
    </footer>
  );
}

window.useIsMobile = useIsMobile;
window.Seta = Seta;
window.SiteHeader = SiteHeader;
window.HoverPlay = HoverPlay;
window.PillButton = PillButton;
window.ContactCta = ContactCta;
window.SiteFooter = SiteFooter;
