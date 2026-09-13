/* global React */

function ContactModal({ open, onClose, lang }) {
  const { useEffect, useState } = React;
  const TH = window.THEME;
  const P = TH.palette;
  const backLabel = lang === 'pt' ? 'Voltar' : 'Back';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const optionStyle = (hover) => ({
    ...TH.heading('clamp(40px, 8vw, 112px)'),
    color: hover ? P.accent : P.fg,
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
    transition: 'color 0.25s',
    cursor: 'pointer',
  });

  const ArrowSpan = () => (
    <span style={{ fontSize: '0.3em', fontWeight: 400, opacity: 0.6 }}>↗</span>
  );

  function HoverLink({ href, children }) {
    const [hover, setHover] = useState(false);
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={optionStyle(hover)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {children}
        <ArrowSpan />
      </a>
    );
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(245,244,240,0.9)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Botão voltar — topo esquerdo */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, left: 40,
          background: 'none', border: 'none', padding: 0,
          ...TH.link,
          color: P.muted,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = P.fg)}
        onMouseLeave={(e) => (e.currentTarget.style.color = P.muted)}
      >
        ← {backLabel}
      </button>

      {/* Opções */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start', padding: '0 40px' }}
      >
        <HoverLink href="https://wa.me/5584988370946">WhatsApp</HoverLink>
        <HoverLink href="https://mail.google.com/mail/?view=cm&fs=1&to=jotapfilms@gmail.com">E-mail</HoverLink>
      </div>
    </div>
  );
}

window.ContactModal = ContactModal;
