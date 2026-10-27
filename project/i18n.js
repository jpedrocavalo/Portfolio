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

      works:   'Trabalhos',
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
      openFor: 'Disponível para novos projetos',
    },

    // ── Links de voltar ──
    backToWorks: '← Voltar para trabalhos',
    backToColor: '← Voltar para color',

    // ── About (index.html) ──
    about: {
      bioLabel: 'Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the cut',
      paragraphs: [
        'Comecei querendo um canal no YouTube, tinha menos de dez anos e já montava vídeos no celular sem saber o nome do que fazia. Passei pelos highlights de Fortnite, frame a frame, sem manual, só tentativa. A edição entrou como brincadeira e ficou como linguagem.',
        'Por muito tempo deixei o audiovisual de lado. Outras prioridades, outros caminhos. Mas ele nunca foi embora de verdade, ficou em segundo plano, esperando.',
        'Hoje sou editor freelancer. A escala mudou, a obsessão não, cor, ritmo, o momento exato em que o corte respira certo.',
        'Mais do que técnica, é criação. A pergunta que guia cada projeto não é "como fica bonito?", é "o que fica quando a imagem some?"',
      ],
      viewWork: 'Ver trabalho',
    },

    // ── Bio da página de colorista (sobree.html) ──
    // Mesma história da Sobre, contada pelo lado da cor.
    aboutColorist: {
      bioLabel: 'Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the look',
      role: 'Colorista',
      paragraphs: [
        'Comecei querendo um canal no YouTube, tinha menos de dez anos e já montava vídeos no celular sem saber o nome do que fazia. Mexer na imagem veio junto, puxar o contraste, forçar o azul, tentar chegar no que eu via no cinema. Não sabia que aquilo tinha nome.',
        'Por muito tempo deixei o audiovisual de lado. Outras prioridades, outros caminhos. Mas ele nunca foi embora de verdade, ficou em segundo plano, esperando.',
        'Hoje trato cor como freelancer. A escala mudou, a obsessão não, pele que continua pele, a luz caindo onde tem que cair, o take que não conversa com o anterior e precisa conversar.',
        'Mais do que técnica, é leitura. A pergunta que guia cada projeto não é "como fica bonito?", é "o que essa cor faz quem assiste sentir?"',
      ],
      viewWork: 'Ver o color',
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

    // ── Home (index.html) ──
    home: {
      heroDescription: 'O olhar de montagem que transforma o seu material em lembranças vivas para os seus clientes. Parceria em pós-produção para produtoras de casamentos e eventos que valorizam histórias atemporais e prazos alinhados.',
      scroll:          'Rolar',
      latestWork:      '↗ Último trabalho',
      selectedWorks:   'Trabalhos selecionados',
      seeAll:          'Ver tudo ↗',
      // Colunas ao lado do título da home
      roleLabel:       'Função',
      role:            'Editor',
      locationLabel:   'Base',
      location:        'Natal, RN, Brasil',
      serveLabel:      'Atendimento',
      serve:           'Mundo inteiro',
      servicesLabel:   'Serviços',
      // Cor saiu daqui: o color tem portfólio próprio em /colorist
      services:        ['Edição', 'Edição real time'],
      descriptionLabel:'Descrição',
    },

    // ── Projetos (seção na home + project.html) ──
    projects: {
      label:         'Projetos',
      heading:       'Projetos.',
      videoSingular: 'vídeo',
      videoPlural:   'vídeos',
      soon:          'Em breve',
      videosLabel:   'Vídeos do projeto',
      empty:         'Vídeos sendo adicionados, em breve',
      clientLabel:   'Cliente',
      yearLabel:     'Ano',
      descriptionLabel: 'Descrição',
      back:          '← Voltar para o projeto',
      backHome:      '← Voltar para os projetos',
    },

    // ── Página de vídeo (video.html) ──
    video: {
      latestWork:   'Último trabalho',
      selectedWork: 'Trabalho selecionado',
      categoryLabel:'Categoria',
      yearLabel:    'Ano',
      projectLabel: 'Projeto',
      descriptionLabel: 'Descrição',
    },

    // ── Bloco de color na página de vídeo ──
    colorGrade: {
      label:     'Color',
      heading:   'Tratamento de cor.',
      before:    'Antes',
      after:     'Depois',
      nodes:     'Estrutura de nodes',
      breakdown: 'Breakdown da cor',
      drag:      'arraste para comparar',
      powergrade: 'PowerGrade',
      lut:        'LUT',
      soon:      'Em breve',
    },

    // ── Página de todos os trabalhos (works.html) ──
    works: {
      allWorks:        'Trabalhos selecionados',
      heading:         'Trabalhos selecionados.',
      projectSingular: 'projeto',
      projectPlural:   'projetos',
    },

    // ── Página de colorista (colorist.html) ──
    colorist: {
      label:        'Colorista',
      heading:      'Colorista.',
      roleLabel:    'Função',
      role:         'Colorista',
      servicesLabel:'Serviços',
      services:     ['Tratamento de cor', 'Criação de look', 'Equalização de câmeras'],
      description:  'O tratamento de cor que dá unidade e caráter ao seu material. Parceria de color para produtoras de casamentos e eventos que querem a mesma imagem do primeiro ao último take.',
    },

    // ── Página de short-form ──
    shortform: {
      smallLabel: 'Vertical · Reels · Social',
      heading:    'Short-form.',
      intro:      'Vídeos verticais curtos, clipes para redes sociais. Clique para assistir.',
    },

    // ── Página de categoria (category.html) ──
    category: {
      worksBeingAdded: 'Trabalhos sendo adicionados, em breve',
    },
  },

  en: {
    nav: {
      color:   'Color',

      works:   'Work',
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
      openFor:    'Available for new projects',
    },

    backToWorks: '← Back to work',
    backToColor: '← Back to color',

    about: {
      bioLabel: 'Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the cut',
      paragraphs: [
        "It started with a dream of a YouTube channel, I was under ten, already cutting videos on my phone without knowing what it was called. Then came the Fortnite highlight edits, frame by frame, no manual, just trial. Editing came in as play and stayed as language.",
        "For a long time I set it aside. Other priorities, other paths. But it never really left, it stayed in the background, waiting.",
        "Today I work as a freelance editor. The scale changed, the obsession didn't, color, rhythm, the exact moment a cut breathes right.",
        'More than technique, it\'s creation. The question driving each project isn\'t "how does it look?", it\'s "what stays when the image fades?"',
      ],
      viewWork: 'View work',
    },

    aboutColorist: {
      bioLabel: 'Bio',
      bioHeadingA: 'Finding',
      bioHeadingB: 'the look',
      role: 'Colorist',
      paragraphs: [
        "It started with a dream of a YouTube channel, I was under ten, already cutting videos on my phone without knowing what it was called. Pushing the image came with it, crushing the contrast, forcing the blue, trying to land on what I saw in films. I had no idea that had a name.",
        "For a long time I set it aside. Other priorities, other paths. But it never really left, it stayed in the background, waiting.",
        "Today I grade as a freelancer. The scale changed, the obsession didn't, skin that still reads as skin, light falling where it should, the shot that doesn't talk to the one before it and has to.",
        'More than technique, it\'s reading. The question driving each project isn\'t "how does it look?", it\'s "what does this colour make the viewer feel?"',
      ],
      viewWork: 'See the grades',
    },

    color: {
      heroHeading1: 'Frames',
      heroHeading2: 'between',
      heroHeading3: 'frames.',
      heroDescription: 'Films, commercials, and music videos directed and edited by Jotap. Twelve years finding the cut.',
      moveToReveal: '◐ Move to reveal',
      nowShowing: 'Now showing',
    },

    home: {
      heroDescription: 'The editing eye that turns your footage into living memories for your clients. Post-production partnership for wedding and event production companies that value timeless stories and deadlines that hold.',
      scroll:          'Scroll',
      latestWork:      '↗ Latest work',
      selectedWorks:   'Selected works',
      seeAll:          'See all ↗',
      roleLabel:       'Role',
      role:            'Editor',
      locationLabel:   'Based in',
      location:        'Natal, RN, Brazil',
      serveLabel:      'Working',
      serve:           'Worldwide',
      servicesLabel:   'Services',
      services:        ['Editing', 'Real-time editing'],
      descriptionLabel:'Description',
    },

    projects: {
      label:         'Projects',
      heading:       'Projects.',
      videoSingular: 'video',
      videoPlural:   'videos',
      soon:          'Coming soon',
      videosLabel:   'Videos in this project',
      empty:         'Videos being added, coming soon',
      clientLabel:   'Client',
      yearLabel:     'Year',
      descriptionLabel: 'Description',
      back:          '← Back to the project',
      backHome:      '← Back to projects',
    },

    video: {
      latestWork:   'Latest work',
      selectedWork: 'Selected work',
      categoryLabel:'Category',
      yearLabel:    'Year',
      projectLabel: 'Project',
      descriptionLabel: 'Description',
    },

    colorGrade: {
      label:     'Color',
      heading:   'Color grade.',
      before:    'Before',
      after:     'After',
      nodes:     'Node tree',
      breakdown: 'Grade breakdown',
      drag:      'drag to compare',
      powergrade: 'PowerGrade',
      lut:        'LUT',
      soon:      'Coming soon',
    },

    works: {
      allWorks:        'Selected works',
      heading:         'Selected works.',
      projectSingular: 'project',
      projectPlural:   'projects',
    },

    colorist: {
      label:        'Colorist',
      heading:      'Colorist.',
      roleLabel:    'Role',
      role:         'Colorist',
      servicesLabel:'Services',
      services:     ['Colour grading', 'Look development', 'Camera matching'],
      description:  'The grade that gives your footage one voice and a character of its own. Colour partnership for wedding and event production companies that want the same image from the first shot to the last.',
    },

    shortform: {
      smallLabel: 'Vertical · Reels · Social',
      heading:    'Short-form.',
      intro:      'Short vertical videos, clips for social. Click to play.',
    },

    category: {
      worksBeingAdded: 'Works being added, coming soon',
    },
  },
};

