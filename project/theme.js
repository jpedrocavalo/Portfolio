/* ════════════════════════════════════════════════════════════════
   TEMA — cores e fontes de todo o site, num lugar só
   --------------------------------------------------------------
   Carregado por todas as páginas antes do Babel, como i18n.js.
   As páginas e os componentes leem daqui; pra mudar a cara do site
   inteiro, mexa aqui.

   Estilo: fundo claro, tipografia sem serifa, rótulos pequenos em
   cinza, linhas finas separando as seções. O roxo fica só pra
   estados de hover.
   ════════════════════════════════════════════════════════════════ */
(function () {
  const palette = {
    bg:       '#f5f4f0',            // papel: quase branco, um toque quente
    surface:  '#e9e8e3',            // moldura vazia, placeholder de capa
    fg:       '#111111',
    muted:    '#7c7c77',
    line:     'rgba(17,17,17,0.14)', // hairline padrão
    lineSoft: 'rgba(17,17,17,0.08)', // hairline entre seções
    accent:   '#7a00d8',            // só em hover
  };

  const sans = '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const fonts = { display: sans, sans, mono: sans };

  // Rótulo pequeno em cinza ("Descrição", "01, Trabalhos selecionados")
  const label = {
    fontFamily: sans,
    fontSize: 11,
    lineHeight: 1.4,
    letterSpacing: '0.01em',
    color: palette.muted,
  };

  // Título de seção/página: pesado, apertado
  const heading = (size) => ({
    fontFamily: sans,
    fontSize: size,
    fontWeight: 600,
    lineHeight: 1.02,
    letterSpacing: '-0.035em',
    margin: 0,
    color: palette.fg,
  });

  // Corpo de texto (descrições, bio)
  const body = (size) => ({
    fontFamily: sans,
    fontSize: size,
    lineHeight: 1.55,
    color: palette.fg,
    margin: 0,
    whiteSpace: 'pre-line',
  });

  // Etiqueta com contorno (ano, categoria) — o toque da segunda referência
  const pill = {
    display: 'inline-block',
    padding: '4px 10px',
    border: `1px solid ${palette.line}`,
    borderRadius: 999,
    fontFamily: sans,
    fontSize: 10,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    lineHeight: 1.3,
    color: palette.fg,
    whiteSpace: 'nowrap',
  };

  // Botão em forma de pílula. filled = preto; senão, só contorno.
  const button = (filled) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 10,
    padding: '14px 22px',
    borderRadius: 999,
    border: `1px solid ${palette.fg}`,
    background: filled ? palette.fg : 'transparent',
    color: filled ? palette.bg : palette.fg,
    fontFamily: sans,
    fontSize: 13,
    fontWeight: 500,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'background 0.25s, color 0.25s, border-color 0.25s',
  });

  // Link pequeno em texto ("Ver tudo ↗", "← Voltar")
  const link = {
    fontFamily: sans,
    fontSize: 12,
    fontWeight: 500,
    color: palette.fg,
    textDecoration: 'none',
  };

  // Sem linha entre as seções; o espaço em branco separa.
  const sectionRule = 'none';

  // Capas em preto e branco; a cor entra no hover. No celular também
  // fica P&B (a cor aparece ao abrir o vídeo).
  const coverFilter = (hover) => (hover ? 'none' : 'grayscale(1)');
  const pad = (isMobile) => (isMobile ? 20 : 40);

  window.THEME = { palette, fonts, label, heading, body, pill, button, link, sectionRule, pad, coverFilter };
})();
