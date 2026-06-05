/* ════════════════════════════════════════════════════════════════
   I18N — Traduções centralizadas (PT/EN)
   --------------------------------------------------------------
   • Carregado por todas as páginas antes do Babel
   • O idioma é persistido em localStorage('jotap_lang')
   • Default: 'pt' (português)
   • Use window.I18N[lang].chave nas páginas
   ════════════════════════════════════════════════════════════════ */

window.I18N = {
  pt: {
    // ── Navegação (header de todas as páginas) ──
    nav: {
      color:   'Color',
      reel:    'Reel',
      about:   'Sobre',
      contact: 'Contato',
    },

    // ── Rodapé ──
    footer: {
      rightsReserved: '© 2026 · Todos os direitos reservados',
    },

    // ── CTA "Vamos conversar" (compartilhada em várias páginas) ──
    contact: {
      smallLabel: 'Entre em contato',
      headingA: 'Vamos',
      headingB: 'conversar',
      openFor: 'Aberto para Q3 / Q4 — 2026',
    },

    // ── Links de voltar ──
    backToReel:  '← Voltar para reel',
    backToColor: '← Voltar para color',

    // ── About (index.html) ──
    about: {
      bioLabel: '01 — Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the cut',
      paragraphs: [
        'Começou cedo, sem manual. A edição entrou como curiosidade — programa aberto, vídeo na timeline — e ficou. O olhar se afinou na repetição: assistir, refazer, refinar, até o corte deixar de ser exercício técnico e virar uma forma de pensar.',
        'Hoje, divide o tempo entre marcas que pedem mais do que um filme bonito — pedem um filme certo — e projetos próprios, onde cor, estrutura e ritmo são decisões livres, não negociações.',
        'Acredita que filme bom é feito de decisões pequenas: onde a câmera respira, qual frame fica, qual matiz se sustenta no preto. Cada projeto começa pela mesma pergunta — que sensação fica depois que a imagem sai do ar?',
      ],
    },

    // ── Color (color.html / v4-projector) ──
    color: {
      heroHeading1: 'Frames',
      heroHeading2: 'entre',
      heroHeading3: 'frames.',
      heroDescription: 'Filmes, comerciais e videoclipes dirigidos e editados pelo Jotap. Doze anos achando o corte.',
      moveToReveal: '◐ Mova para revelar',
      nowShowing: 'Em cena agora',
    },

    // ── Reel (reel.html / v1-showreel) ──
    reel: {
      heroLabel:       '[001] — Editor / Reel 2026',
      heroDescription: 'Construindo histórias cinematográficas para marcas, artistas e o que está entre eles. Disponível para comissões Q3–Q4 2026.',
      scroll:          'Rolar',
      latestWork:      '↗ Último trabalho',
      selectedWorks:   '01 — Trabalhos selecionados',
      seeAll:          'Ver tudo ↗',
    },

    // ── Página de vídeo (video.html) ──
    video: {
      latestWork:   'Último trabalho',
      selectedWork: 'Trabalho selecionado',
    },

    // ── Página de todos os trabalhos (works.html) ──
    works: {
      allWorks:        'Todos os trabalhos',
      heading:         'Trabalhos.',
      projectSingular: 'projeto',
      projectPlural:   'projetos',
    },

    // ── Página de short-form ──
    shortform: {
      smallLabel: 'Vertical · Reels · Social',
      heading:    'Short-form.',
      intro:      'Vídeos verticais curtos — clipes para redes sociais. Clique para assistir.',
    },

    // ── Página de categoria (category.html) ──
    category: {
      worksBeingAdded: 'Trabalhos sendo adicionados — em breve',
    },
  },

  en: {
    nav: {
      color:   'Color',
      reel:    'Reel',
      about:   'About',
      contact: 'Contact',
    },

    footer: {
      rightsReserved: '© 2026 · All rights reserved',
    },

    contact: {
      smallLabel: 'Get in touch',
      headingA:   "Let's",
      headingB:   'talk',
      openFor:    'Open for Q3 / Q4 — 2026',
    },

    backToReel:  '← Back to reel',
    backToColor: '← Back to color',

    about: {
      bioLabel: '01 — Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the cut',
      paragraphs: [
        "Started early, no manual. Editing came in as curiosity — software open, footage on the timeline — and it stayed. The eye sharpened through repetition: watch, redo, refine, until the cut stopped being a technical exercise and became a way of thinking.",
        "Today, time is split between brands that ask for more than a pretty film — they ask for the right film — and personal projects, where color, structure and rhythm are free decisions, not negotiations.",
        "A good film is made of small decisions: where the camera breathes, which frame stays, which hue holds up against the black. Every project starts with the same question — what feeling remains after the image leaves the screen?",
      ],
    },

    color: {
      heroHeading1: 'Frames',
      heroHeading2: 'between',
      heroHeading3: 'frames.',
      heroDescription: 'Films, commercials, and music videos directed and edited by Jotap. Twelve years finding the cut.',
      moveToReveal: '◐ Move to reveal',
      nowShowing: 'Now showing',
    },

    reel: {
      heroLabel:       '[001] — Filmmaker & Editor / Reel 2026',
      heroDescription: 'Crafting cinematic stories for brands, artists, and the in-between. Available for commissions Q3–Q4 2026.',
      scroll:          'Scroll',
      latestWork:      '↗ Latest work',
      selectedWorks:   '01 — Selected works',
      seeAll:          'See all ↗',
    },

    video: {
      latestWork:   'Latest work',
      selectedWork: 'Selected work',
    },

    works: {
      allWorks:        'All works',
      heading:         'Works.',
      projectSingular: 'project',
      projectPlural:   'projects',
    },

    shortform: {
      smallLabel: 'Vertical · Reels · Social',
      heading:    'Short-form.',
      intro:      'Short vertical videos — clips for social. Click to play.',
    },

    category: {
      worksBeingAdded: 'Works being added — coming soon',
    },
  },
};

// ── Helpers compartilhados ──
window.getInitialLang = function () {
  try {
    const saved = localStorage.getItem('jotap_lang');
    return (saved === 'en' || saved === 'pt') ? saved : 'pt';
  } catch (_) { return 'pt'; }
};

window.persistLang = function (lang) {
  try { localStorage.setItem('jotap_lang', lang); } catch (_) {}
};
