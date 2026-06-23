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
        'Comecei querendo um canal no YouTube. Passei pelos highlights de Fortnite — frame a frame, sem manual, só tentativa. A edição entrou como brincadeira e ficou como linguagem.',
        'Hoje sou editor freelancer. A escala mudou, a obsessão não — cor, ritmo, o momento exato em que o corte respira certo.',
        'Mais do que técnica, é criação. A pergunta que guia cada projeto não é "como fica bonito?" — é "o que fica quando a imagem some?"',
      ],
      viewWork: 'Ver trabalho',
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
        "I started with a dream of a YouTube channel. Then came the Fortnite highlight edits — frame by frame, no manual, just trial. Editing came in as play and stayed as language.",
        "Today I work as a freelance editor. The scale changed, the obsession didn't — color, rhythm, the exact moment a cut breathes right.",
        'More than technique, it\'s creation. The question driving each project isn\'t "how does it look?" — it\'s "what stays when the image fades?"',
      ],
      viewWork: 'View work',
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