// ── Helpers compartilhados ──

// O <html lang> segue o idioma escolhido — leitor de tela e buscador
// leem isso, e o HTML estático só sabe o padrão (pt-BR).
function aplicaLangNoHtml(lang) {
  try { document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR'; } catch (_) {}
}

window.getInitialLang = function () {
  let lang = 'pt';
  try {
    const saved = localStorage.getItem('jotap_lang');
    if (saved === 'en' || saved === 'pt') lang = saved;
  } catch (_) {}
  aplicaLangNoHtml(lang);
  return lang;
};

// Categoria dos vídeos (videos.js está em inglês). Em PT, traduz o que
// tiver tradução aqui; o que não tiver, aparece como está.
const CATEGORIAS_PT = {
  'Wedding film':        'Filme de casamento',
  'Graduation film':     'Filme de formatura',
  'Pre Wedding Session': 'Ensaio pré-wedding',
  'Aftermovie':          'Aftermovie',
  'Corte':               'Corte',
};
window.tCategory = function (lang, category) {
  if (!category) return category;
  return lang === 'pt' ? (CATEGORIAS_PT[category] || category) : category;
};

/* ════════════════════════════════════════════════════════════════
   TÍTULOS E DESCRIÇÕES EM INGLÊS
   --------------------------------------------------------------
   Os dados (videos.js, projects.js, shortform.js, colorist.js) ficam
   só em português. Quando o idioma é EN, cada texto é procurado aqui,
   pelo texto exato em PT, e trocado pelo inglês. É o mesmo dicionário
   pro ramo de editor e pro de colorista.

   • Nome próprio (Toguro, Cadu Neiva, COBRAC...) não precisa entrar:
     o que não está aqui aparece como está.
   • Trabalho novo? Acrescente o título e a descrição dele aqui.
   • Mudou um texto no videos.js? Mude a chave daqui igual, senão ele
     volta a aparecer em português no EN.
   • "\n" é a quebra de linha da descrição, igual nos dados.
   ════════════════════════════════════════════════════════════════ */
const TEXTOS_EN = {
  // ── Títulos ──
  '1 ano do Posto cobé':                  '1 year of Posto cobé',
  'Making Of da Noiva - Júlia e Ícaro':   "Bride's Making Of - Júlia and Ícaro",
  'Aftermovie - Guará e Graziele':        'Aftermovie - Guará and Graziele',
  'Vender é minha arte':                  'Selling Is My Art',
  'Formatura da Gio':                     "Gio's Graduation",
  'Pre Wedding Thaynara e Ruan':          'Pre Wedding Thaynara and Ruan',
  'São Julhão do Riachuelo Contact Center': 'São Julhão at Riachuelo Contact Center',
  'Corte Pastor Edson - Igreja ADPAZ':    'Pastor Edson Cut - ADPAZ Church',
  'Abertura':                             'Opening',
  'Dia 1':                                'Day 1',
  'Dia 2':                                'Day 2',
  'Dia 3':                                'Day 3',
  'Stand da Altrum':                      'Altrum Stand',
  'Palestra Dr. Alexandre Jácome':        'Talk by Dr. Alexandre Jácome',
  'Materialise dia 1':                    'Materialise Day 1',
  'André e Wanderley':                    'André and Wanderley',

  // ── Descrições ──
  'Trabalho freelancer de edição para Frame Company.\nDireção, direção de fotografia e operação de câmera: Frame Company.':
    'Freelance editing work for Frame Company.\nDirection, cinematography and camera operation: Frame Company.',
  'Trabalho freelancer de edição para Vic Filmes.\nDireção, direção de fotografia e operação de câmera: Vic Filmes.':
    'Freelance editing work for Vic Filmes.\nDirection, cinematography and camera operation: Vic Filmes.',
  'Trabalho de edição para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company':
    'Editing work for the Brazilian Congress of Oral and Maxillofacial Surgery and Traumatology.\n\nrepresenting Frame Company',
  'Trabalho de edição Real Time para o Congresso Brasileiro de cirurgia e traumatologia buco-maxilo facial.\n\nrepresentando a Frame Company':
    'Real Time editing work for the Brazilian Congress of Oral and Maxillofacial Surgery and Traumatology.\n\nrepresenting Frame Company',
  'Trabalho de edição Real Time para o evento Vender é minha arte.\n\nrepresentando a Frame Company':
    'Real Time editing work for the Selling Is My Art event.\n\nrepresenting Frame Company',
  'Trabalho voluntário de edição para a igreja ADPaz - Campus Zona Sul':
    'Volunteer editing work for the ADPaz church - South Zone Campus',
  'Cobertura de edição Real Time e pós-evento no Congresso Brasileiro de Cirurgia e Traumatologia Buco-Maxilo-Facial.':
    'Real Time and post-event editing coverage at the Brazilian Congress of Oral and Maxillofacial Surgery and Traumatology.',
  'Material do Lucas haither':            "Lucas haither's footage",
  'Material do Lucas haither.':           "Lucas haither's footage.",
};

// Devolve o texto no idioma pedido. PT passa direto; EN procura no
// dicionário e, se não achar, devolve o original (nunca fica em branco).
window.tText = function (lang, texto) {
  if (lang !== 'en' || !texto) return texto;
  return TEXTOS_EN[texto] || texto;
};

window.persistLang = function (lang) {
  try { localStorage.setItem('jotap_lang', lang); } catch (_) {}
  aplicaLangNoHtml(lang);
};
