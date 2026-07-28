/* global React */

function ContactModal({ open, onClose, lang }) {
  const { useEffect, useState } = React;
  const T = (window.I18N && window.I18N[lang]) || {};
  const backLabel = lang === 'pt' ? 'Voltar' : 'Back';

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const optionStyle = (hover) => ({
    fontFamily: '"Fraunces", serif',
    fontStyle: 'italic',
    fontWeight: 300,
    fontSize: 'clamp(48px, 8vw, 120px)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
    color: hover ? '#7a00d8' : '#f5f1e8',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
    transition: 'color 0.25s',
    cursor: 'pointer',
  });

  const ArrowSpan = () => (
    <span style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontStyle: 'normal',
      fontSize: '0.3em',
      letterSpacing: '0.1em',
      verticalAlign: 'middle',
      opacity: 0.6,
    }}>↗</span>
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
        background: 'rgba(10,10,10,0.92)',
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
          position: 'absolute', top: 28, left: 40,
          background: 'none', border: 'none',
          color: 'rgba(245,241,232,0.55)',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11, letterSpacing: '0.2em',
          textTransform: 'uppercase', cursor: 'pointer',
          padding: 0,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#f5f1e8')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(245,241,232,0.55)')}
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
